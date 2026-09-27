# Feliglot

Everyday Gulf Arabic for people who live in Dubai — the words you hear in the
taxi, the shop and your building, not formal textbook Arabic. A Felicity project.

- `/` — landing page
- `/learn` — lessons (learn → flashcards → quiz); progress is kept in the browser
- `/phrasebook` — type English, get the Dubai way to say it

Lesson content lives in `src/lib/lessons.ts`. It is a draft awaiting review by a
native Emirati speaker; keep the notice in the site footer until that is done.

Audio uses the browser's built-in Arabic voice, so quality varies by device.

## Run it

```bash
npm install
npm run dev
```

No database is needed yet. A Neon database is connected in Vercel for the next
step (accounts, streaks across devices); nothing reads it today.
