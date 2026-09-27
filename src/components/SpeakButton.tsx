"use client";

import { useSyncExternalStore } from "react";

// Uses the browser's built-in voice. Quality depends on the device: most
// phones and Macs ship an Arabic voice, some desktop browsers do not.
function pickArabicVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "ar-AE") ??
    voices.find((v) => v.lang === "ar-SA") ??
    voices.find((v) => v.lang.startsWith("ar"))
  );
}

const subscribe = () => () => {};
const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

export function speak(text: string) {
  if (!canSpeak()) return;
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickArabicVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "ar-AE";
  u.rate = 0.8;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function SpeakButton({ text, label = "Listen" }: { text: string; label?: string }) {
  const supported = useSyncExternalStore(subscribe, canSpeak, () => false);
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text);
      }}
      className="inline-flex items-center gap-1 rounded-full border border-sand-300 px-3 py-1 text-sm text-ink-700 hover:bg-sand-100"
      aria-label={`${label}: ${text}`}
    >
      <span aria-hidden>🔊</span> {label}
    </button>
  );
}
