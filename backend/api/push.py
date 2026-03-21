import json
import sys
from datetime import datetime

from django.conf import settings
from django.utils import timezone

from .models import Medicine, PushSubscription

VAPID_PUBLIC_KEY = getattr(settings, "VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = getattr(settings, "VAPID_PRIVATE_KEY", "")
VAPID_ADMIN_EMAIL = getattr(settings, "VAPID_ADMIN_EMAIL", "mailto:admin@example.com")


def _load_webpush_lib():
    try:
        from pywebpush import WebPushException, webpush

        return webpush, WebPushException, None
    except Exception as exc:  # pragma: no cover
        return None, Exception, str(exc)


def push_diagnostics():
    webpush, _exc_cls, import_error = _load_webpush_lib()
    return {
        "python_executable": sys.executable,
        "has_vapid_public": bool(VAPID_PUBLIC_KEY),
        "has_vapid_private": bool(VAPID_PRIVATE_KEY),
        "webpush_import_ok": webpush is not None,
        "webpush_import_error": import_error or "",
    }


def push_available():
    diag = push_diagnostics()
    return (
        diag["has_vapid_public"]
        and diag["has_vapid_private"]
        and diag["webpush_import_ok"]
    )


def _should_send_now(medicine, now_local):
    if medicine.taken:
        return False

    try:
        reminder_time = datetime.strptime(medicine.time, "%H:%M").time()
    except ValueError:
        return False

    today = now_local.date()

    if medicine.frequency == "once":
        if medicine.date != today:
            return False
    else:
        if medicine.date > today:
            return False

    if medicine.frequency == "weekdays" and now_local.weekday() > 4:
        return False

    if medicine.last_notified_date == today:
        return False

    due_at = now_local.replace(
        hour=reminder_time.hour,
        minute=reminder_time.minute,
        second=0,
        microsecond=0,
    )
    late_seconds = (now_local - due_at).total_seconds()
    return 0 <= late_seconds <= 300


def send_push_to_user(user, title, body, tag="medicine-reminder"):
    webpush, WebPushException, import_error = _load_webpush_lib()
    diag = push_diagnostics()

    if not push_available():
        reason = "Web Push not configured."
        if not diag["webpush_import_ok"]:
            reason = f"pywebpush import failed: {import_error or 'unknown error'}"
        elif not diag["has_vapid_public"] or not diag["has_vapid_private"]:
            reason = "VAPID keys are missing in backend settings."
        return {
            "ok": False,
            "error": reason,
            "diagnostics": diag,
        }

    payload = json.dumps({"title": title, "body": body, "tag": tag})
    subscriptions = PushSubscription.objects.filter(user=user)
    sent = 0

    for sub in subscriptions:
        sub_info = {
            "endpoint": sub.endpoint,
            "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
        }
        try:
            webpush(
                subscription_info=sub_info,
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_ADMIN_EMAIL},
            )
            sent += 1
        except WebPushException as exc:
            status = getattr(getattr(exc, "response", None), "status_code", None)
            if status in (404, 410):
                sub.delete()

    return {"ok": True, "sent": sent}


def send_due_reminders_tick():
    if not push_available():
        return

    now_local = timezone.localtime()
    meds = (
        Medicine.objects.select_related("user")
        .filter(taken=False)
        .exclude(time="")
    )
    today = now_local.date()

    for med in meds:
        if not _should_send_now(med, now_local):
            continue

        result = send_push_to_user(
            med.user,
            "Medicine Reminder",
            f"{med.name} ({med.dosage or 'dosage not set'}) now at {med.time}",
            tag=f"medicine-{med.id}-{today.isoformat()}",
        )
        if result.get("ok"):
            med.last_notified_date = today
            med.save(update_fields=["last_notified_date"])
