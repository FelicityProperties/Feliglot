"use client";

import { Volume2, VolumeX } from "lucide-react";
import { speak, useHasVoice } from "@/lib/speech";

export default function SpeakButton({ text, tag, languageName }: { text: string; tag: string; languageName: string }) {
  const hasVoice = useHasVoice(tag);
  if (hasVoice === null) return null;
  if (!hasVoice) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-ink-500">
        <VolumeX size={14} aria-hidden /> No {languageName} voice on this device
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
      aria-label={`Listen to the ${languageName} pronunciation`}
    >
      <Volume2 size={18} aria-hidden /> Listen
    </button>
  );
}
