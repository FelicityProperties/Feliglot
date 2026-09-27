"use client";

// Pronunciation uses the voices built into the learner's phone or computer.
// Which languages have a voice differs by device, so every button checks
// first and says so plainly when there is none, rather than reading the
// phrase in the wrong language.

import { useSyncExternalStore } from "react";

const supported = () => typeof window !== "undefined" && "speechSynthesis" in window;

// Chrome fills the voice list asynchronously; some devices never have any.
// After the first "voiceschanged" or a short wait, an empty list is final.
const SETTLE_MS = 1500;
let settled = false;

function subscribeVoices(cb: () => void) {
  if (!supported()) return () => {};
  const onChange = () => {
    settled = true;
    cb();
  };
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  const timer = settled
    ? undefined
    : setTimeout(() => {
        settled = true;
        cb();
      }, SETTLE_MS);
  return () => {
    window.speechSynthesis.removeEventListener("voiceschanged", onChange);
    if (timer) clearTimeout(timer);
  };
}

// Snapshot: the number of voices, 0 while still loading, -2 when settled with none.
function voiceSnapshot(): number {
  if (!supported()) return -2;
  const n = window.speechSynthesis.getVoices().length;
  return n || (settled ? -2 : 0);
}

// Voices that may read a course, most specific first. Some languages share a
// base code but are different spoken languages (Cantonese and Mandarin are
// both "zh"), so those never fall back to each other.
const STRICT: Record<string, string[]> = {
  "zh-hk": ["zh-hk", "zh-mo", "yue"],
  "zh-cn": ["zh-cn", "zh-sg", "zh-tw", "cmn", "zh"],
  fil: ["fil", "tl"],
};

const norm = (tag: string) => tag.toLowerCase().replace(/_/g, "-");

export function findVoice(tag: string): SpeechSynthesisVoice | undefined {
  if (!supported()) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const want = norm(tag);
  const strict = STRICT[want] ?? STRICT[want.split("-")[0]];
  if (strict) {
    for (const prefix of strict) {
      const v = voices.find((x) => {
        const n = norm(x.lang);
        // "zh" alone must not match "zh-hk"; a prefix matches itself or itself plus a region.
        return prefix === "zh" ? n === "zh" : n === prefix || n.startsWith(prefix + "-");
      });
      if (v) return v;
    }
    return undefined;
  }
  const base = want.split("-")[0];
  return voices.find((v) => norm(v.lang) === want) ?? voices.find((v) => norm(v.lang).split("-")[0] === base);
}

export function useHasVoice(tag: string): boolean | null {
  // null while the voice list is still loading, and on the server.
  const snap = useSyncExternalStore(subscribeVoices, voiceSnapshot, () => -1);
  if (snap === -1 || snap === 0) return null;
  if (snap === -2) return false;
  return Boolean(findVoice(tag));
}

export function speak(text: string, tag: string) {
  if (!supported()) return;
  const voice = findVoice(tag);
  if (!voice) return;
  const u = new SpeechSynthesisUtterance(text.replace(/…/g, " ").trim());
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
