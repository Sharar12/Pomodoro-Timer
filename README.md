# Pomodoro Timer

A full-stack Pomodoro Timer web application built with **Next.js** (frontend) + **Laravel** (backend) + **MySQL**. Boost your productivity by working in focused intervals with scheduled breaks.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Laravel 12, PHP 8.2+
- **Database**: MySQL (via XAMPP)

## Features

- **Pomodoro Timer** with default 25 min focus / 5 min short break / 15 min long break cycles
- **Customizable durations** (1–120 minutes per session type), saved to browser localStorage
- **4-session cycle**: Focus → Short Break → Focus → Short Break → Focus → Short Break → Focus → Long Break
- **Audio beep** notification when a session completes
- **Browser Notification API** support
- **Today's statistics** — sessions completed and total focus minutes
- **Session history** — last 20 completed sessions
- **Backend logging** via REST API

## Setup

### Prerequisites

- PHP 8.2+, Composer, Node.js
- XAMPP (MySQL running on port 3306)

### 1. Database

Create a MySQL database named `pomodoro_timer`.

### 2. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env   # DB_DATABASE is already set to pomodoro_timer
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API

| Method | Endpoint                  | Body                                                    | Description                  |
|--------|---------------------------|---------------------------------------------------------|------------------------------|
| POST   | `/api/pomodoro/log`       | `{ "session_type", "duration_seconds", "session_number" }` | Log a completed session    |
| GET    | `/api/pomodoro/stats`     | —                                                       | Get today's focus statistics |
| GET    | `/api/pomodoro/history`   | —                                                       | Get last 20 session logs     |

## Project Structure

```
Pomodoro Timer/
├── frontend/                   # Next.js app
│   └── app/
│       ├── pomodoro/           # Main timer component
│       ├── layout.tsx          # Root layout
│       ├── page.tsx            # Home page
│       └── globals.css          # Global styles
├── backend/                    # Laravel API
│   └── app/
│       ├── Http/Controllers/
│       │   └── PomodoroController.php
│       ├── Models/
│       │   └── PomodoroSession.php
│       └── database/migrations/
│           └── ...create_pomodoro_sessions_table.php
└── README.md
```

<!-- [2024-06-05] feat: initialize Pomodoro timer app structure and state machine -->

<!-- [2024-06-05] feat: implement 25-minute focus and 5-minute break cycles -->

<!-- [2024-06-15] feat: add daily session counter and customizable interval lengths -->

<!-- [2024-06-15] feat: implement browser audio chimes for session completion -->

<!-- [2024-06-28] style: polish minimalist dashboard UI and focus statistics -->
