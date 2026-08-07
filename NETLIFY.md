# Deployment Guide (Netlify + Render)

This app has two parts:

- **Frontend** (what students/parents/teachers see) → **Netlify**.
- **Backend** (login sessions, saving progress, the database) → **Render**.
  Netlify is a static-file host — it cannot run a live server or database,
  so this piece needs somewhere that can. Render's free tier works fine.

The frontend talks to the backend through a Netlify Edge Function
(`netlify/edge-functions/api-proxy.ts`) that forwards every `/api/*` request
to your Render URL. Because of that, the browser only ever talks to your
Netlify domain — no CORS setup, no cross-site cookie issues, and updating
the backend URL later is just an environment variable change (no code edits,
no `netlify.toml` hand-editing).

Do the backend first (Steps 1–2) — the frontend build doesn't strictly need
the backend URL, but sign-in/progress won't work until it's set.

---

## Step 0: Set up Firebase Authentication

Sign-in (email/password and "Sign in with Google") uses Firebase.

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)**
   → **Add project** (or open an existing one).
2. Left sidebar: **Build → Authentication → Get started**.
3. **Sign-in method** tab → **Email/Password** → toggle on → **Save**. Then
   **Google** → toggle on → **Save**.
4. Gear icon (top left) → **Project settings** → scroll to **"Your apps"**.
   If there's no web app yet, click the **`</>`** icon to add one, give it
   any nickname, **Register app**.
5. Copy the 6 values shown (`apiKey`, `authDomain`, `projectId`,
   `storageBucket`, `messagingSenderId`, `appId`) — you'll paste these into
   Netlify in Step 4.
6. Still in Project settings → **Service accounts** tab → **Generate new
   private key** → **Generate key**. This downloads a `.json` file — you'll
   paste its full contents into Render in Step 2.
7. **Authentication → Settings → Authorized domains** — come back here in
   Step 5 once you have your real Netlify URL.

---

## Step 1: Create a database on Render

1. **[render.com](https://render.com)** → sign up (free).
2. **New +** → **PostgreSQL** → any name → **Free** plan → **Create Database**.
3. Wait ~1 minute. On its page, copy the **Internal Database URL**.

---

## Step 2: Deploy the backend on Render

1. Push this project to GitHub if you haven't yet:
   ```bash
   cd Interactive-Education-Platform-main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Render → **New +** → **Web Service** → connect your GitHub repo.
3. Fill in:
   - **Name**: e.g. `bright-learners-api`
   - **Root Directory**: `artifacts/api-server`
   - **Runtime**: `Node`
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && cd artifacts/api-server && pnpm run build`
   - **Start Command**: `pnpm run start`
   - **Instance Type**: **Free**
4. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Internal Database URL from Step 1.3 |
   | `SESSION_SECRET` | any long random string (40+ chars) |
   | `NODE_ENV` | `production` |
   | `FIREBASE_SERVICE_ACCOUNT` | full contents of the `.json` file from Step 0.6 |
   | `CORS_ORIGIN` | leave blank — not needed, the Netlify proxy makes requests same-origin |
   | `COOKIE_SAMESITE` | `lax` |
5. **Create Web Service**. Wait for the first build to finish.
6. Once **Live**, copy the URL at the top (e.g.
   `https://bright-learners-api-xxxx.onrender.com`) — you need it in Step 3.
7. One-time: create the database tables. Open the **Shell** tab on this
   service and run:
   ```bash
   cd ../../lib/db && pnpm run push
   ```
8. One-time: create the login-session table (a separate table used to keep
   people logged in — needed because Render's free tier restarts the server
   periodically, and in-memory sessions would log everyone out on every
   restart). Still in the Shell tab:
   ```bash
   psql $DATABASE_URL
   ```
   then paste this and press Enter, then type `\q` to exit:
   ```sql
   CREATE TABLE IF NOT EXISTS "session" (
     "sid" varchar NOT NULL COLLATE "default",
     "sess" json NOT NULL,
     "expire" timestamp(6) NOT NULL
   )
   WITH (OIDS=FALSE);
   ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
   ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
   CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
   ```
   (Same SQL also lives in `artifacts/api-server/session-table.sql`.)

**Free tier note**: this server sleeps after 15 min idle and takes 30–60s to
wake on the next request. The $7/month paid tier removes that if it matters.

---

## Step 3: Deploy the frontend on Netlify

1. **[app.netlify.com](https://app.netlify.com)** → **Add new site** →
   **Import an existing project** → connect GitHub → select this repo.
2. Netlify will auto-detect `netlify.toml` (build base, command, and publish
   dir are already configured in this repo) — just confirm and deploy.
3. The first deploy will succeed but sign-in/progress won't work yet — that
   needs Step 4.

---

## Step 4: Add environment variables in Netlify

Site → **Site configuration → Environment variables → Add a variable**:

| Key | Value | Scope |
|---|---|---|
| `BACKEND_URL` | your Render URL from Step 2.6, e.g. `https://bright-learners-api-xxxx.onrender.com` | used by the Edge Function at request time |
| `VITE_FIREBASE_API_KEY` | `apiKey` from Step 0.5 | build time |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` from Step 0.5 | build time |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` from Step 0.5 | build time |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` from Step 0.5 | build time |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` from Step 0.5 | build time |
| `VITE_FIREBASE_APP_ID` | `appId` from Step 0.5 | build time |

Then **Deploys → Trigger deploy → Deploy site** (the `VITE_*` values are
baked in at build time, so a redeploy is needed after adding them —
`BACKEND_URL` alone takes effect immediately since the Edge Function reads
it per-request, no rebuild needed if you change it later).

---

## Step 5: Authorize your Netlify domain in Firebase

Firebase Console → **Authentication → Settings → Authorized domains** →
**Add domain** → paste your Netlify domain (e.g. `your-site.netlify.app`,
just the domain, no `https://`) → **Add**.

Your app is now fully live. Visit your Netlify URL and try signing up.

---

## Step 6 (optional): Custom domain

Netlify → **Domain management** → **Add a domain**, follow the DNS steps
shown. Then repeat Step 5 with your custom domain instead of `*.netlify.app`.

---

## Ongoing updates

Every `git push` to `main` automatically rebuilds and redeploys both the
frontend (Netlify) and backend (Render). Nothing to click, nothing to
drag-and-drop.

## Troubleshooting

- **Sign-in button does nothing / "Firebase is not configured"** → one of
  the 6 `VITE_FIREBASE_*` vars is missing in Netlify, or you deployed before
  adding them (trigger a redeploy).
- **Login works but dashboards/progress/rewards show errors or spin
  forever** → check `BACKEND_URL` is set correctly in Netlify and that the
  Render service shows **Live** (not sleeping/crashed — check its Logs tab).
- **"relation does not exist" errors from the API** → Step 2.7 (`pnpm run
  push`) wasn't run, so the database has no tables yet.
- **Sign-in works locally but not after deploy** → the Netlify domain
  probably isn't in Firebase's Authorized domains list (Step 5).
