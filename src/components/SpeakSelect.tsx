"use client";

import { languageName, useT } from "@/lib/i18n";
import { LANGUAGES_BY_NAME, getLanguage } from "@/lib/languages";
import { setSpeakLanguage, useSpeakLanguage } from "@/lib/store";

export default function SpeakSelect({ compact = false }: { compact?: boolean }) {
  const speak = useSpeakLanguage();
  const { t, lang } = useT();
  return (
    <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>{t("app.speak.label")}</span>
      <select
        id="i-speak"
        value={speak}
        onChange={(e) => setSpeakLanguage(e.target.value)}
        className="max-w-44 rounded-xl border border-sand-300 bg-card px-3 py-1.5 text-sm font-bold text-ink-900 shadow-soft"
      >
        {LANGUAGES_BY_NAME.map((l) => ({ l, shown: languageName(l.code, lang) }))
          .sort((a, b) => a.shown.localeCompare(b.shown, getLanguage(lang)?.speech))
          .map(({ l, shown }) => (
            // Each language also in its own name, so people can find theirs whatever the page is in.
            <option key={l.code} value={l.code}>
              {shown === l.nativeName ? shown : `${l.nativeName} — ${shown}`}
            </option>
          ))}
      </select>
    </label>
  );
}
