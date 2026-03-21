from datetime import datetime
from typing import Any

from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Medicine, PushSubscription, User
from .push import send_push_to_user


def _serialize_medicine(medicine):
    date_value = medicine.date.isoformat() if hasattr(medicine.date, "isoformat") else str(medicine.date)
    return {
        "id": medicine.id,
        "user_id": medicine.user_id,
        "name": medicine.name,
        "dosage": medicine.dosage,
        "date": date_value,
        "time": medicine.time,
        "frequency": medicine.frequency,
        "notes": medicine.notes,
        "taken": medicine.taken,
    }


def _get_user_from_request(request):
    user_id = request.data.get("user_id")
    if user_id is None:
        user_id = request.query_params.get("user_id")

    if user_id in (None, ""):
        return None, Response({"error": "user_id is required"}, status=400)

    user = User.objects.filter(id=user_id).first()
    if not user:
        return None, Response({"error": "User not found"}, status=404)
    return user, None


def _to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in {"true", "1", "yes", "on"}
    return bool(value)


def _get_subscription_payload(request):
    payload = request.data.get("subscription") or {}
    if not isinstance(payload, dict):
        return None, "Invalid subscription payload"

    endpoint = payload.get("endpoint")
    keys = payload.get("keys") or {}
    if not isinstance(keys, dict):
        return None, "Invalid subscription payload"

    p256dh = keys.get("p256dh")
    auth = keys.get("auth")
    if not endpoint or not p256dh or not auth:
        return None, "Invalid subscription payload"
    return {"endpoint": str(endpoint), "p256dh": str(p256dh), "auth": str(auth)}, None


@api_view(["POST"])
def register(request):
    name = (request.data.get("name") or "").strip()
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""

    if not name or not email or not password:
        return Response({"error": "Name, email and password are required"})

    if User.objects.filter(email=email).exists():
        return Response({"error": "User already exists"})

    user = User.objects.create(name=name, email=email, password=password)
    return Response({"id": user.id, "name": user.name, "email": user.email})


@api_view(["POST"])
def login(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""

    if not email or not password:
        return Response({"error": "Email and password are required"})

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"})

    if user.password != password:
        return Response({"error": "Wrong password"})

    return Response({"id": user.id, "name": user.name, "email": user.email})


@api_view(["GET", "POST"])
def medicines(request):
    user, error_response = _get_user_from_request(request)
    if error_response:
        return error_response

    if request.method == "GET":
        items = Medicine.objects.filter(user=user)
        return Response([_serialize_medicine(item) for item in items])

    name = (request.data.get("name") or "").strip()
    date = request.data.get("date")
    time = request.data.get("time")
    dosage = (request.data.get("dosage") or "").strip()
    frequency = (request.data.get("frequency") or "daily").strip() or "daily"
    notes = (request.data.get("notes") or "").strip()
    taken = _to_bool(request.data.get("taken", False))

    if not name or not date or not time:
        return Response({"error": "name, date and time are required"}, status=400)

    try:
        datetime.strptime(date, "%Y-%m-%d")
        datetime.strptime(time, "%H:%M")
    except ValueError:
        return Response({"error": "date must be YYYY-MM-DD and time must be HH:MM"}, status=400)

    medicine = Medicine.objects.create(
        user=user,
        name=name,
        dosage=dosage,
        date=date,
        time=time,
        frequency=frequency,
        notes=notes,
        taken=taken,
    )
    return Response(_serialize_medicine(medicine), status=201)


@api_view(["PATCH", "DELETE"])
def medicine_detail(request, medicine_id):
    user, error_response = _get_user_from_request(request)
    if error_response:
        return error_response

    medicine = Medicine.objects.filter(id=medicine_id, user=user).first()
    if not medicine:
        return Response({"error": "Medicine reminder not found"}, status=404)

    if request.method == "DELETE":
        medicine.delete()
        return Response({"ok": True})

    updatable_fields = ["name", "dosage", "date", "time", "frequency", "notes", "taken"]
    changed_fields = []

    for field in updatable_fields:
        if field not in request.data:
            continue

        value: Any = request.data.get(field)

        if field == "taken":
            medicine.taken = _to_bool(value)
            changed_fields.append("taken")
            continue

        text_value = "" if value is None else str(value).strip()

        if field == "date":
            if not text_value:
                return Response({"error": "date is required"}, status=400)
            try:
                parsed_date = datetime.strptime(text_value, "%Y-%m-%d").date()
            except ValueError:
                return Response({"error": "date must be YYYY-MM-DD"}, status=400)
            medicine.date = parsed_date
            changed_fields.append("date")
            continue

        if field == "time":
            if not text_value:
                return Response({"error": "time is required"}, status=400)
            try:
                datetime.strptime(text_value, "%H:%M")
            except ValueError:
                return Response({"error": "time must be HH:MM"}, status=400)
            medicine.time = text_value
            changed_fields.append("time")
            continue

        if field == "name":
            medicine.name = text_value
            changed_fields.append("name")
        elif field == "dosage":
            medicine.dosage = text_value
            changed_fields.append("dosage")
        elif field == "frequency":
            medicine.frequency = text_value or "daily"
            changed_fields.append("frequency")
        elif field == "notes":
            medicine.notes = text_value
            changed_fields.append("notes")

    if changed_fields:
        medicine.save(update_fields=changed_fields)

    return Response(_serialize_medicine(medicine))


@api_view(["POST"])
def google_login(request):
    email = (request.data.get("email") or "").strip().lower()
    name = (request.data.get("name") or "").strip()
    google_id = (request.data.get("google_id") or "").strip()

    if not email:
        return Response({"error": "Email is required"})

    user, _created = User.objects.get_or_create(
        email=email,
        defaults={
            "name": name,
            "google_id": google_id,
            "password": "",
        },
    )

    updated = False
    if name and user.name != name:
        user.name = name
        updated = True
    if google_id and user.google_id != google_id:
        user.google_id = google_id
        updated = True
    if updated:
        user.save(update_fields=["name", "google_id"])

    return Response({"id": user.id, "name": user.name, "email": user.email})


@api_view(["GET"])
def push_public_key(request):
    key = getattr(settings, "VAPID_PUBLIC_KEY", "")
    if not key:
        return Response({"error": "VAPID_PUBLIC_KEY is not configured"}, status=500)
    return Response({"public_key": key})


@api_view(["POST"])
def push_subscribe(request):
    user, error_response = _get_user_from_request(request)
    if error_response:
        return error_response
    if user is None:
        return Response({"error": "User not found"}, status=404)

    data, payload_error = _get_subscription_payload(request)
    if payload_error:
        return Response({"error": payload_error}, status=400)
    if data is None:
        return Response({"error": "Invalid subscription payload"}, status=400)

    PushSubscription.objects.update_or_create(
        endpoint=data["endpoint"],
        defaults={
            "user": user,
            "p256dh": data["p256dh"],
            "auth": data["auth"],
        },
    )
    return Response({"ok": True})


@api_view(["POST"])
def push_unsubscribe(request):
    user, error_response = _get_user_from_request(request)
    if error_response:
        return error_response
    if user is None:
        return Response({"error": "User not found"}, status=404)

    endpoint = (request.data.get("endpoint") or "").strip()
    if not endpoint:
        return Response({"error": "endpoint is required"}, status=400)

    PushSubscription.objects.filter(user=user, endpoint=endpoint).delete()
    return Response({"ok": True})


@api_view(["POST"])
def push_test(request):
    user, error_response = _get_user_from_request(request)
    if error_response:
        return error_response
    if user is None:
        return Response({"error": "User not found"}, status=404)

    result = send_push_to_user(
        user=user,
        title="Test Reminder",
        body="Web Push is configured correctly for this device.",
        tag=f"test-{user.id}",
    )
    status_code = 200 if result.get("ok") else 500
    return Response(result, status=status_code)


@api_view(["GET"])
def push_status(request):
    user, error_response = _get_user_from_request(request)
    if error_response:
        return error_response
    if user is None:
        return Response({"error": "User not found"}, status=404)

    count = PushSubscription.objects.filter(user=user).count()
    return Response({"subscription_count": count})
