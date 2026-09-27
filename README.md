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

Progress (lessons passed, points, daily streak) is kept in the learner's
browser. Accounts that sync across devices are the next step; the Neon
database connected in Vercel is not used yet.

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
| `NEXT_PUBLIC_SITE_URL` | Optional | The public address used in the sitemap and link previews. Defaults to https://feliglot.vercel.app. |

## Run it

```bash
npm install
npm run dev
```
