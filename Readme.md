# 💊 Medication Reminder App

> The Medication Reminder App helps users manage their daily medication schedule and receive 
timely browser push notifications. Built as a full-stack 
web application with a Django REST API backend and a Next.js frontend.

---

## 🌐 Live Demo

| | URL |
|--|--|
| **Frontend** | https://medication-frontend-0bj3.onrender.com |
| **Backend API** | https://medication-backend-tc43.onrender.com |

---

## ✨ Features

- 🔐 User registration and login (email/password + Google OAuth)
- 💊 Add, edit, and delete medication reminders
- 🕐 Set medication name, dosage, date, time, and frequency (once / daily / weekdays)
- ✅ Mark medications as taken per occurrence
- 📊 Medicine adherence tracking with history logs
- 🔔 Browser Push Notifications via Web Push (VAPID) — works in background
- ⚙️ Service Worker for background notification delivery
- 📷 OCR upload support for prescription reading
- 📱 Fully responsive UI

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|--|--|
| Django 6.0 | Web framework |
| Django REST Framework | API layer |
| pywebpush | VAPID Web Push notifications |
| dj-database-url | Database URL config |
| django-cors-headers | CORS management |
| gunicorn | Production WSGI server |
| whitenoise | Static file serving |
| python-decouple | Environment variable management |

### Frontend
| Technology | Purpose |
|--|--|
| Next.js 15 | React framework with App Router |
| Tailwind CSS | Styling |
| Web Push API | Push notification subscription |
| Service Worker | Background notification delivery |

---

## 📁 Project Structure

```
medication-reminder/
├── backend/
│   ├── api/
│   │   ├── models.py          # User, Medicine, PushSubscription, MedicineAdherence
│   │   ├── views.py           # All API endpoints
│   │   ├── push.py            # VAPID Web Push logic
│   │   ├── urls.py            # API routes
│   │   └── migrations/        # Database migrations
│   ├── backend/
│   │   ├── settings.py        # Django config (env-based)
│   │   └── wsgi.py            # WSGI entry point
│   ├── Procfile               # gunicorn startup command
│   ├── requirements.txt       # Python dependencies
│   └── .ebextensions/         # AWS Elastic Beanstalk config
│
└── frontend/
    ├── app/
    │   ├── dashboard/page.js  # Main dashboard UI
    │   ├── login/page.js      # Login page
    │   └── register/page.js   # Register page
    ├── public/
    │   ├── reminder-sw.js     # Service Worker (push notifications)
    │   └── firebase-messaging-sw.js
    ├── lib/
    │   ├── firebase.ts        # Firebase init
    │   └── notifications.ts   # Notification permission handler
    └── next.config.ts         # Next.js config
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--|--|--|
| `POST` | `/api/register/` | Register new user |
| `POST` | `/api/login/` | Login with email & password |
| `POST` | `/api/google-login/` | Login with Google |
| `GET` | `/api/medicines/` | Get all medicines for user |
| `POST` | `/api/medicines/` | Add new medicine reminder |
| `PATCH` | `/api/medicines/:id/` | Update medicine |
| `DELETE` | `/api/medicines/:id/` | Delete medicine |
| `GET` | `/api/push/public-key/` | Get VAPID public key |
| `POST` | `/api/push/subscribe/` | Save push subscription |
| `POST` | `/api/push/unsubscribe/` | Remove push subscription |
| `POST` | `/api/push/test/` | Send test push notification |
| `GET` | `/api/push/status/` | Get subscription count |

---

## 🔔 How Notifications Work

The app uses **VAPID Web Push** — a browser-native push system that works without Firebase:

1. User opens app → browser asks for notification permission
2. App fetches VAPID public key from Django backend (`/api/push/public-key/`)
3. Service Worker (`reminder-sw.js`) subscribes to browser's Push Manager
4. Subscription (endpoint + keys) is saved to Django (`/api/push/subscribe/`)
5. Django sends push via `pywebpush` to browser's push service
6. `reminder-sw.js` receives the push and shows notification — **even if tab is closed**

---

## ⚙️ Local Setup

### Backend

```bash
# 1. Go to backend folder
cd medication-reminder/backend

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
cp .env.example .env
# Fill in the values in .env

# 5. Run migrations
python manage.py migrate

# 6. Start server
python manage.py runserver
```

### Frontend

```bash
# 1. Go to frontend folder
cd medication-reminder/frontend

# 2. Install dependencies
npm install

# 3. Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# 4. Start dev server
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
SECRET_KEY=your-django-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,your-backend-domain.com
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_ADMIN_EMAIL=mailto:admin@yourdomain.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

---

## 🚀 Deployment (Render)

### Backend — Render Web Service
- **Root Directory:** `backend/`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn backend.wsgi --log-file -`
- Set all environment variables in Render dashboard

### Frontend — Render Static Site / Web Service
- **Root Directory:** `frontend/`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- Set `NEXT_PUBLIC_API_URL` to your backend Render URL + `/api`

---

## 🗄️ Database Models

```
User
├── id, name, email, password, google_id

Medicine
├── id, user (FK), name, dosage, date, time
├── frequency (once / daily / weekdays)
├── notes, taken, last_notified_date

MedicineAdherence
├── id, medicine (FK), date, taken_at

PushSubscription
├── id, user (FK), endpoint, p256dh, auth
```

---

## 👩‍💻 Author

**Manya G Karle**

---
