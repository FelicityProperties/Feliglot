import { fold } from "./fold";
import type { LessonPhrase } from "./types";

// A phrase as the quiz shows it: the target-language entry plus its meaning
// in the language the learner speaks.
export type Shown = LessonPhrase & { meaning: string };
export type Meaning = { dir: "ltr" | "rtl"; lang: string };

// read:   see the phrase, pick its meaning
// recall: see the meaning, pick the phrase
// type:   see the meaning, type the phrase (romanized if the script isn't Latin)
// speak:  see the phrase, say it out loud
export type Kind = "read" | "recall" | "type" | "speak";

// Questions hold ids only, so text always comes from the current language.
export type Question = { id: string; kind: Kind; options: string[] };
export type Result = { id: string; correct: boolean; skipped?: boolean };

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Compared the way answers are checked: case, accents and punctuation ignored
// ("Tolong" and "Tolong!" are the same option).
const norm = fold;

// A good lesson mixes recognising, recalling, typing and speaking.
const PATTERN: Kind[] = ["read", "recall", "type", "read", "speak", "recall", "read", "type", "recall", "speak"];

// `pool` supplies wrong options (a review may have only a few phrases due).
// Some phrases are worded the same in a language (e.g. "sorry" and "excuse
// me"): a wrong option must differ from the right one on both the prompt
// and the answer side, or a learner could be marked wrong for a correct pick.
export function buildQuiz(items: Shown[], pool: Shown[], canSpeak: boolean): Question[] {
  return shuffle(items).map((phrase, i) => {
    let kind = PATTERN[i % PATTERN.length];
    if (kind === "speak" && !canSpeak) kind = "read";
    const choiceKind = kind === "read" || kind === "speak" ? "read" : "recall";
    const answer = (p: Shown) => norm(choiceKind === "read" ? p.meaning : p.text);
    const prompt = (p: Shown) => norm(choiceKind === "read" ? p.text : p.meaning);
    const seen = new Set([answer(phrase)]);
    const wrong: string[] = [];
    for (const p of shuffle(pool)) {
      if (wrong.length === 3) break;
      if (p.id === phrase.id || seen.has(answer(p)) || prompt(p) === prompt(phrase)) continue;
      seen.add(answer(p));
      wrong.push(p.id);
    }
    // Multiple choice needs at least one wrong option; otherwise ask to type it.
    if ((kind === "read" || kind === "recall") && wrong.length === 0) kind = "type";
    return { id: phrase.id, kind, options: shuffle([phrase.id, ...wrong]) };
  });
}
