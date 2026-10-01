"use client";

import { getLanguage } from "./languages";
import type { Meaning, Shown } from "./quiz";
import { useSpeakLanguage } from "./store";
import type { LessonPhrase } from "./types";
import { useContent } from "./useContent";

// Meanings are shown in the language the learner speaks. English is used
// while that loads, and when they are learning their own language.
export function useMeanings(target: string, phrases: LessonPhrase[]) {
  const speakCode = useSpeakLanguage();
  const base = speakCode !== target ? speakCode : "en";
  const { content } = useContent(base === "en" ? null : base);
  const ready = base === "en" || Boolean(content);
  const info = (ready && getLanguage(base)) || getLanguage("en")!;
  const meaning: Meaning = { dir: info.dir, lang: info.speech };
  const shown: Shown[] = phrases.map((p) => ({ ...p, meaning: (ready && content?.phrases[p.id]?.text) || p.en }));
  return { shown, meaning, ready, base: info.code };
}
