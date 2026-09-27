# Feliglot

Learn any language, from any language. A Felicity project.

Every course teaches the same 100 everyday phrases in 10 five-minute
lessons (learn → flashcards → quiz). Because every language shares the same
phrase list, a learner can pick the language they already speak ("I speak",
top of every page) and see every meaning in it — any of the 61 languages
can be learned from any other.

- `/` — home and language picker
- `/learn` — all courses, searchable, by region
- `/learn/<lang>` — a course; `/learn/<lang>/<lesson>` — a lesson
- `/translate` — phrasebook matches between any two languages, plus optional
  AI "translate & explain" (see below)

Progress (lessons passed, points, daily streak, "I speak") is always kept in
the learner's browser, so the site works without signing up. With an account
(`/account`, email + password) it is also saved to the Neon database and
follows the learner to any device:

- Signing up or in keeps what was done on that device and adds it to the
  account. Copies are merged, never overwritten: lessons and streak days are
  combined and the higher point total wins (`src/lib/progress.ts`), so two
  devices can't erase each other's progress.
- Logging out clears that device's copy (shared phones and computers).
- Passwords are stored as salted scrypt hashes; sessions are random tokens in
  an httpOnly cookie, stored only as hashes. Log-in attempts are slowed per
  visitor and per account; write endpoints refuse cross-site requests.
- Tables (`fg_users`, `fg_sessions`, `fg_progress`) are created automatically
  on first use — there is no separate setup step.
- No password reset yet: that needs an email service.

## Content

- The course: `src/lib/curriculum.ts` (concept ids + English).
- The languages: `src/lib/languages.ts` (names, script direction, voice tag,
  romanization system, writing guide).
- The phrases: `public/content/<code>.json`, one file per language. The
  browser also fetches these directly for the "I speak" language.
- `npm run check:content` validates every file against the course (all 100
  phrases present, romanization where the script isn't Latin, the "…"
  placeholder, right-to-left script where expected). Run it after any edit.

Phrases were written by AI and checked by independent AI reviewers; they
still need native-speaker review. The site footer says so — keep it until
that review is done. `public/content/en.json` is generated from the
curriculum by `node scripts/write-english.mjs`.

Audio uses the voices built into the learner's device, so which languages
can be heard varies; buttons say so when a device has no voice.

## Settings (Vercel → Settings → Environment Variables)

| Name | Needed? | What it does |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Optional | Turns on "Translate & explain" (AI translation with word-by-word breakdown). Without it the translator shows phrasebook matches only. Every translation is billed to this key — set a monthly spend limit on it in the Anthropic Console. |
| `DATABASE_URL` | For accounts | The Neon connection string. Added automatically when Neon is connected to the project in Vercel (`POSTGRES_URL` also works). Without it, the Sign in link is hidden and progress stays in the browser. |
| `NEXT_PUBLIC_SITE_URL` | Optional | The public address used in the sitemap and link previews. Defaults to https://feliglot.vercel.app. |

## Run it

```bash
npm install
npm run dev
```
