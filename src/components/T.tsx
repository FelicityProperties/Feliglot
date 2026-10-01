"use client";

import { languageName, useT } from "@/lib/i18n";
import type { UiKey } from "@/lib/ui";

// For server-rendered pages: one piece of site text in the learner's language.
export default function T({ k, vars }: { k: UiKey; vars?: Record<string, string | number> }) {
  const { t } = useT();
  return <>{t(k, vars)}</>;
}

// A language's name in the learner's language.
export function LangName({ code }: { code: string }) {
  const { lang } = useT();
  return <>{languageName(code, lang)}</>;
}
