// Site text, English (the source for every translation). Keys start with "account.".
const account = {
  // Account page (shared)
  "account.loading": "Loading…",
  "account.somethingWrong": "Something went wrong.",

  // Accounts switched off
  "account.off.title": "Your progress",
  "account.off.body": "Accounts aren't switched on yet. Your progress is saved on this device.",

  // Sign in / sign up
  "account.signIn.eyebrowSignup": "Free forever",
  "account.signIn.eyebrowLogin": "Welcome back",
  // "\n" marks the line break in the big heading.
  "account.signIn.headline": "Your next five minutes\nstart here.",
  // {lessons} is account.signIn.lessonCount, {points} is account.signIn.pointCount.
  "account.signIn.saveProgress": "Save your {lessons} and {points}, and keep learning on any device.",
  "account.signIn.lessonCount": { one: "{n} lesson", other: "{n} lessons" },
  "account.signIn.pointCount": { one: "{points} point", other: "{points} points" },
  "account.signIn.pitch": "Feli keeps your place: streak, points and every phrase you've learned, on every device.",
  "account.signIn.modeGroup": "Create an account or log in",
  "account.signIn.createAccount": "Create account",
  "account.signIn.logIn": "Log in",
  "account.signIn.google": "Continue with Google",
  "account.signIn.googleFailed": "Google sign-in didn't work this time — please try again, or use your email.",
  "account.signIn.orEmail": "or with email",
  "account.signIn.firstName": "First name (optional)",
  "account.signIn.email": "Email",
  "account.signIn.password": "Password",
  "account.signIn.passwordHint": "At least 8 characters.",
  "account.signIn.busy": "One moment…",
  // {terms} and {privacy} are links with the two texts below.
  "account.signIn.agree": "By continuing you agree to our {terms} and {privacy}.",
  "account.signIn.terms": "terms",
  "account.signIn.privacy": "privacy policy",

  // Profile header
  "account.profile.welcome": "Welcome to Feliglot! Your progress now saves to your account.",
  "account.profile.welcomeNamed": "Welcome to Feliglot, {name}! Your progress now saves to your account.",
  "account.profile.eyebrow": "Learner profile",
  "account.profile.learningSince": "learning since {date}",
  "account.profile.courseCount": { one: "{n} course", other: "{n} courses" },
  "account.profile.saving": "Saving…",
  "account.profile.saveFailed": "Couldn't save just now — we'll retry.",
  "account.profile.synced": "✓ Synced to your account",

  // Stats
  "account.stats.totalPoints": "total points",
  "account.stats.lessonsPassed": { one: "lesson passed", other: "lessons passed" },
  "account.stats.dayStreak": { one: "day streak", other: "day streak" },
  "account.stats.bestStreak": "best streak",

  // Activity heatmap
  "account.heat.eyebrow": "Consistency",
  "account.heat.title": "Your last 13 weeks",
  "account.heat.label": {
    one: "Activity over the last 13 weeks: {n} active day",
    other: "Activity over the last 13 weeks: {n} active days",
  },
  // {date} is a day like 2026-09-30.
  "account.heat.day": { one: "{date}: {points} point", other: "{date}: {points} points" },
  "account.heat.less": "Less",
  "account.heat.more": "More",

  // Daily goal
  "account.goal.eyebrow": "Daily goal",
  "account.goal.title": "Choose your pace",
  "account.goal.group": "Daily goal",
  "account.goal.points": "{n} pts",
  "account.goal.20.label": "Casual",
  "account.goal.20.blurb": "About 5 minutes a day",
  "account.goal.50.label": "Regular",
  "account.goal.50.blurb": "About 10 minutes a day",
  "account.goal.100.label": "Serious",
  "account.goal.100.blurb": "About 20 minutes a day",

  // Courses
  "account.courses.eyebrow": "In progress",
  "account.courses.title": "Your courses",
  "account.courses.none": "No lessons passed yet.",
  "account.courses.pick": "Pick a language",
  // {done} of {n} lessons finished, e.g. "3/12 lessons".
  "account.courses.lessons": { one: "{done}/{n} lesson", other: "{done}/{n} lessons" },

  // Achievements
  "account.badges.eyebrow": "Achievements",
  "account.badges.count": { one: "{earned} of {n} badge", other: "{earned} of {n} badges" },
  "account.badges.earned": "Earned",
  "account.badges.notEarned": " — not yet earned",
  "account.badge.first.title": "First steps",
  "account.badge.first.how": "Pass your first lesson",
  "account.badge.five.title": "Bookworm",
  "account.badge.five.how": "Pass 5 lessons",
  "account.badge.streak3.title": "On fire",
  "account.badge.streak3.how": "Keep a 3-day streak",
  "account.badge.streak7.title": "Week warrior",
  "account.badge.streak7.how": "Keep a 7-day streak",
  "account.badge.streak30.title": "Unstoppable",
  "account.badge.streak30.how": "Keep a 30-day streak",
  "account.badge.goal.title": "Goal getter",
  "account.badge.goal.how": "Reach a daily goal",
  "account.badge.xp1000.title": "Star learner",
  "account.badge.xp1000.how": "Earn 1,000 points",
  "account.badge.memory.title": "Memory master",
  "account.badge.memory.how": "Know 50 phrases well",
  "account.badge.polyglot.title": "Polyglot",
  "account.badge.polyglot.how": "Start 3 languages",
  "account.badge.level1.title": "Level 1 done",
  "account.badge.level1.how": "Finish Level 1 of any course",
  "account.badge.course.title": "Fluent-ish",
  "account.badge.course.how": "Finish a whole course",

  // Account actions
  "account.actions.dashboard": "Owner dashboard",
  "account.actions.logOut": "Log out",
  "account.actions.delete": "Delete my account",
  "account.actions.confirm": "Delete your account and all saved progress? This can't be undone.",
  "account.actions.keep": "Keep it",
  "account.actions.deleteForever": "Delete forever",

  // Translate page
  "account.translate.eyebrow": "Feliglot Translate",
  "account.translate.title": "Translate with context, not guesswork.",
  "account.translate.intro": "Don't just get the translation — learn how to say it, word by word.",

  // Translator
  "account.translate.from": "From",
  "account.translate.to": "To",
  "account.translate.swap": "Swap languages",
  "account.translate.textLabel": "Text to translate, in {language}",
  // {example} is a phrase in the language being typed.
  "account.translate.placeholder": "Type in {language} — e.g. “{example}”",
  "account.translate.exampleFallback": "How much is this?",
  "account.translate.translating": "Translating…",
  "account.translate.button": "Translate & explain ✨",
  "account.translate.ready": "Translation ready: {translation}",
  "account.translate.error": "Something went wrong — please try again.",
  "account.translate.offline": "No connection — please try again.",
  "account.translate.aiTitle": "AI translation",
  "account.translate.wordByWord": "Word by word",
  "account.translate.word": "Word",
  "account.translate.meaning": "Meaning",
  "account.translate.aiWarning": "AI translations can contain mistakes.",
  "account.translate.matchesEyebrow": "Phrasebook matches",
  "account.translate.matchesTitle": "From the Feliglot courses",
  "account.translate.loadFailed": "Couldn't load the phrases.",
  "account.translate.retry": "Try again",
  "account.translate.startTyping": "Start typing to find matching phrases from our courses — instant and free.",
  "account.translate.aiSoon": "Full-sentence AI translation is coming soon.",
  "account.translate.loadingPhrases": "Loading phrases…",
  "account.translate.noMatch": "No phrasebook match.",
  "account.translate.useAi": "Use “Translate & explain” for anything else.",
  "account.translate.learnIt": "Learn it in the {language} course →",
} as const;

export default account;
