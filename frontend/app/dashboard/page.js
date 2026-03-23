"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const API_BASE = "http://127.0.0.1:8000/api";

function toInputDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseReminderDateTime(dateText, timeText) {
  const [year, month, day] = dateText.split("-").map(Number);
  const [hour, minute] = timeText.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function reminderAppliesOnDate(entry, dateText) {
  if (!dateText) {
    return false;
  }

  const targetDate = new Date(`${dateText}T00:00:00`);
  const start = new Date(`${entry.date}T00:00:00`);
  if (Number.isNaN(targetDate.getTime()) || Number.isNaN(start.getTime())) {
    return false;
  }

  if (targetDate.getTime() < start.getTime()) {
    return false;
  }

  if (entry.frequency === "weekdays") {
    const day = targetDate.getDay();
    return day >= 1 && day <= 5;
  }

  if (entry.frequency === "once") {
    return dateText === entry.date;
  }

  return true;
}

function isReminderTakenOnDate(entry, dateText) {
  if (!dateText) {
    return false;
  }

  const takenDates = Array.isArray(entry.taken_dates) ? entry.taken_dates : [];
  if (takenDates.includes(dateText)) {
    return true;
  }

  return entry.frequency === "once" && entry.date === dateText && Boolean(entry.taken);
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function DashboardPage() {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [now, setNow] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date()));
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [notes, setNotes] = useState("");

  const [reminders, setReminders] = useState([]);
  const [isLoadingReminders, setIsLoadingReminders] = useState(true);
  const serviceWorkerRegistrationRef = useRef(null);
  const sentNotificationKeysRef = useRef(new Set());

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (!storedUserId) {
      window.location.href = "/login";
      return;
    }

    const storedName = localStorage.getItem("userName") || "there";

    setUserId(storedUserId);
    setUserName(storedName);

    setIsReady(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!("Notification" in window)) {
      return;
    }
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/reminder-sw.js", { updateViaCache: "none" })
      .then((registration) => {
        void registration.update();
        serviceWorkerRegistrationRef.current = registration;
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  }, []);

  const ensurePushSubscription = async () => {
    if (!userId) {
      throw new Error("User is not loaded. Please login again.");
    }
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service worker is not supported in this browser.");
    }
    if (!("PushManager" in window)) {
      throw new Error("Push notifications are not supported in this browser.");
    }
    if (!("Notification" in window) || Notification.permission !== "granted") {
      throw new Error("Notification permission is not granted.");
    }

    const reg = await navigator.serviceWorker.ready;
    serviceWorkerRegistrationRef.current = reg;

    const keyResponse = await fetch(`${API_BASE}/push/public-key/`);
    const keyData = await keyResponse.json();
    if (!keyResponse.ok) {
      throw new Error(keyData.error || "Push public key is not configured");
    }

    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.public_key),
      });
    }

    const response = await fetch(`${API_BASE}/push/subscribe/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        subscription: subscription.toJSON(),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Push subscription save failed");
    }
  };

  useEffect(() => {
    if (!selectedDate) {
      return;
    }
    const [y, m] = selectedDate.split("-").map(Number);
    if (!y || !m) {
      return;
    }
    setCurrentMonth(new Date(y, m - 1, 1));
  }, [selectedDate]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isMounted = true;
    const loadMedicines = async () => {
      setIsLoadingReminders(true);
      try {
        const response = await fetch(`${API_BASE}/medicines/?user_id=${userId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not fetch reminders");
        }
        if (isMounted) {
          setReminders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          alert(error.message || "Could not load reminders from backend.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingReminders(false);
        }
      }
    };

    loadMedicines();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const tick = () => {
      const nowDate = new Date();
      reminders.forEach((entry) => {
        const todayText = toInputDate(nowDate);
        if (
          isReminderTakenOnDate(entry, todayText) ||
          !reminderAppliesOnDate(entry, todayText)
        ) {
          return;
        }

        const [hour, minute] = (entry.time || "").split(":").map(Number);
        if (Number.isNaN(hour) || Number.isNaN(minute)) {
          return;
        }

        const dueAt = new Date(
          nowDate.getFullYear(),
          nowDate.getMonth(),
          nowDate.getDate(),
          hour,
          minute,
          0,
          0,
        );

        const secondsLate = (nowDate.getTime() - dueAt.getTime()) / 1000;
        const shouldFireNow = secondsLate >= 0 && secondsLate <= 5 * 60;
        if (!shouldFireNow) {
          return;
        }

        const key = `${userId}:${entry.id}:${toInputDate(nowDate)}`;
        if (sentNotificationKeysRef.current.has(key)) {
          return;
        }
        sentNotificationKeysRef.current.add(key);

        void fireDeviceNotification(
          "Medicine Reminder",
          `${entry.name} (${entry.dosage || "dosage not set"}) now at ${entry.time}`,
          `${entry.id}-${toInputDate(nowDate)}`,
        );
      });
    };

    tick();
    const intervalId = setInterval(tick, 5000);
    return () => clearInterval(intervalId);
  }, [reminders, userId]);

  const fireDeviceNotification = async (title, body, tag = "med-reminder") => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return false;
    }

    const options = {
      body,
      tag,
      renotify: true,
      requireInteraction: true,
      icon: "/next.svg",
      badge: "/next.svg",
    };

    try {
      if (serviceWorkerRegistrationRef.current) {
        await serviceWorkerRegistrationRef.current.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    } catch (error) {
      console.error("Device notification failed:", error);
      return false;
    }

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([250, 120, 250]);
    }
    return true;
  };

  const autoEnablePush = useEffectEvent(async () => {
    if (!("Notification" in window)) {
      return;
    }
    if (!userId) {
      return;
    }

    if (Notification.permission === "granted") {
      await ensurePushSubscription();
      return;
    }

    if (Notification.permission === "denied") {
      return;
    }

    const promptKey = `pushPrompted:${userId}`;
    if (localStorage.getItem(promptKey) === "1") {
      return;
    }

    localStorage.setItem(promptKey, "1");
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      await ensurePushSubscription();
    }
  });

  useEffect(() => {
    if (!userId) {
      return;
    }
    autoEnablePush().catch((error) => {
      console.error("Automatic push setup failed:", error);
    });
  }, [userId]);

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [currentMonth]);

  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => {
      const d1 = parseReminderDateTime(a.date, a.time).getTime();
      const d2 = parseReminderDateTime(b.date, b.time).getTime();
      return d1 - d2;
    });
  }, [reminders]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) {
      return "";
    }

    const selected = new Date(`${selectedDate}T00:00:00`);
    return selected.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDate]);

  const remindersForSelectedDate = useMemo(() => {
    return sortedReminders
      .filter((entry) => reminderAppliesOnDate(entry, selectedDate))
      .map((entry) => ({
        ...entry,
        dayDateTime: parseReminderDateTime(selectedDate, entry.time),
        isTakenForSelectedDate: isReminderTakenOnDate(entry, selectedDate),
      }))
      .sort((a, b) => a.dayDateTime.getTime() - b.dayDateTime.getTime());
  }, [selectedDate, sortedReminders]);

  const todayPendingCount = useMemo(() => {
    const today = toInputDate(new Date());
    return reminders
      .filter((entry) => reminderAppliesOnDate(entry, today))
      .filter((entry) => !isReminderTakenOnDate(entry, today)).length;
  }, [reminders]);

  const insightData = useMemo(() => {
    const total = remindersForSelectedDate.length;
    const taken = remindersForSelectedDate.filter((entry) => entry.isTakenForSelectedDate).length;
    const pending = total - taken;
    const completion = total === 0 ? 0 : Math.round((taken / total) * 100);

    const isSelectedToday = selectedDate === toInputDate(new Date());
    const compareTime = isSelectedToday ? new Date() : new Date(`${selectedDate}T00:00:00`);
    const nextReminder = remindersForSelectedDate
      .filter((entry) => !entry.isTakenForSelectedDate)
      .filter((entry) => entry.dayDateTime.getTime() >= compareTime.getTime())
      .sort((a, b) => a.dayDateTime.getTime() - b.dayDateTime.getTime())[0];

    return { total, taken, pending, completion, nextReminder };
  }, [remindersForSelectedDate, selectedDate]);

  const daySummaries = useMemo(() => {
    const summary = {};
    reminders.forEach((entry) => {
      const start = new Date(`${entry.date}T00:00:00`);
      if (Number.isNaN(start.getTime())) {
        return;
      }

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day += 1) {
        const dateText = toInputDate(new Date(year, month, day));
        if (!reminderAppliesOnDate(entry, dateText)) {
          continue;
        }

        if (!summary[dateText]) {
          summary[dateText] = { total: 0, taken: 0 };
        }
        summary[dateText].total += 1;
        if (isReminderTakenOnDate(entry, dateText)) {
          summary[dateText].taken += 1;
        }
      }
    });
    return summary;
  }, [currentMonth, reminders]);

  const addReminder = async (event) => {
    event.preventDefault();

    if (!name.trim() || !selectedDate || !time) {
      alert("Please add medicine name, date and time.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/medicines/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: name.trim(),
          dosage: dosage.trim(),
          date: selectedDate,
          time,
          frequency,
          notes: notes.trim(),
          taken: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not add reminder");
      }

      setReminders((prev) => [...prev, data]);
      setName("");
      setDosage("");
      setTime("");
      setFrequency("daily");
      setNotes("");
    } catch (error) {
      alert(error.message || "Could not save reminder to backend.");
    }
  };

  const toggleTaken = async (id) => {
    const currentEntry = reminders.find((entry) => entry.id === id);
    if (!currentEntry) {
      return;
    }

    const nextTakenValue = !isReminderTakenOnDate(currentEntry, selectedDate);

    try {
      const response = await fetch(`${API_BASE}/medicines/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          occurrence_date: selectedDate,
          taken: nextTakenValue,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not update reminder");
      }

      setReminders((prev) => prev.map((entry) => (entry.id === id ? data : entry)));
    } catch (error) {
      alert(error.message || "Could not update reminder in backend.");
    }
  };

  const removeReminder = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/medicines/${id}/?user_id=${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not delete reminder");
      }

      setReminders((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      alert(error.message || "Could not delete reminder from backend.");
    }
  };

  const goToMonth = (direction) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    );
  };

  const chooseDateFromCalendar = (date) => {
    const dateText = toInputDate(date);
    setSelectedDate(dateText);
  };

  if (!isReady) {
    return null;
  }

  return (
    <>
      <main className="dash-shell">
        <section className="topbar">
          <div>
            <p className="mini-label">Medication planner</p>
            <h1>{`Welcome, ${userName}.`}</h1>
            <p className="muted">Plan medicine reminders with calendar date and exact time.</p>
          </div>
          <div className="topbar-right">
            <button type="button" className="logout-btn" onClick={logout}>
              Log out
            </button>
            <div className="clock-card">
              <p>{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
              <strong>{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</strong>
            </div>
          </div>
        </section>

        <section className="board-grid">
          <div className="column-stack">
            <article className="card calendar-card">
              <div className="card-head">
                <h2>Calendar</h2>
                <div className="month-nav">
                  <button type="button" onClick={() => goToMonth(-1)}>
                    Prev
                  </button>
                  <strong>{`${MONTHS[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`}</strong>
                  <button type="button" onClick={() => goToMonth(1)}>
                    Next
                  </button>
                </div>
              </div>

              <div className="weekdays">
                {WEEK_DAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarCells.map((dayDate, index) => {
                  if (!dayDate) {
                    return <span className="blank" key={`blank-${index}`} />;
                  }

                  const iso = toInputDate(dayDate);
                  const isSelected = iso === selectedDate;
                  const isToday = iso === toInputDate(new Date());
                  const daySummary = daySummaries[iso];
                  const hasEntries = Boolean(daySummary?.total);
                  const allTaken = hasEntries && daySummary.taken === daySummary.total;
                  const partiallyTaken = hasEntries && daySummary.taken > 0 && daySummary.taken < daySummary.total;

                  return (
                    <button
                      type="button"
                      key={iso}
                      className={`day-btn ${isSelected ? "selected" : ""} ${isToday ? "today" : ""} ${hasEntries ? "has-entries" : ""} ${allTaken ? "all-taken" : ""} ${partiallyTaken ? "partial-taken" : ""}`}
                      onClick={() => chooseDateFromCalendar(dayDate)}
                    >
                      {dayDate.getDate()}
                      {hasEntries && (
                        <span className="day-pill">
                          {daySummary.taken}/{daySummary.total}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="selected-date">Selected date: {selectedDate}</div>
            </article>

            <article className="card insights-card">
              <div className="insights-head">
                <h2>Adherence insights</h2>
                <strong>{insightData.completion}%</strong>
              </div>
              <div className="insight-bar">
                <span style={{ width: `${insightData.completion}%` }} />
              </div>

              <div className="insight-grid">
                <div>
                  <p>Total reminders</p>
                  <strong>{insightData.total}</strong>
                </div>
                <div>
                  <p>Taken</p>
                  <strong>{insightData.taken}</strong>
                </div>
                <div>
                  <p>Pending</p>
                  <strong>{insightData.pending}</strong>
                </div>
              </div>

              {insightData.nextReminder ? (
                <p className="next-reminder">
                  Next: {insightData.nextReminder.name} at{" "}
                  {insightData.nextReminder.dayDateTime.toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              ) : (
                <p className="next-reminder">No upcoming pending reminder.</p>
              )}
            </article>
          </div>

          <article className="card form-card">
            <h2>Add medicine reminder</h2>
            <form onSubmit={addReminder}>
              <label htmlFor="med-name">Medicine name</label>
              <input
                id="med-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Metformin"
              />

              <label htmlFor="med-dosage">Dosage</label>
              <input
                id="med-dosage"
                type="text"
                value={dosage}
                onChange={(event) => setDosage(event.target.value)}
                placeholder="Example: 1 tablet"
              />

              <div className="split-row">
                <div>
                  <label htmlFor="med-date">Date</label>
                  <input
                    id="med-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="med-time">Reminder time</label>
                  <input
                    id="med-time"
                    type="time"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                  />
                </div>
              </div>

              <label htmlFor="med-frequency">Frequency</label>
              <select
                id="med-frequency"
                value={frequency}
                onChange={(event) => setFrequency(event.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="once">One-time</option>
                <option value="weekdays">Weekdays</option>
              </select>

              <label htmlFor="med-notes">Notes (optional)</label>
              <textarea
                id="med-notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="With food, before sleep, etc."
              />

              <button className="primary" type="submit">
                Add reminder
              </button>
            </form>
          </article>
        </section>

        <section className="list-row">
          <article className="card summary-card">
            <h2>{selectedDate === toInputDate(new Date()) ? "Today" : "Selected day"}</h2>
            <p className="summary-number">{insightData.pending}</p>
            <p className="muted">
              {selectedDate === toInputDate(new Date())
                ? "pending reminders left today"
                : `pending reminders for ${selectedDateLabel}`}
            </p>
            <p className="summary-meta">{`${insightData.taken}/${insightData.total} completed on ${selectedDateLabel || selectedDate}`}</p>
          </article>

          <article className="card list-card">
            <h2>{`Scheduled reminders for ${selectedDateLabel || selectedDate}`}</h2>
            {isLoadingReminders ? (
              <p className="muted">Loading reminders...</p>
            ) : reminders.length === 0 ? (
              <p className="muted">No reminders yet. Add your first medicine above.</p>
            ) : remindersForSelectedDate.length === 0 ? (
              <p className="muted">No reminders are scheduled for this date.</p>
            ) : (
              <ul className="reminder-list">
                {remindersForSelectedDate.map((entry) => (
                  <li key={`${entry.id}-${selectedDate}`} className={entry.isTakenForSelectedDate ? "taken" : ""}>
                    <div>
                      <strong>{entry.name}</strong>
                      <p>{entry.dosage || "Dosage not specified"}</p>
                      <small>{`${selectedDate} at ${entry.time} | ${entry.frequency}`}</small>
                      {entry.notes && <small>{entry.notes}</small>}
                    </div>
                    <div className="actions">
                      <button type="button" onClick={() => toggleTaken(entry.id)}>
                        {entry.isTakenForSelectedDate ? "Undo" : "Mark taken"}
                      </button>
                      <button type="button" className="danger" onClick={() => removeReminder(entry.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </main>

      <style jsx>{`
        .dash-shell {
          --ink-900: #1f2b44;
          --ink-700: #3b4a70;
          --ink-500: #64769d;
          --surface: rgba(255, 253, 249, 0.74);
          --line: rgba(143, 158, 193, 0.35);
          --accent: #ff8440;
          --accent-2: #5a93ff;

          min-height: 100vh;
          padding: 28px;
          background:
            radial-gradient(circle at 10% 8%, rgba(255, 255, 255, 0.78), transparent 32%),
            radial-gradient(circle at 90% 90%, rgba(255, 176, 130, 0.2), transparent 36%),
            linear-gradient(145deg, #fff0eb 0%, #ffe7de 45%, #ffeee4 100%);
          color: var(--ink-900);
          font-family: "Sora", "Manrope", "Segoe UI", sans-serif;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .topbar-right {
          display: grid;
          gap: 10px;
          justify-items: end;
          margin-top: 10px;
        }

        .mini-label {
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 0.72rem;
          color: rgba(59, 74, 112, 0.6);
        }

        h1 {
          margin: 8px 0 8px;
          font-size: clamp(1.8rem, 3.8vw, 2.4rem);
          letter-spacing: -0.03em;
        }

        .muted {
          margin: 0;
          color: var(--ink-500);
          line-height: 1.5;
        }

        .clock-card {
          min-width: 280px;
          border: 1px solid var(--line);
          background: var(--surface);
          border-radius: 18px;
          padding: 14px;
          box-shadow: 0 20px 44px rgba(101, 82, 87, 0.13);
        }

        .clock-card p {
          margin: 0;
          color: var(--ink-700);
          font-size: 0.9rem;
        }

        .clock-card strong {
          display: block;
          margin-top: 6px;
          font-size: 1.42rem;
          letter-spacing: -0.02em;
        }

        .logout-btn {
          margin-top: 0;
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          background: rgba(255, 127, 73, 0.18);
          color: #9f381c;
          font-weight: 700;
          cursor: pointer;
        }

        .board-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
          align-items: start;
        }

        .column-stack {
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .card {
          border: 1px solid var(--line);
          background: var(--surface);
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 28px 56px rgba(101, 82, 87, 0.14);
          backdrop-filter: blur(8px);
        }

        .calendar-card {
          height: fit-content;
        }

        .insights-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 10px;
        }

        .insights-head strong {
          font-size: 1.6rem;
          color: #ff7f49;
          letter-spacing: -0.02em;
        }

        .insight-bar {
          height: 10px;
          border-radius: 999px;
          background: rgba(143, 158, 193, 0.24);
          overflow: hidden;
          margin-bottom: 14px;
        }

        .insight-bar span {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, #ff9f61, #ff7f49);
          transition: width 0.3s ease;
        }

        .insight-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 10px;
        }

        .insight-grid div {
          border: 1px solid rgba(143, 158, 193, 0.24);
          background: rgba(255, 255, 255, 0.82);
          border-radius: 12px;
          padding: 10px;
        }

        .insight-grid p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--ink-500);
        }

        .insight-grid strong {
          display: block;
          margin-top: 5px;
          font-size: 1.1rem;
        }

        .next-reminder {
          margin: 0;
          color: var(--ink-700);
          font-weight: 600;
        }

        .card h2 {
          margin: 0 0 14px;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
        }

        .card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }

        .month-nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .month-nav button {
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.8);
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
        }

        .month-nav strong {
          min-width: 150px;
          text-align: center;
          font-size: 0.9rem;
        }

        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          margin-bottom: 8px;
        }

        .weekdays span {
          text-align: center;
          color: rgba(59, 74, 112, 0.66);
          font-size: 0.8rem;
          font-weight: 700;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }

        .blank {
          height: 40px;
        }

        .day-btn {
          position: relative;
          height: 40px;
          border: 1px solid rgba(143, 158, 193, 0.26);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          cursor: pointer;
          color: var(--ink-700);
          font-weight: 600;
        }

        .day-btn.today {
          border-color: rgba(90, 147, 255, 0.56);
        }

        .day-btn.has-entries {
          min-height: 54px;
          padding-bottom: 14px;
        }

        .day-btn.selected {
          background: linear-gradient(135deg, #ff9f61, #ff8041);
          color: #fff;
          border-color: transparent;
        }

        .day-btn.all-taken {
          box-shadow: inset 0 -4px 0 rgba(55, 168, 106, 0.24);
        }

        .day-btn.partial-taken {
          box-shadow: inset 0 -4px 0 rgba(255, 159, 97, 0.3);
        }

        .day-pill {
          position: absolute;
          left: 50%;
          bottom: 5px;
          transform: translateX(-50%);
          font-size: 0.63rem;
          line-height: 1;
          padding: 2px 5px;
          border-radius: 999px;
          background: rgba(31, 43, 68, 0.08);
          color: inherit;
        }

        .selected-date {
          margin-top: 12px;
          color: var(--ink-700);
          font-weight: 600;
        }

        form {
          display: grid;
          gap: 8px;
        }

        label {
          color: var(--ink-700);
          font-weight: 700;
          font-size: 0.9rem;
          margin-top: 3px;
        }

        input,
        select,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid var(--line);
          background: rgba(255, 255, 255, 0.9);
          border-radius: 14px;
          padding: 12px 12px;
          color: var(--ink-900);
          font: inherit;
          outline: none;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: rgba(90, 147, 255, 0.74);
          box-shadow: 0 0 0 4px rgba(90, 147, 255, 0.16);
        }

        textarea {
          resize: vertical;
        }

        .split-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .primary {
          margin-top: 8px;
          border: none;
          border-radius: 14px;
          padding: 12px 16px;
          font-weight: 700;
          background: linear-gradient(135deg, #ff9c5e 0%, #ff7f49 100%);
          color: #fff;
          cursor: pointer;
          box-shadow: 0 16px 30px rgba(255, 127, 73, 0.28);
        }

        .list-row {
          display: grid;
          grid-template-columns: 0.4fr 1fr;
          gap: 18px;
        }

        .summary-number {
          margin: 6px 0;
          font-size: 2.4rem;
          line-height: 1;
          color: #ff7f49;
          font-weight: 800;
        }

        .summary-meta {
          margin: 10px 0 0;
          color: var(--ink-700);
          font-weight: 600;
        }

        .reminder-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 10px;
        }

        .reminder-list li {
          border: 1px solid rgba(143, 158, 193, 0.28);
          background: rgba(255, 255, 255, 0.82);
          border-radius: 14px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }

        .reminder-list li.taken {
          opacity: 0.62;
        }

        .reminder-list strong {
          display: block;
          margin: 0;
          font-size: 1rem;
        }

        .reminder-list p {
          margin: 4px 0;
          color: var(--ink-700);
        }

        .reminder-list small {
          display: block;
          color: var(--ink-500);
          margin-top: 2px;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .actions button {
          border: none;
          border-radius: 10px;
          padding: 8px 10px;
          font-weight: 700;
          cursor: pointer;
          background: rgba(90, 147, 255, 0.16);
          color: #23459c;
        }

        .actions .danger {
          background: rgba(255, 127, 73, 0.18);
          color: #a33b1d;
        }

        @media (max-width: 1100px) {
          .board-grid,
          .list-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .dash-shell {
            padding: 16px;
          }

          .topbar {
            flex-direction: column;
          }

          .clock-card {
            min-width: auto;
            width: 100%;
          }

          .split-row {
            grid-template-columns: 1fr;
          }

          .card {
            padding: 16px;
            border-radius: 16px;
          }

          .month-nav strong {
            min-width: 124px;
          }

          .reminder-list li {
            flex-direction: column;
          }

          .actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  );
}
