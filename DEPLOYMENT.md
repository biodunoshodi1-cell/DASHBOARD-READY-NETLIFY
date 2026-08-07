# Deployment Guide (GitHub Pages + Render)

> **Prefer Netlify for the frontend?** See `NETLIFY_DEPLOYMENT.md` instead —
> same backend/Firebase setup, Netlify-specific frontend steps. Don't follow
> both guides on the same repo; pick one frontend host.

This app has two parts, and they live in two different places:

- **Frontend** (what students see and click) → **GitHub Pages**. This is
  hosted directly by GitHub, for free, and redeploys automatically every time
  you push — no third-party account needed for this part.
- **Backend** (login, saving progress, the database) → **Render**. GitHub
  cannot run this part — GitHub only stores and serves files, it can't run a
  live server or database. Render is a place that can. This is the one piece
  that genuinely needs an outside service; there's no way around that for any
  app with real accounts and saved progress.

Do the backend first (steps 1–2) — the frontend needs its web address.

Every step below tells you exactly which button to click. Take it one step
at a time.

---

## Step 0: Set up Firebase Authentication

Sign-in (email/password and "Sign in with Google") uses Firebase. Do this
first so you have the values the later steps ask for.

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)**
   and click **Add project** (or open an existing one).
2. In the left sidebar: **Build → Authentication → Get started**.
3. Click the **Sign-in method** tab. Click **Email/Password** → toggle it on
   → **Save**. Then click **Google** → toggle it on → **Save**.
4. Click the **gear icon** (top left, next to "Project Overview") →
   **Project settings**.
5. Scroll down to **"Your apps"**. If there's no web app yet, click the
   **`</>`** (web) icon to add one, give it any nickname, click **Register app**.
6. You'll now see a code block with values like `apiKey: "..."`. Write these
   6 values down somewhere — you'll paste them into GitHub in Step 4:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
7. Still in Project settings, click the **Service accounts** tab → click
   **Generate new private key** → click **Generate key**. This downloads a
   `.json` file — keep it, you'll need its full contents in Step 2.
8. Click the **General** tab, or go to **Authentication → Settings →
   Authorized domains**. You'll come back here in Step 5 to add your real
   web address once you have one — you can't do that step yet.

---

## Step 1: Create a database on Render

1. Go to **[render.com](https://render.com)** and sign up (free).
2. Click **New +** (top right) → **PostgreSQL**.
3. Give it any name → choose the **Free** plan → click **Create Database**.
4. Wait about a minute for it to finish setting up. On its page, find
   **Internal Database URL** and copy it — you'll paste it in the next step.

---

## Step 2: Deploy the backend on Render

1. First, push this project to GitHub if you haven't yet:
   ```bash
   cd Interactive-Education-Platform-main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
   (Skip the first line if you already have a remote set up.)
2. Back in Render: click **New +** → **Web Service**.
3. Click **Connect account** to link GitHub if you haven't, then find and
   select your repository.
4. Fill in these fields:
   - **Name**: anything, e.g. `bright-learners-api`
   - **Root Directory**: `artifacts/api-server`
   - **Runtime**: `Node`
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && cd artifacts/api-server && pnpm run build`
   - **Start Command**: `pnpm run start`
   - **Instance Type**: **Free**
5. Scroll down to **Environment Variables** → click **Add Environment
   Variable** for each of these:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | the Internal Database URL from Step 1.4 |
   | `SESSION_SECRET` | any long random text — mash your keyboard for 40+ characters |
   | `NODE_ENV` | `production` |
   | `FIREBASE_SERVICE_ACCOUNT` | open the `.json` file from Step 0.7, copy **everything** inside it, paste it here |
   | `CORS_ORIGIN` | leave blank for now — you'll come back and fill this in during Step 4 |
   | `COOKIE_SAMESITE` | `none` |
6. Click **Create Web Service** at the bottom. Wait for it to finish
   building (watch the log — first build takes a few minutes).
7. Once it says **Live**, copy the URL shown at the top of the page (looks
   like `https://bright-learners-api-xxxx.onrender.com`). **Save this** —
   you need it in Step 3.
8. One-time step: create the database tables. Click the **Shell** tab on
   this service's page, then run:
   ```bash
   cd ../../lib/db && pnpm run push
   ```

**About the free tier**: this server "falls asleep" after 15 minutes with no
visitors, and takes 30–60 seconds to wake back up on the next visit. Everyone
after that first visitor gets normal speed until it falls asleep again. If
that delay ever bothers you, Render's paid tier ($7/month) removes it — no
code changes needed either way.

---

## Step 3: Turn on GitHub Pages

1. On GitHub, open your repository → **Settings** tab (top of the repo, not
   your account settings) → **Pages** (left sidebar, under "Code and
   automation").
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
   (Don't pick "Deploy from a branch" — this repo already includes a
   ready-made GitHub Actions workflow that's simpler and fully automatic.)

That's it for this step — nothing deploys yet because it also needs the
values from Step 4.

---

## Step 4: Add your settings as GitHub Secrets and Variables

Still in your repo: **Settings → Secrets and variables → Actions**.

You'll see two tabs: **Secrets** and **Variables**. Add these:

**Under the "Secrets" tab** (click **New repository secret** for each):
| Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | the `apiKey` value from Step 0.6 |
| `VITE_FIREBASE_AUTH_DOMAIN` | the `authDomain` value from Step 0.6 |
| `VITE_FIREBASE_PROJECT_ID` | the `projectId` value from Step 0.6 |
| `VITE_FIREBASE_STORAGE_BUCKET` | the `storageBucket` value from Step 0.6 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | the `messagingSenderId` value from Step 0.6 |
| `VITE_FIREBASE_APP_ID` | the `appId` value from Step 0.6 |

**Under the "Variables" tab** (click **New repository variable**):
| Name | Value |
|---|---|
| `VITE_API_URL` | the Render URL from Step 2.7 (e.g. `https://bright-learners-api-xxxx.onrender.com`) |

Now push any small change (or go to the **Actions** tab → select "Deploy
frontend to GitHub Pages" → **Run workflow**) to trigger the first deploy.
Watch it run under the **Actions** tab — takes 1–2 minutes.

When it finishes, your site is live at:
```
https://<your-username>.github.io/<repo-name>/
```
(Also shown on the Settings → Pages screen once it's deployed.)

---

## Step 5: Connect the frontend and backend together

Two things still need that GitHub Pages web address you just got:

1. **Back on Render** (Step 2's service) → **Environment** tab → edit
   `CORS_ORIGIN` → set it to your GitHub Pages URL **without a trailing
   slash**, e.g.:
   ```
   https://your-username.github.io
   ```
   Save — Render redeploys automatically.
2. **Back on Firebase** (Step 0.8) → Authentication → Settings → Authorized
   domains → **Add domain** → paste `your-username.github.io` (just the
   domain, no `https://` and no path) → **Add**.

Your app is now fully live. Visit your GitHub Pages URL and try signing up.

---

## Step 6 (optional): Use your own domain instead of github.io

1. Repo **Settings → Pages → Custom domain** → type your domain → **Save**.
   Add the DNS record GitHub shows you at your domain provider.
2. Open `.github/workflows/deploy-frontend.yml`, find the commented-out
   "Add CNAME" step near the top, remove the `#` from those two lines, and
   change `BASE_PATH: /${{ github.event.repository.name }}/` to
   `BASE_PATH: /` (a plain root path, since a custom domain isn't nested
   under a repo name).
3. Repeat Step 5 above using your custom domain instead of the `.github.io`
   address (for both `CORS_ORIGIN` and Firebase's Authorized domains).

---

## Ongoing updates

From here on, every `git push` to `main` automatically:
- Rebuilds and redeploys the frontend (GitHub Actions → GitHub Pages)
- Rebuilds and redeploys the backend (Render)

Nothing to click, nothing to drag-and-drop.
