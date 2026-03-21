# MedRemind — Medication Adherence Planner
 
A full-stack web application that helps users track and manage their daily medication schedules with calendar-based reminders, adherence insights, and Google authentication.
 
---
 
## Features
 
- User authentication via email/password and Google OAuth
- Medicine reminders with name, dosage, date, time, and frequency
- Interactive calendar with month view and date selection
- Adherence insights tracking total, taken, and pending reminders
- Scheduled reminder list with mark as taken and undo support
- Real-time clock display on the dashboard
 
---
 
## Tech Stack
 
### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
 
### Backend
- Django 6.0
- Django REST Framework
- JWT Authentication
- SQLite (development) / PostgreSQL (production)
 
### Infrastructure
- AWS EC2 — Django application server (Nginx + Gunicorn)
- AWS RDS — PostgreSQL managed database
- AWS S3 + CloudFront — Frontend static hosting and CDN
- AWS CodePipeline + CodeBuild — CI/CD pipeline
 
---
 
## Project Structure
 
```
cloudproject/
├── backend/
│   ├── api/              # REST API endpoints
│   ├── backend/          # Django settings and URLs
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── app/              # Next.js App Router pages
    ├── components/       # Reusable UI components
    ├── services/         # API service layer
    ├── public/           # Static assets
    └── package.json
```
 
---
 
## Getting Started
 
### Prerequisites
 
- Python 3.10+
- Node.js 18+
- pip
 
### 1. Clone the Repository
 
```bash
git clone https://github.com/manyagkarle13/medication-reminder.git
cd medication-reminder
```
 
### 2. Backend Setup
 
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
 
Backend runs at: `http://localhost:8000`
 
### 3. Frontend Setup
 
```bash
cd frontend
npm install
npm run dev
```
 
Frontend runs at: `http://localhost:3000`
 
---
 
## Environment Variables
 
Create a `.env` file in the `backend/` directory:
 
```env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=your-database-url
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
 
Create a `.env.local` file in the `frontend/` directory:
 
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```
 
Never commit `.env` files to version control.