# ReachInbox Scheduling Service

Production-grade email scheduling system using BullMQ, Redis, PostgreSQL, and a React + Tailwind dashboard.

## Project Structure

```
backend/   Express + BullMQ scheduler
frontend/  React dashboard
```

## Backend Setup

### 1. Requirements
- Node.js 18+
- Redis
- PostgreSQL

### 2. Environment Variables

Create `backend/.env`:

```
PORT=4000
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgres://postgres:postgres@localhost:5432/reachinbox
EMAIL_SEND_DELAY_MS=2000
EMAIL_RATE_LIMIT_PER_HOUR=200
WORKER_CONCURRENCY=5
ETHEREAL_USER=your_ethereal_user
ETHEREAL_PASS=your_ethereal_pass
APP_BASE_URL=http://localhost:5173
```

> If `ETHEREAL_USER`/`ETHEREAL_PASS` are omitted, a new Ethereal test account is generated at runtime.

### 3. Run the API

```
cd backend
npm install
npm run dev
```

### 4. Run the Worker

```
cd backend
npm run worker
```

### 5. Database Schema

Tables are created automatically on startup.

## Frontend Setup

### 1. Environment Variables

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Run the Dashboard

```
cd frontend
npm install
npm run dev
```

## Architecture Overview

### Scheduling Flow
1. `POST /api/emails/schedule` accepts sender, recipients, subject, body, schedule time, and per-email delay.
2. Emails are stored in Postgres with status `scheduled`.
3. Each recipient is enqueued in BullMQ with a delayed job.
4. BullMQ persists delayed jobs in Redis, so they survive restarts.

### Persistence & Restart Safety
- Emails are stored in Postgres with explicit statuses.
- BullMQ retains delayed jobs in Redis.
- On restart, pending jobs resume without duplication because each job uses `jobId = emailId` and the DB is the source of truth.

### Rate Limiting & Concurrency
- **Worker concurrency** is controlled via `WORKER_CONCURRENCY`.
- **Minimum delay between emails** is enforced via `EMAIL_SEND_DELAY_MS` using BullMQ worker limiter.
- **Hourly rate limit** is enforced per sender via Redis atomic counters:
  - `rate:<sender>:<hour>` counter increments on send.
  - If limit exceeded, job is moved to the next hour window with `moveToDelayed` and status updated to `rate_limited`.

### Under Load
- 1000+ emails scheduled for the same time are accepted; delayed jobs are persisted in Redis.
- When the hourly limit is reached, jobs are deferred to the next hour window and retained in order via their scheduling delays.

## Features Implemented

### Backend
- Email scheduling API (Express + BullMQ)
- PostgreSQL persistence
- Ethereal SMTP delivery
- Configurable worker concurrency
- Configurable delay between sends
- Configurable hourly rate limiting with Redis-backed counters
- Restart-safe queues with job idempotency

### Frontend
- Google OAuth login
- Dashboard tabs (Scheduled, Sent)
- Compose modal with CSV/text lead upload and parsing
- Tables with loading and empty states
- Tailwind styling

## API Reference

### POST `/api/emails/schedule`

```
{
  "sender": "sender@example.com",
  "subject": "Hello",
  "body": "Content",
  "recipients": ["a@example.com", "b@example.com"],
  "scheduledAt": "2024-07-20T10:00:00.000Z",
  "delayBetweenMs": 2000
}
```

### GET `/api/emails?status=scheduled|sent|failed|rate_limited`

Returns email history.

## Notes
- Configure Google OAuth client to allow `http://localhost:5173` as an authorized origin.
- Ethereal previews are logged to the worker console when a message is sent.
