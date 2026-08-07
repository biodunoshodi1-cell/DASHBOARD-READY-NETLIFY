# After uploading this project

This is the **Bright Learners** monorepo (pnpm workspaces): a React/Vite
frontend (`artifacts/bright-learners`) + Express API (`artifacts/api-server`)
+ Postgres/Drizzle database layer (`lib/db`). Authentication is real Firebase
Authentication (email/password + Google Sign-In) — see `NETLIFY_DEPLOYMENT.md`
for the full step-by-step setup (Netlify frontend + Render backend +
Firebase). The app does not use Firestore for its own data — that lives in
Postgres.

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
- **Netlify (recommended, this zip is Netlify-ready):** follow
  `NETLIFY_DEPLOYMENT.md` top to bottom. `netlify.toml` at the project root
  already has the correct build command, publish directory, SPA fallback,
  and API proxy — you only need to add environment variables and one
  backend URL.
- **GitHub Pages instead:** follow `DEPLOYMENT.md`.

## What's actually finished vs. not (as of this handoff)

**Subjects with real, working content:** Maths, English, Phonics.

**Maths — Years 1 through 6 all have real content:**
- Year 1 (15 topics): counting to 100, counting in steps, place value,
  number bonds, addition, subtraction, fractions, coins & notes, telling
  time (o'clock/half past), 2D shapes, 3D shapes, position & direction,
  length & height, weight & capacity, days/months/sequencing, word problems
- Year 2 (12 topics): place value to 100, standard units, fractions of
  shapes/quantities, pictograms & tally charts, 2D/3D shape properties,
  position/turns, multiplication, division, money, time, shapes, mixed
  word problems
- Year 3 (4 topics): place value & rounding to 1000, 3/4/8 times tables,
  fractions & equivalence, measurements/unit conversion
- Year 4 (3 topics): times tables to 12×12, decimals (tenths/hundredths),
  area and perimeter
- Year 5 (3 topics): prime/square/cube numbers, mixed number fractions,
  percentages
- Year 6 (3 topics): order of operations (BODMAS), ratio and proportion,
  introduction to algebra

**English — Years 1 through 6 all have real content:**
- Year 1: 3 decodable stories, 2 reading passages, 1 comprehension text,
  sentence building, rhyming words, capital letters & full stops
- Year 2: stories, reading passages, vocabulary, grammar, homophones,
  apostrophes & joining words
- Year 3: comprehension passages, prefixes and suffixes
- Year 4: word classes & Standard English (expanded noun phrases, plural
  possessive apostrophes, Standard English vs. non-standard forms)
- Year 5: relative clauses, cohesion, modal verbs, parenthesis
- Year 6: active/passive voice, colons/semicolons/hyphens, subjunctive mood

**Phonics: Year 1 only (by design).** UK phonics screening is a Year 1
milestone; content covers double vowels, double consonants, consonant
digraphs, and split digraphs ("magic e"). Beyond Year 1, this strand
naturally becomes spelling and vocabulary work, which lives under English
instead — the phonics page correctly shows "coming soon" for Years 2–6
rather than stretching sound-based phonics content past where it makes
curricular sense.

**Depth note, to set expectations honestly:** Year 1 has the deepest
coverage (10-15 topics per subject, closely matching the full UK National
Curriculum programme of study for that year). Years 2–6 have real,
curriculum-checked content for the highest-priority strands of each year
(3-12 topics depending on year) rather than exhaustive coverage of every
sub-strand — there's room to keep adding more topics per year if you want
that same Year-1-level depth further up.

**Subjects that do not exist yet:** Science, Computing/ICT, History,
Geography, Art, Music, PE, PSHE. No pages, routes, or data for these —
they would need to be built from scratch (new pages, new data files, new
game/quiz UI patterns, all wired into progress tracking and dashboards).

**Known pre-existing issue fixed during this work:** phonics quizzes were
silently returning zero questions for every section due to a URL param /
data key mismatch (hyphenated vs. camelCase). Fixed.

**Known pre-existing issue NOT yet fixed:** a generated API-client type
mismatch causes TypeScript warnings (not runtime errors) across dashboard
pages using `useListCompletedLessons` and similar hooks.

**Every change in this package has been verified**, not just written:
`tsc --noEmit` passes cleanly on both frontend and backend, `vite build`
succeeds, and the full content file (750+ questions) was scanned for
duplicate question IDs before being shipped.
