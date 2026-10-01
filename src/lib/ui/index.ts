import account from "./account";
import app from "./app";
import course from "./course";
import lesson from "./lesson";

// Every piece of the site's own text, in English. Translations live in
// public/ui/<language>.json with the same keys (see src/lib/i18n.ts).
// A value is text, or { one, other } plural forms for counts ("{n}").
export const EN = { ...app, ...course, ...lesson, ...account } as Record<string, string | { one?: string; other: string }> &
  typeof app &
  typeof course &
  typeof lesson &
  typeof account;

export type UiKey = keyof typeof app | keyof typeof course | keyof typeof lesson | keyof typeof account;
