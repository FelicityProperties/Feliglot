"use client";

// "Say it" exercises use the browser's speech recognition (Chrome, Edge,
// Safari and Android's Chrome-based app shell). Where it isn't available the
// exercise is simply not offered.

type Alt = { transcript: string };
type RecResult = { 0: Alt; length: number; [i: number]: Alt };
type Rec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: { length: number; [i: number]: RecResult } }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecCtor = new () => Rec;

function ctor(): RecCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function recognitionSupported(): boolean {
  return Boolean(ctor());
}

const OFF_KEY = "feliglot:speak-off-until";

// Learners can turn speaking off for a while ("I can't speak now").
export function speakingPaused(): boolean {
  try {
    return Number(sessionStorage.getItem(OFF_KEY) ?? 0) > Date.now();
  } catch {
    return false;
  }
}
export function pauseSpeaking(minutes = 30) {
  try {
    sessionStorage.setItem(OFF_KEY, String(Date.now() + minutes * 60_000));
  } catch {}
}

// stop(): finish and still deliver what was heard so far.
// cancel(): throw away anything heard (skipping, or leaving the question).
export type Listening = { stop: () => void; cancel: () => void; result: Promise<string[]> };

// Listens for one utterance and resolves with the recognised alternatives
// (empty if nothing was heard). Rejects with an Error whose message is the
// browser's error code: "not-allowed" when the microphone is blocked,
// "network" when the recogniser's server can't be reached.
export function listen(lang: string, timeoutMs = 8000): Listening {
  const C = ctor();
  if (!C) return { stop: () => {}, cancel: () => {}, result: Promise.reject(new Error("unsupported")) };
  const rec = new C();
  rec.lang = lang;
  rec.interimResults = false;
  rec.maxAlternatives = 5;
  let heard: string[] = [];
  const result = new Promise<string[]>((resolve, reject) => {
    const timer = setTimeout(() => rec.stop(), timeoutMs);
    rec.onresult = (e) => {
      heard = [];
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        for (let j = 0; j < r.length; j++) heard.push(r[j].transcript);
      }
    };
    rec.onerror = (e) => {
      clearTimeout(timer);
      if (e.error === "no-speech" || e.error === "aborted") resolve([]);
      else reject(new Error(e.error));
    };
    rec.onend = () => {
      clearTimeout(timer);
      resolve(heard);
    };
  });
  rec.start();
  return { stop: () => rec.stop(), cancel: () => rec.abort(), result };
}
