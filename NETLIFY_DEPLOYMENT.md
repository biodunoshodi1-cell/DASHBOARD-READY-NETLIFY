# Deployment Guide (Netlify + Render)

This app has two parts, and they live in two different places:

- **Frontend** (what students see and click) → **Netlify**. This repo
  already includes a ready-made `netlify.toml` at the project root, so
  Netlify knows how to build it with no extra configuration on your part.
- **Backend** (login, saving progress, the database) → **Render** (or any
  Node host of your choice). Netlify only serves static files — it cannot
  run a live server or database, so this piece needs to live somewhere
  that can. This guide uses Render because it has a free tier and needs no
  credit card, but any Node host works the same way.

Do the backend first (Steps 1–2) — the frontend needs its web address.
Sign-in (email/password and "Sign in with Google") uses **Firebase
Authentication** — do Step 0 first so you have the values later steps ask
for.

---

## Step 0: Set up Firebase Authentication

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
   6 values down — you'll paste them into Netlify in Step 4:
   - `apiKey`, `authDomain`, `projectId`, `storageBucket`,
     `messagingSenderId`, `appId`
7. Still in Project settings, click the **Service accounts** tab → click
   **Generate new private key** → click **Generate key**. This downloads a
   `.json` file — keep it, you'll paste its full contents into Render in
   Step 2.
8. You'll come back to **Authentication → Settings → Authorized domains**
   in Step 5, once you have your real Netlify web address.

---

## Step 1: Create a database on Render

1. Go to **[render.com](https://render.com)** and sign up (free).
2. Click **New +** (top right) → **PostgreSQL**.
3. Give it any name → choose the **Free** plan → click **Create Database**.
4. Wait about a minute. On its page, find **Internal Database URL** and
   copy it — you'll paste it in the next step.

---

## Step 2: Deploy the backend on Render

1. Push this project to GitHub if you haven't yet:
   ```bash
   cd Interactive-Education-Platform-main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Back in Render: click **New +** → **Web Service** → **Connect account**
   to link GitHub if needed → select your repository.
3. Fill in these fields:
   - **Name**: anything, e.g. `bright-learners-api`
   - **Root Directory**: `artifacts/api-server`
   - **Runtime**: `Node`
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && cd artifacts/api-server && pnpm run build`
   - **Start Command**: `pnpm run start`
   - **Instance Type**: **Free**
4. Scroll to **Environment Variables** → add each of these:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | the Internal Database URL from Step 1.4 |
   | `SESSION_SECRET` | any long random text (40+ characters) |
   | `NODE_ENV` | `production` |
   | `FIREBASE_SERVICE_ACCOUNT` | full contents of the `.json` file from Step 0.7 |
   | `CORS_ORIGIN` | leave blank for now — filled in during Step 4 |
   | `COOKIE_SAMESITE` | `none` |
5. Click **Create Web Service**. Wait for the first build to finish.
6. Once it says **Live**, copy the URL at the top (looks like
   `https://bright-learners-api-xxxx.onrender.com`). **Save this** — you
   need it in Step 3.
7. One-time step: create the database tables. Click the **Shell** tab on
   this service's page, then run:
   ```bash
   cd ../../lib/db && pnpm run push
   ```

**About the free tier**: this server "falls asleep" after 15 minutes with
no visitors and takes 30–60 seconds to wake back up on the next visit.
Render's paid tier ($7/month) removes that delay — no code changes needed
either way.

---

## Step 3: Deploy the frontend on Netlify

This repo's `netlify.toml` (at the project root) already tells Netlify
everything it needs: which folder to build (`artifacts/bright-learners`),
the build command, and the publish directory. You only need to connect
the repo and set environment variables.

1. Go to **[app.netlify.com](https://app.netlify.com)** → **Add new site**
   → **Import an existing project** → connect GitHub → select your
   repository.
2. Netlify will detect `netlify.toml` automatically and pre-fill the build
   settings. Leave them as-is — don't override the build command or
   publish directory in the UI, since `netlify.toml` already has them
   correct for this monorepo layout.
3. Click **Deploy site**. The first build will likely still show
   `/api/*` requests failing — that's expected until Steps 4–5 below.

---

## Step 4: Add environment variables in Netlify

On your new site: **Site configuration → Environment variables → Add a
variable**. Add each of these (all as plain "Value" entries — none of
these need to be marked as secrets, since Firebase's client-side config
values are safe to expose publicly):

| Key | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | the `apiKey` value from Step 0.6 |
| `VITE_FIREBASE_AUTH_DOMAIN` | the `authDomain` value from Step 0.6 |
| `VITE_FIREBASE_PROJECT_ID` | the `projectId` value from Step 0.6 |
| `VITE_FIREBASE_STORAGE_BUCKET` | the `storageBucket` value from Step 0.6 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | the `messagingSenderId` value from Step 0.6 |
| `VITE_FIREBASE_APP_ID` | the `appId` value from Step 0.6 |
| `VITE_API_URL` | the Render URL from Step 2.6 |

Then also edit `netlify.toml` in your repo (one line) to point the API
proxy at your real backend:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://REPLACE-WITH-YOUR-BACKEND-URL/api/:splat"   # <-- change this
  status = 200
  force = true
```

Replace `REPLACE-WITH-YOUR-BACKEND-URL` with your Render URL from Step 2.6
(no `https://` duplication, no trailing slash), commit, and push. Netlify
redeploys automatically on every push to your default branch.

> Why edit the file instead of an env var? Netlify redirects are resolved
> at deploy time and can't read `${VITE_API_URL}`-style placeholders — the
> destination has to be a literal URL in `netlify.toml`.

Once deployed, note your site's Netlify URL (shown on the site overview,
looks like `https://your-site-name.netlify.app`, or your custom domain if
you've set one up under **Domain management**).

---

## Step 5: Connect the frontend and backend together

Two things still need that Netlify web address you just got:

1. **Back on Render** (Step 2's service) → **Environment** tab → edit
   `CORS_ORIGIN` → set it to your Netlify URL **without a trailing
   slash**, e.g.:
   ```
   https://your-site-name.netlify.app
   ```
   Save — Render redeploys automatically.
2. **Back on Firebase** (Step 0.8) → **Authentication → Settings →
   Authorized domains** → **Add domain** → paste
   `your-site-name.netlify.app` (just the domain, no `https://` and no
   path) → **Add**.

Your app is now fully live. Visit your Netlify URL and try signing up,
logging in with email/password, and "Sign in with Google."

---

## Step 6 (optional): Use your own domain instead of *.netlify.app

1. Netlify: **Domain management → Add a domain** → follow the DNS
   instructions Netlify gives you.
2. Repeat Step 5 above using your custom domain instead of the
   `.netlify.app` address (for both `CORS_ORIGIN` and Firebase's
   Authorized domains).

---

## Troubleshooting

- **Google/email sign-in button does nothing or errors immediately**:
  double-check all 6 `VITE_FIREBASE_*` variables are set in Netlify
  *and* that you triggered a redeploy after adding them (env var changes
  don't apply retroactively to already-built deploys — use **Deploys →
  Trigger deploy → Clear cache and deploy site**).
- **Sign-in works but nothing saves / dashboards stay empty**: check that
  `VITE_API_URL` and the `netlify.toml` redirect both point at your real,
  live Render URL, and that `CORS_ORIGIN` on Render matches your Netlify
  URL exactly (including `https://`, excluding any trailing slash).
- **"auth/unauthorized-domain" error from Firebase**: you skipped adding
  your Netlify domain under Firebase's Authorized domains (Step 5.2).
- **Routes 404 on refresh** (e.g. reloading `/math` directly): shouldn't
  happen — `netlify.toml` already includes the SPA fallback redirect. If
  you added a custom `_redirects` file on top of this, remove it; having
  both can conflict.

---

## Ongoing updates

From here on, every `git push` to your default branch automatically:
- Rebuilds and redeploys the frontend (Netlify)
- Rebuilds and redeploys the backend (Render)

Nothing to click, nothing to drag-and-drop.

---

## Alternative: GitHub Pages instead of Netlify

If you'd rather use GitHub Pages for the frontend, see `DEPLOYMENT.md` —
it walks through the same Firebase/backend setup with GitHub Pages steps
instead of Netlify ones. Don't do both guides on the same repo; pick one
frontend host.
