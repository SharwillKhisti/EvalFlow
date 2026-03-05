# Virtual Lab Assistant

AI-assisted learning platform with structured hinting and instructor analytics.

## 🚀 Features

- Course & assignment management
- Progressive AI hinting (no direct solutions)
- Submission tracking with anti-copy monitoring
- Instructor performance reports
- Universal practice AI

## 🛠 Tech Stack

Frontend:
- React (Vite)
- TailwindCSS

Backend:
- FastAPI (Python)

Database:
- Supabase (PostgreSQL)

Deployment:
- Vercel (Frontend)
- Render (Backend)

---

## 🧩 Setup Instructions

### 1️⃣ Clone Repository

git clone <repo_url>
cd virtual-lab-assistant

---

### 2️⃣ Backend Setup

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Create `.env` file:

DATABASE_URL=
SUPABASE_KEY=
LLM_API_KEY=

Run:

uvicorn app.main:app --reload

---

### 3️⃣ Frontend Setup

cd frontend
npm install
npm run dev

---

### 4️⃣ Supabase Setup

- Create project
- Run `schema.sql`
- Add connection string to backend `.env`

---

## 📂 Folder Structure

backend/
frontend/
database/
docs/

---

## 🤝 Contribution Guidelines

- Create feature branch
- PR required for merge
- Follow naming conventions