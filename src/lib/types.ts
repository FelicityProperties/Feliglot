export type PhraseEntry = { text: string; roman?: string; note?: string };
export type LangContent = { code: string; phrases: Record<string, PhraseEntry> };

// One phrase as the lesson player sees it: the target-language entry plus
// its meaning in English (the fallback when the learner's own language has
// not loaded yet).
export type LessonPhrase = PhraseEntry & { id: string; en: string };

// Only what the browser needs to know about a language.
export type LangInfo = {
  code: string;
  name: string;
  nativeName: string;
  speech: string;
  dir: "ltr" | "rtl";
};

// What /api/translate returns on success (mirrors its schema).
export type TranslateResult = {
  translation: string;
  romanization: string;
  breakdown: { word: string; romanization: string; meaning: string }[];
  note: string;
};
