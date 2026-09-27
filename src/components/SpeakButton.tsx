"use client";

import { speak, useHasVoice } from "@/lib/speech";

export default function SpeakButton({ text, tag, languageName }: { text: string; tag: string; languageName: string }) {
  const hasVoice = useHasVoice(tag);
  if (hasVoice === null) return null;
  if (!hasVoice) {
    return <span className="text-xs text-ink-500">🔇 No {languageName} voice on this device</span>;
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, tag);
      }}
      className="inline-flex items-center gap-1 rounded-full border border-sand-300 bg-white px-3 py-1 text-sm text-ink-700 hover:bg-sand-100"
      aria-label={`Listen to the ${languageName} pronunciation`}
    >
      <span aria-hidden>🔊</span> Listen
    </button>
  );
}
