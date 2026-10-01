// Site text, English (the source for every translation). Keys start with "lesson.".
const lesson = {
  // Shared
  "lesson.loading": "Loading…",
  "lesson.tryAgain": "Try again",

  // Lesson header
  "lesson.header.close": "Close lesson, back to the {language} course",
  "lesson.header.meta": "{language} · Level {level} · Lesson {lesson}",
  "lesson.header.phrases": { one: "{n} phrase", other: "{n} phrases" },

  // Lesson steps
  "lesson.steps.label": "Lesson steps",
  "lesson.steps.learn": "Learn",
  "lesson.steps.cards": "Flashcards",
  "lesson.steps.quiz": "Quiz",

  // Learn list
  "lesson.learn.toCards": "Practise with flashcards →",

  // Flashcards
  "lesson.cards.progress": "Card {n} of {total} — tap the card to turn it over",
  "lesson.cards.howDoYouSay": "How do you say…",
  "lesson.cards.tapForMeaning": "(tap to see the meaning)",
  "lesson.cards.tapForAnswer": "(tap to see the answer)",
  "lesson.cards.back": "← Back",
  "lesson.cards.next": "Next →",
  "lesson.cards.toQuiz": "Take the quiz →",

  // Quiz
  "lesson.quiz.progress": "Quiz progress",
  "lesson.quiz.prompt.read": "What does this mean?",
  "lesson.quiz.prompt.recall": "How do you say this in {language}?",
  "lesson.quiz.prompt.type": "Type this in {language}",
  "lesson.quiz.prompt.speak": "Say it out loud",
  "lesson.quiz.correctAnswer": "— correct answer",
  "lesson.quiz.yourAnswer": "— your answer",
  "lesson.quiz.skipped": "Skipped",
  "lesson.quiz.great": "Great! +{xp}",
  "lesson.quiz.notQuite": "Not quite",
  "lesson.quiz.answer": "Answer: {answer}",
  "lesson.quiz.heard": "We heard: “{heard}”",
  "lesson.quiz.seeResults": "See results",
  "lesson.quiz.continue": "Continue",
  "lesson.quiz.typeLatin": "Type it in Latin letters (as it sounds)",
  "lesson.quiz.typeIn": "Type it in {language}",
  "lesson.quiz.check": "Check",
  "lesson.quiz.mic.start": "Start speaking",
  "lesson.quiz.mic.stop": "Stop listening",
  "lesson.quiz.mic.idle": "Tap the microphone and say the phrase",
  "lesson.quiz.mic.listening": "Listening… say the phrase",
  "lesson.quiz.mic.blocked": "The microphone is blocked. Allow it in your browser settings, or skip.",
  "lesson.quiz.mic.failed": "That didn't work. Checking speech needs an internet connection. Try again, or skip.",
  "lesson.quiz.mic.skip": "I can't speak right now",

  // Lesson complete
  "lesson.complete.done": "{title}: done!",
  "lesson.complete.next": "Next: {title} →",
  "lesson.complete.backToCourse": "Back to the course",
  "lesson.complete.almost": "Almost there!",
  "lesson.complete.passed": "Lesson passed — these phrases will come back for review so they stick.",
  "lesson.complete.failed": "Get {percent}% to pass. Try once more!",
  "lesson.complete.points": "points",
  "lesson.complete.accuracy": "accuracy",
  "lesson.complete.percent": "{n}%",
  "lesson.complete.streak": { one: "day streak", other: "day streak" },
  "lesson.complete.practiseAgain": "Practise again",

  // Save prompt (after a passed lesson, signed out)
  "lesson.save.text": "{link} to keep your progress on any device.",
  "lesson.save.link": "Create a free account",

  // Review
  "lesson.review.title": "Review",
  "lesson.review.intro": "Phrases you've learned come back just before you'd forget them. A few minutes a day keeps them for good.",
  "lesson.review.empty": "Nothing to review yet.",
  "lesson.review.emptyHint": "Pass a lesson and its phrases come back here — just before you'd forget them.",
  "lesson.review.chooseLanguage": "Choose a language",
  "lesson.review.due": { one: "{n} ready to review", other: "{n} ready to review" },
  "lesson.review.caughtUp": "All caught up",
  "lesson.review.known": { one: "{known} of {n} well known", other: "{known} of {n} well known" },
  "lesson.review.start": "Review",
  "lesson.review.allDone": "Done ✓",
  "lesson.review.loadFailed": "Couldn't load the phrases.",
  "lesson.review.done": "Review done!",
  "lesson.review.backToReviews": "Back to reviews",
  "lesson.review.caughtUpIn": "All caught up in {language} for today.",
  "lesson.review.back": "Back",
  "lesson.review.allReviews": "← All reviews",

  // Listen button
  "lesson.speak.listen": "Listen",
  "lesson.speak.label": "Listen to the {language} pronunciation",
  "lesson.speak.noVoice": "No {language} voice on this device",
} as const;

export default lesson;
