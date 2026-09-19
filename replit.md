# Adaptive Learning Support App — For Bright Learners

A premium educational platform for children aged 4–11, comparable in quality to Duolingo, Khan Academy Kids, and ABCmouse.

## Run & Operate

- `pnpm --filter @workspace/bright-learners run dev` — run the frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec (then immediately overwrite `lib/api-zod/src/index.ts` to only export from `./generated/api` — Orval appends `./generated/types` but that causes collisions)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)
- Required env: `SESSION_SECRET` — Express session secret (already set)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion + wouter + Recharts
- API: Express 5 + express-session + bcryptjs
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (v3), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- Frontend app: `artifacts/bright-learners/src/`
- API routes: `artifacts/api-server/src/routes/`
- DB schema: `lib/db/src/schema/`
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`
- Lesson questions bank: `artifacts/api-server/src/lib/questions.ts`
- Frontend lesson content: `artifacts/bright-learners/src/data/lessonContent.ts`

## Demo Accounts (password: `password123` for all)

| Role | Email |
|---|---|
| Student | student@brightlearners.com |
| Parent | parent@brightlearners.com |
| Teacher | teacher@brightlearners.com |
| Admin | admin@brightlearners.com |

## Architecture decisions

- Session-based auth via `express-session` (not Firebase — no Replit integration exists for Firebase). Sessions stored in-memory; swap to `connect-pg-simple` for production persistence.
- `lib/api-zod/src/index.ts` intentionally only re-exports `./generated/api` (not `./generated/types`) to avoid Orval-generated name collisions on query param schemas. Must be manually restored after each codegen run.
- All `type: integer` fields in OpenAPI spec use `type: number` instead — Orval generates `zod.int()` for integer but the workspace uses zod v3 where `zod.int()` doesn't exist.
- Daily challenges are generated deterministically from the date as a seed, ensuring consistency without storing user-facing question state.
- Lesson content is hardcoded in `src/data/lessonContent.ts` for rich real educational material.

## Product

- **Splash screen** — animated, Brighty the owl mascot, auto-redirects after 3s
- **Login** — 4 role cards (student/parent/teacher/admin), email+password
- **Home** — 10 colorful subject cards, XP/stars/coins bar, Brighty greeting
- **Math** — 11 topics with interactive questions, confetti on correct answers
- **English** — Reading, comprehension, vocabulary, grammar, stories
- **Phonics** — 3 sections: double vowels, double consonants, digraphs
- **Games** — Math Sprint (60s timer), Memory Match, + 8 more
- **Rewards** — Stars, coins, XP, levels, badges, avatars
- **Progress** — Charts and progress bars per subject
- **Daily Challenge** — 15 questions, Daily Champion badge on perfection
- **Parent Dashboard** — Children's progress, weekly activity
- **Teacher Dashboard** — Class stats, top performers, at-risk students
- **Admin Dashboard** — Platform-wide analytics, user management
- **Settings** — Dark mode, sounds, font size, accessibility options

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After codegen, immediately overwrite `lib/api-zod/src/index.ts` — Orval regenerates it with the colliding `./generated/types` export
- Never use `type: integer` in openapi.yaml — use `type: number` (zod v3 compatibility)
- The `lessonContent.ts` file uses single quotes throughout — use double quotes for any hint/question strings containing apostrophes
