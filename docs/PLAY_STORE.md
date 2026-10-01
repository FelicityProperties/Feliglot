# Getting Feliglot into the Google Play Store

Feliglot is a website that already works like an app (installable, offline,
full-screen). Google Play accepts such sites as apps through a **Trusted Web
Activity (TWA)**: a tiny Android shell that opens feliglot.vercel.app with no
browser bar. Every update to the website is instantly the app's update too —
no re-submitting for content or design changes.

## What's already done in the code

- Web app manifest with name, icons (normal + maskable), colours, shortcuts.
- Service worker: offline page, cached lessons and phrases, fast reloads.
- Privacy policy (`/privacy`) and terms (`/terms`) — Play requires a privacy URL.
- In-app account deletion (Profile → Delete my account) — Play requires it for
  apps with accounts.
- `/.well-known/assetlinks.json` — proves the app and the site belong together;
  it fills itself in from two settings (see step 4).
- Store graphics in `docs/play-store/`: `icon-512.png` (store icon) and
  `feature-graphic.png` (1024×500 banner). Phone screenshots are in
  `docs/play-store/screenshots/`.

## Steps (about an hour, plus Google's review)

1. **Google Play developer account** — play.google.com/console, one-time USD 25.
   Use the Felicity organisation (a company account needs a D-U-N-S number;
   a personal account works too).
2. **Make the Android package** — go to **pwabuilder.com**, enter
   `https://feliglot.vercel.app`, choose *Package for stores → Android*.
   Settings: package ID `com.felicity.feliglot` (pick once — it can never
   change), app name *Feliglot*, launcher name *Feliglot*. Download the zip:
   it contains an `.aab` file (the app) and a signing key — **keep the key
   and its passwords safe**; you need them for every future update.
3. **Create the app in Play Console** → upload the `.aab` to *Internal testing*
   first, then *Production* when happy.
4. **Link app and site** — in Play Console open *Setup → App integrity → App
   signing* and copy the **SHA-256 certificate fingerprint**. In Vercel →
   Settings → Environment Variables add:
   - `ANDROID_PACKAGE_NAME` = `com.felicity.feliglot`
   - `ANDROID_SHA256_FINGERPRINTS` = the fingerprint (several allowed, comma-separated)
   Redeploy. Without this the app still works but shows a browser address bar.
5. **Required settings — do these before submitting.** In Vercel →
   Settings → Environment Variables add:
   - `NEXT_PUBLIC_CONTACT_EMAIL` = a public contact address for privacy
     questions (for example a shared `privacy@` or `hello@` inbox, not a
     personal one). It is shown on the privacy page; Google Play requires a
     privacy contact. Without it the page only says "Contact Felicity through
     the details on our app store listing".
   - `ADMIN_EMAILS` = the owner's email (several allowed, comma-separated).
     The owner dashboard (`/admin`) opens only when you **sign in with
     Google** using that email — an email + password account never gets in,
     even with the same address. So "Continue with Google" must be switched
     on too (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, see the README).
   Redeploy, then check that `/privacy` shows the contact address and that
   `/admin` opens after signing in with Google.
6. **Store listing** — copy the text below; upload the icon, feature graphic
   and at least 4 screenshots; privacy policy URL
   `https://feliglot.vercel.app/privacy`.
7. **App content forms** — Data safety (see answers below), target audience
   (13+), ads: *No*, content rating questionnaire (education, no violence),
   account deletion URL `https://feliglot.vercel.app/account`.
8. Submit for review (usually 1–7 days for a new developer account).

### Data safety answers (match the privacy policy)

Data collected (everything is encrypted in transit; nothing is shared with
third parties — providers like hosting and the database don't count as
sharing):

| Play category → data type | What it is | Why (purpose) | Required? |
| --- | --- | --- | --- |
| Personal info → **Name** | Name given at sign-up or from Google | App functionality, Account management | Optional (accounts only) |
| Personal info → **Email address** | Account email | App functionality, Account management | Optional (accounts only) |
| Personal info → **User IDs** | Google account ID, for people who sign in with Google | App functionality, Account management | Optional (accounts only) |
| App activity → **Other actions** | Learning progress saved to the account (lessons, points, streak, review phrases) | App functionality | Optional (accounts only) |
| App activity → **App interactions** | Pages opened; lesson passed (language, lesson, score), review finished, daily goal set, app installed, AI translation used | Analytics | Required (skipped when the browser sends Do Not Track / Global Privacy Control) |
| Location → **Approximate location** | Country, worked out from the network (never GPS) | App functionality (account), Analytics | Required |

- The analytics (app interactions, and the country recorded with them) are
  **anonymous and not linked to the person** — not even when they are signed
  in. Unique visitors are counted with a code that changes every day and
  whose daily key is deleted after two days; no IP address is kept and no
  advertising or device ID is used. So **Device or other IDs: not collected.**
- Voice: not collected by Feliglot (speech is handled by the device's own
  speech features). Text typed into "Translate & explain" is sent to the AI
  provider to translate it and not stored by Feliglot.
- Users can request deletion: **yes**, in-app (Profile → Delete my account)
  and at `https://feliglot.vercel.app/account`. Anonymous analytics are kept
  up to 13 months.

## Store listing text

**Title (30 chars max):** Feliglot: Learn 61 Languages

**Short description (80 chars max):**
Learn any language from the one you speak. 5-minute lessons, speak & review.

**Full description:**

Learn any language — from the one you already speak.

Feliglot teaches 61 languages in short, joyful five-minute lessons. Unlike
most apps, every meaning appears in YOUR language, not just English: a Hindi
speaker can learn Japanese in Hindi, an Arabic speaker can learn Spanish in
Arabic. That's 3,660 language pairs.

★ HEAR IT — every phrase spoken aloud, as often as you like
★ SPEAK IT — say the phrase and Feliglot listens to your pronunciation
★ TYPE IT — recall the phrase yourself, typos forgiven
★ REMEMBER IT — phrases come back for review just before you'd forget
★ KEEP IT UP — daily goal, streaks, points and badges
★ TRANSLATE & LEARN — translate anything and see it word by word

200 everyday phrases per language in 20 lessons: greetings, meeting people,
numbers, food, taxis, shopping, hotels, restaurants, health, work, family,
weather and making plans. Every non-Latin script also comes in easy Latin
letters so you can read from day one.

Languages include Spanish, French, German, Italian, Portuguese, Arabic (Standard,
Gulf and Egyptian), Hindi, Urdu, Bengali, Tamil, Malayalam, Chinese (Mandarin),
Cantonese, Japanese, Korean, Russian, Turkish, Persian, Swahili, Tagalog,
Indonesian, Vietnamese, Thai and many more.

Free. No ads. Learn without an account, or sign in to keep your progress on
every device.

## How Feliglot can climb the charts

Getting to number one comes from users, not code. These are the levers, in
order of impact:

1. **Retention first.** Store ranking rewards apps people open every day.
   The streak, daily goal and spaced-repetition review are built for this.
   Next big lever: **daily reminder notifications** ("Feli misses you —
   2 minutes keeps your 6-day streak"). Worth building next.
2. **Store search (ASO).** Most installs come from Play search. Localise the
   listing (title + short description) into the top 10 languages — Feliglot's
   own phrases make that natural ("Learn Japanese in Hindi"). Each language
   page on the site (`/learn/ja`) also ranks in Google search.
3. **The unique angle.** "Learn from your own language, not English" is rare.
   Market directly to non-English speakers: Arabic speakers learning English,
   Hindi speakers learning Arabic for the Gulf, expats in Dubai learning Gulf
   Arabic. Short videos of Feli + a phrase a day on TikTok/Instagram/YouTube
   Shorts in each language.
4. **Ratings.** Ask for a rating at a happy moment (after a 7-day streak),
   never after a mistake. Reply to every review.
5. **Content depth.** 200 phrases is ~4–6 weeks of learning. Plan Level 3
   (grammar-light sentence building) before learners run out.
6. **Native-speaker review.** Pay native speakers to check the top 10
   languages first; mention "checked by native speakers" in the listing.
7. **Watch the owner dashboard** (`/admin`): which languages people learn,
   where they come from, and whether lessons per day keep rising.
