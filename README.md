# Feliglot

Learn any language, from any language. A Felicity project.

Every course teaches the same 200 everyday phrases in 20 five-minute
lessons over two levels (learn → flashcards → quiz). Quizzes mix picking the
meaning, picking the phrase, typing it and saying it out loud (speech
recognition where the browser supports it). Passed phrases come back for
spaced-repetition review (`/review`, Leitner boxes in `src/lib/progress.ts`). Because every language shares the same
phrase list, a learner can pick the language they already speak ("I speak",
top of every page) and see every meaning in it — any of the 61 languages
can be learned from any other.

- `/` — home and language picker
- `/learn` — all courses, searchable, by region
- `/learn/<lang>` — a course; `/learn/<lang>/<lesson>` — a lesson
- `/review` — spaced-repetition review of phrases from passed lessons
- `/translate` — phrasebook matches between any two languages, plus optional
  AI "translate & explain" (see below)
- `/account` — sign up / log in (email or Google), profile with streak
  heatmap, daily goal, courses, badges, log out, delete account
- `/admin` — owner dashboard (visitors, sign-ups, lessons, languages,
  countries, sources, who joined, CSV export); only for `ADMIN_EMAILS`,
  signed in with Google
- `/privacy`, `/terms` — policies (needed for the Play Store)

Progress (lessons passed, points per day, streak, daily goal, phrases in
review, "I speak") is always kept in the learner's browser, so the site works
without signing up. With an account (`/account`, email + password or Google)
it is also saved to the Neon database and follows the learner to any device:

- Signing up or in keeps what was done on that device and adds it to the
  account. Copies are merged, never overwritten: lessons and streak days are
  combined, the higher point totals win and each phrase keeps its most
  recently practised state (`src/lib/progress.ts`). The server merges inside
  a locked transaction, so two devices can't erase each other's progress.
- Logging out clears that device's copy (shared phones and computers).
- Passwords are stored as salted scrypt hashes; sessions are random tokens in
  an httpOnly cookie, stored only as hashes. Log-in attempts are slowed per
  visitor and per account; write endpoints refuse cross-site requests.
- Google sign-in uses the OAuth code flow with PKCE and a state cookie; a
  Google login with the email of an existing account links to it (Google has
  verified the address), deletes that account's password and signs out its
  other sessions, since anyone could have signed up with that email first.
  The return address after sign-in must be a page on this site.
- Tables (`fg_users`, `fg_sessions`, `fg_progress`, `fg_events`, `fg_salts`,
  `fg_meta`) are created and upgraded automatically — there is no separate
  setup step. The upgrade runs once per `SCHEMA_VERSION` in
  `src/lib/server/db.ts` (one server at a time); bump it whenever the schema
  changes.

Analytics are first-party, cookie-free and never linked to accounts
(`src/lib/server/events.ts`): page views and learning events with country and
device type. Unique visitors are counted with a hash salted by a random key
made fresh each day and deleted two days later (`fg_salts`), so a day's
hashes can't be recomputed afterwards. Nothing is recorded for bots or when
the browser sends Do Not Track / Global Privacy Control, and rows older than
13 months are deleted. Vercel Web Analytics runs alongside, with the same
opt-out.

The app is installable (manifest, icons, service worker in `public/sw.js`)
and ready to be wrapped for Google Play — see `docs/PLAY_STORE.md`. The
design comes from a Lovable design reference (tokens in `src/app/globals.css`,
Feli the cat in `src/components/Feli.tsx`) and follows the system's light or
dark mode.
- No password reset yet: that needs an email service.

## Content

- The course: `src/lib/curriculum.ts` (concept ids + English).
- The languages: `src/lib/languages.ts` (names, script direction, voice tag,
  romanization system, writing guide).
- The phrases: `public/content/<code>.json`, one file per language. The
  browser also fetches these directly for the "I speak" language.
- `npm run check:content` validates every file against the course (all 200
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
| `DATABASE_URL` | For accounts & analytics | The Neon connection string, added automatically when Neon is connected in Vercel (`POSTGRES_URL` also works). Tables are created and upgraded on first use. Without it, sign-in and the dashboard are hidden and progress stays in the browser. |
| `ADMIN_EMAILS` | For the owner dashboard | Comma-separated emails allowed to open `/admin`. You must sign in **with Google** using one of them: an email + password account never gets in, even with the same address (sign-up doesn't verify emails). Needs the Google settings below. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | For "Continue with Google" | From Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web application). Authorised redirect URI: `https://feliglot.vercel.app/api/auth/google/callback`. Without them the Google button is hidden. |
| `ANTHROPIC_API_KEY` | Optional | Turns on "Translate & explain". Every translation is billed to this key — set a monthly spend limit on it in the Anthropic Console. |
| `ANDROID_PACKAGE_NAME`, `ANDROID_SHA256_FINGERPRINTS` | For the Play Store app | Fill `/.well-known/assetlinks.json` so the Android app opens without a browser bar. See `docs/PLAY_STORE.md`. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | For the Play Store | Public contact address shown on the privacy policy (Google Play requires a privacy contact). Use a shared inbox, not a personal one. |
| `NEXT_PUBLIC_SITE_URL` | Optional | Public address for the sitemap and link previews. Defaults to https://feliglot.vercel.app. |

Also switch on **Vercel → Analytics → Web Analytics** for Vercel's own traffic view.

## Run it

```bash
npm install
npm run dev
```
