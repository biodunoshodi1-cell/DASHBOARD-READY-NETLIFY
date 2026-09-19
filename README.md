# Adaptive Learning Support — Interactive Education Platform

A pnpm monorepo containing the **Bright Learners** educational web app and its
API server, built for Adaptive Learning Support.

## Structure

```
artifacts/
  bright-learners/   React + Vite frontend (the app kids/parents use)
  api-server/         Express API (auth, progress tracking, rewards, etc.)
  mockup-sandbox/     Design/prototyping sandbox — not part of production
lib/
  db/                 Postgres schema & client (Drizzle ORM)
  api-client-react/   Typed API client generated for the frontend
  api-zod/            Shared request/response validation schemas
```

The frontend and backend are deployed **separately**:
- **Frontend** → GitHub Pages (automatic on push via GitHub Actions)
- **Backend** → a Node.js host with a Postgres database (Render, Railway, Fly, etc.)

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full step-by-step guide,
including connecting your custom domain.

## Local development

```bash
pnpm install

# Backend (needs DATABASE_URL and SESSION_SECRET — see artifacts/api-server/.env.example)
cd artifacts/api-server
cp .env.example .env   # then fill in DATABASE_URL and SESSION_SECRET
PORT=3001 pnpm run dev

# Frontend, in a second terminal
cd artifacts/bright-learners
PORT=5173 BASE_PATH=/ pnpm run dev
```

The frontend expects the API at the same origin by default. For local dev
with the backend on a different port, set `VITE_API_URL=http://localhost:3001`
in `artifacts/bright-learners/.env` (see that folder's `.env.example`).

## Math lessons & the analog clock

Lesson content lives in `artifacts/bright-learners/src/data/lessonContent.ts`.
Time-telling questions use a `clockTime: { hour, minute }` field, which
renders a real analog clock face (`src/components/AnalogClock.tsx`) with
numbers 1–12 instead of a digital time or emoji.
