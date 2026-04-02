# MedRemind - Medication Adherence Planner

A full-stack web application to manage daily medicine schedules with reminders, calendar tracking, and adherence insights.

## Features

- User authentication with email/password and Google login
- Add reminders with medicine name, dosage, date, time, frequency, and notes
- Calendar view with day-wise reminder tracking
- Adherence insights (total, taken, pending)
- Mark reminders as taken/undo per day
- Browser push notifications for due reminders

## Tech Stack

### Frontend
- Next.js
- React

### Backend
- Django
- Django REST Framework
- SQLite (default)

## Project Structure

```text
cloudproject/
|- backend/
|  |- api/
|  |- backend/
|  |- testing/
|  |- manage.py
|  `- requirements.txt
`- frontend/
   |- app/
   |- components/
   |- public/
   `- package.json
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

## Environment Variables

### backend/.env

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### frontend/.env.local

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
```

Never commit `.env` files to version control.
