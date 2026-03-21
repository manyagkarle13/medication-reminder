import os
import threading
import time

from .push import send_due_reminders_tick

_worker_started = False


def start_reminder_worker():
    global _worker_started
    if _worker_started:
        return

    # Avoid duplicate thread under Django autoreloader parent process.
    if os.environ.get("RUN_MAIN") != "true":
        return

    _worker_started = True

    def _loop():
        while True:
            try:
                send_due_reminders_tick()
            except Exception:
                pass
            time.sleep(20)

    thread = threading.Thread(target=_loop, daemon=True, name="reminder-worker")
    thread.start()
