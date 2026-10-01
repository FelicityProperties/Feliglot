"use client";

import { LANGUAGES_BY_NAME } from "@/lib/languages";
import { setSpeakLanguage, useSpeakLanguage } from "@/lib/store";

export default function SpeakSelect({ compact = false }: { compact?: boolean }) {
  const speak = useSpeakLanguage();
  return (
    <label className="inline-flex items-center gap-2 text-sm font-bold text-ink-600">
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>I speak</span>
      <select
        id="i-speak"
        value={speak}
        onChange={(e) => setSpeakLanguage(e.target.value)}
        className="max-w-44 rounded-xl border border-sand-300 bg-card px-3 py-1.5 text-sm font-bold text-ink-900 shadow-soft"
      >
        {LANGUAGES_BY_NAME.map((l) => (
          <option key={l.code} value={l.code}>
            {l.name === l.nativeName ? l.name : `${l.name} — ${l.nativeName}`}
          </option>
        ))}
      </select>
    </label>
  );
}
