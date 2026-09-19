# After uploading this project

This is the **Bright Learners** platform, built for **Adaptive Learning
Support** — a pnpm monorepo: a React/Vite frontend
(`artifacts/bright-learners`) + Express API (`artifacts/api-server`) +
Postgres/Drizzle database layer (`lib/db`). Authentication is real Firebase
Authentication (email/password + Google Sign-In + password reset).

**Never touched this before?** Start with `GITHUB_SETUP.md`, then
`NETLIFY_DEPLOYMENT.md` — together they walk you from "folder on my
computer" to "live website" step by step.

## Quick local setup
```
corepack enable
pnpm install
```
Copy the `.env.example` files in `artifacts/bright-learners` and
`artifacts/api-server` to `.env` and fill in a Postgres connection string
and your Firebase values, then:
```
pnpm dev      # run locally
pnpm build    # production build
```

## Deploying
1. **Push to GitHub first** — see `GITHUB_SETUP.md`.
2. **Netlify (frontend) + Render (backend + database)** — see
   `NETLIFY_DEPLOYMENT.md`, step by step, including the Firebase
   Authentication setup. `netlify.toml` at the project root already has
   the correct build command, publish directory, SPA fallback, and API
   proxy — you only need to add environment variables and one backend URL.
3. **GitHub Pages instead of Netlify** — see `DEPLOYMENT.md`.

## Answers to specific questions asked during this build

- **Favicon**: now uses your real logo. You uploaded `als-logo.png` (the
  full "Adaptive Learning Support" mark with the open book + growing
  plant/bulb icon and text). Favicons are tiny (browsers show them at
  16–32px), so the full logo with text wasn't going to read — I cropped
  out just the icon mark, placed it on a white rounded-square background,
  and generated `public/favicon.png` (256×256, scales down cleanly) and
  `public/apple-touch-icon.png` (180×180, for iOS home-screen icons). The
  original full logo is also saved at `public/logo-full.png` in case you
  want it elsewhere (e.g. an email header or About page). This replaced
  my earlier custom-drawn placeholder favicon — it was **not** already
  using your logo before this.
- **Login/signup page**: rebuilt to match the two-panel reference design —
  left panel with brand badge, headline, and subtext; right panel with the
  Brighty owl mascot, Welcome Back!/Sign in to continue, Email/Password
  fields, a working "Forgot password?" flow (new — wired to real Firebase
  password-reset emails), a gradient "Let's Learn!" button, an OR divider,
  "Continue with Google," the create-account toggle, and a footer with
  logo, copyright, contact email, and an optional WhatsApp button.
  **One honest gap**: the left panel uses an illustrated gradient
  background instead of the specific photo from the reference image — I
  can't verify licensing for a real photo pulled from a search, and
  embedding an unlicensed photo into your commercial product is a real
  risk I didn't want to take on your behalf. The code has a clearly
  marked spot to drop in your own licensed photo (your own photography or
  a paid/properly-licensed stock image) — see the comment at the top of
  the left panel in `src/pages/login.tsx`.
- **Progress persistence**: confirmed real. Every completed lesson is
  recorded server-side in Postgres (`lesson_progress` table), tied to the
  signed-in user's account — not browser storage. It survives sign-out,
  sign-in, and even switching devices.
- **Dashboards**: Student, Parent, and Admin dashboards are all wired to
  real backend data, and render whatever subjects exist — built
  data-driven, so new subjects show up automatically.
- **Errors, checked properly**: ran a full monorepo build (`pnpm run
  build` at the repo root — typecheck + build every package, not just the
  frontend in isolation) and found a real, previously under-described bug:
  18 call sites across the app were passing query options without the
  `queryKey` field that `UseQueryOptions` requires. This had **zero
  runtime impact** (the generated hooks computed a default queryKey
  internally regardless), but it was a genuine `tsc` compile error, not
  just a lint nitpick, and would fail any CI pipeline or stricter build
  step run against this repo. Fixed properly at every call site using
  each hook's matching exported `getXQueryKey()` helper — not suppressed
  or ignored. The full monorepo now typechecks and builds with **zero
  errors**, verified end to end, including the previously-untested `pnpm
  run build` path at the repo root and the `mockup-sandbox` package
  (which only needed its `PORT` env var set — not a real bug, just
  missing local env when building standalone; Netlify/Render never touch
  this package anyway).
- **Responsive/full-screen audit**: went through every page's layout
  systematically — checked for missing full-height wrappers, fixed pixel
  widths, unguarded negative-position decorative elements, chart width
  handling, and narrow-screen header overflow risk. Found and fixed two
  real issues: (1) the viewport meta tag had `maximum-scale=1`, which
  blocks pinch-to-zoom — a real accessibility problem (WCAG 1.4.4
  requires users be able to zoom up to 200%), removed; (2) the persistent
  top header (logo, app name, user's display name, logout button) had no
  overflow safety net for long display names, and the "Logout" button had
  no small-screen fallback — added `truncate`, `min-w-0`, and an
  icon-only logout button below the `sm` breakpoint. Everything else
  checked out already solid: every page uses a consistent
  `min-h-[100dvh]` full-viewport wrapper, all major grids use responsive
  Tailwind breakpoints (1/2/3 columns by screen size), charts use
  `ResponsiveContainer width="100%"`, games are built with flex/grid (no
  fixed-pixel canvases), and decorative absolutely-positioned elements are
  properly contained with `overflow-hidden`.

## What's actually finished vs. not (as of this handoff)

**Six subjects exist and are wired end-to-end:** Maths, English, Phonics,
Science, Geography, PSHE. (Art, Music, and PE were intentionally left out
per instruction.)

**Maths — Years 1 through 6 all have real content:**
- Year 1 (15 topics), Year 2 (12 topics), Year 3 (4 topics), Year 4
  (3 topics), Year 5 (3 topics), Year 6 (3 topics) — 42 topics total,
  420 questions.

**English — Years 1 through 6 all have real content:**
- Year 1 (stories, reading, comprehension, sentence building, rhyming
  words, punctuation), Year 2 (stories, reading, vocabulary, grammar,
  homophones, apostrophes), Year 3 (comprehension, prefixes/suffixes),
  Year 4 (word classes & Standard English), Year 5 (relative clauses &
  cohesion), Year 6 (active/passive voice & advanced punctuation) —
  26 lessons total.

**Phonics: Year 1 only, by design.** UK phonics screening is a Year 1
milestone; beyond that the skill naturally becomes spelling/vocabulary
work, which lives under English instead. 4 topics.

**Science, Geography, PSHE — Year 1 only, matching Year 1's depth:**
- Science (6 topics): living/dead/never alive, animals including humans,
  the five senses, everyday materials, seasonal changes, plants
- Geography (5 topics): UK countries & capitals, continents & oceans,
  weather around the world, physical & human features, maps & directions
- PSHE (6 topics): feelings & emotions, keeping healthy, keeping safe,
  friendship & kindness, rules & rights, looking after money & the world
- Years 2–6 for these three subjects would be the next logical chunk of
  work.

**Depth note, to set expectations honestly:** Year 1 has the deepest
coverage across every subject. Years 2–6 for Maths/English have real,
curriculum-checked content for the highest-priority strands of each year
rather than exhaustive coverage of every sub-strand.

**Subjects still not built:** Art, Music, PE — excluded per instruction.

**Engineering work done to make new subjects actually function (not just
look right):**
- Extended the OpenAPI spec, regenerated the typed API client (`orval`),
  and extended the Postgres schema so `science`/`geography`/`pshe` are
  valid values everywhere progress, achievements, and dashboards touch
  the word "subject."
- Fixed a known codegen gotcha (duplicate type export collision) —
  documented in `.agents/memory/orval-codegen-barrel.md`.
- Updated the backend's per-subject lesson-count totals (used to compute
  "X% complete" on dashboards) to match actual current content.
- Confirmed **no database migration is required** on an existing Render
  Postgres instance — the subject field is a TypeScript-level enum, not a
  native Postgres enum type.

**Known pre-existing issue fixed earlier in this project:** phonics
quizzes were silently returning zero questions for every section due to
a URL param / data key mismatch. Fixed.

**Every change in this package has been verified**, not just written:
the full monorepo (`pnpm run build` at the root) typechecks and builds
with zero errors across the frontend, backend, and every shared library;
all content files (818 questions total) were scanned for duplicate
question IDs — zero found.
