"use client";

import { Volume2, VolumeX } from "lucide-react";
import { languageName as nameIn, useT } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";
import { speak, useHasVoice } from "@/lib/speech";

// `code` names the language in the learner's own language; without it the
// language is found from its speech tag, and `languageName` is the fallback.
export default function SpeakButton({ text, tag, languageName, code }: { text: string; tag: string; languageName: string; code?: string }) {
  const hasVoice = useHasVoice(tag);
  const { t, lang } = useT();
  if (hasVoice === null) return null;
  const matches = LANGUAGES.filter((l) => l.speech === tag);
  const known = code ?? (matches.length === 1 ? matches[0].code : undefined);
  const language = known ? nameIn(known, lang, false) : languageName;
  if (!hasVoice) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ink-500">
        <VolumeX size={14} aria-hidden /> {t("lesson.speak.noVoice", { language })}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, tag);
      }}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-2xl border border-sand-300 bg-card px-3.5 text-sm font-bold text-primary shadow-soft transition hover:-translate-y-0.5 active:translate-y-0"
      aria-label={t("lesson.speak.label", { language })}
    >
      <Volume2 size={18} aria-hidden /> {t("lesson.speak.listen")}
    </button>
  );
}
