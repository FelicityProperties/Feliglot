// Loose text comparison for search: case, accents, punctuation and spelling
// variants that learners type interchangeably don't matter.
//
// Only marks that are optional in writing are removed (Latin accents, Arabic
// and Hebrew vowel marks). Indic vowel signs and Japanese dakuten change the
// word, so they are kept.

const LATIN_MARKS = /[̀-ͯ]/g;
// Hebrew points/cantillation, Arabic harakat/tanwin/hamza-madda marks,
// Quranic annotation marks and tatweel.
const RTL_MARKS = /[֑-ׇؐ-ًؚ-ٰٟۖ-ۭـ]/g;

export function fold(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(LATIN_MARKS, "")
      .replace(RTL_MARKS, "")
      // Arabic letter variants people type interchangeably.
      .replace(/[أإآٱ]/g, "ا")
      .replace(/[ىی]/g, "ي")
      .replace(/ک/g, "ك")
      // Apostrophe-like letters (Uzbek oʻ, Hawaiian-style ʻokina, typographic quotes).
      .replace(/[ʻʼ’‘'`]/g, "")
      .replace(/[\p{P}\p{S}]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// Scripts that write one word with one character, so a single character is
// a meaningful search.
export const DENSE_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

// Scripts written without spaces between words.
export const NO_SPACES = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;
