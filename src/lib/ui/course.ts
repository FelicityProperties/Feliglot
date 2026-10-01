// Site text, English (the source for every translation). Keys start with "course.".
// Lesson names; keep in step with src/lib/curriculum.ts.
const course = {
  "course.unit.first-words.title": "First words",
  "course.unit.meeting-people.title": "Meeting people",
  "course.unit.questions.title": "Asking questions",
  "course.unit.numbers.title": "Numbers 1–10",
  "course.unit.food-and-drink.title": "Food & drink",
  "course.unit.getting-around.title": "Getting around",
  "course.unit.shopping.title": "Shopping",
  "course.unit.time.title": "Time & days",
  "course.unit.help.title": "Help & health",
  "course.unit.everyday.title": "Everyday phrases",
  "course.unit.family.title": "Family & friends",
  "course.unit.days-of-week.title": "Days of the week",
  "course.unit.numbers-2.title": "Numbers 11–1000",
  "course.unit.colours.title": "Colours & choices",
  "course.unit.weather.title": "Weather & seasons",
  "course.unit.travel.title": "Hotel & travel",
  "course.unit.work.title": "Work & study",
  "course.unit.restaurant.title": "At the restaurant",
  "course.unit.health.title": "Body & health",
  "course.unit.social.title": "Plans & wishes",

  // Course map
  "course.level": "Level {n}",
  "course.level.1.title": "First conversations",
  "course.level.1.subtitle": "Everyday basics",
  "course.level.2.title": "Out and about",
  "course.level.2.subtitle": "Family, travel, work and more",
  "course.level.progress": "{subtitle} · {passed} of {total} lessons",
  "course.review.eyebrow": "Memory refresh",
  "course.review.title": { one: "{n} phrase is ready to review", other: "{n} phrases are ready to review" },
  "course.review.body": "A quick review keeps them strong.",
  "course.review.button": "Review now",
  "course.start": "Start: {title}",
  "course.continue": "Continue: {title}",
  "course.complete": "Course complete — every lesson passed",
  "course.stop.label": "Lesson {n}: {title}",
  "course.stop.passed": "Lesson {n}: {title} (passed)",
  "course.stop.next": "Lesson {n}: {title} (up next)",
} as const;

export default course;
