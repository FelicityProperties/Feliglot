"use client";

// Everything a learner does is kept in their own browser for now: which
// language they speak, lessons passed, points and their daily streak.
// Accounts that sync across devices are the next step.

import { useSyncExternalStore } from "react";
import { getLanguage } from "./languages";

const SPEAK_KEY = "feliglot:speak";
const PROGRESS_KEY = "feliglot:progress";
const EVENT = "feliglot:store";

export type Progress = {
  done: Record<string, string[]>; // language code -> unit slugs passed
  xp: number;
  days: string[]; // local dates (YYYY-MM-DD) with at least one lesson passed
};

const EMPTY: Progress = { done: {}, xp: 0, days: [] };

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: nothing is remembered, the site still works.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// --- The language the learner already speaks -------------------------------

export function useSpeakLanguage(): string {
  return useSyncExternalStore(
    subscribe,
    () => {
      const code = read(SPEAK_KEY);
      return code && getLanguage(code) ? code : "en";
    },
    () => "en",
  );
}

export function setSpeakLanguage(code: string) {
  write(SPEAK_KEY, code);
}

// --- Progress --------------------------------------------------------------

function parseProgress(raw: string | null): Progress {
  if (!raw) return EMPTY;
  try {
    const p = JSON.parse(raw);
    return {
      done: p && typeof p.done === "object" && p.done ? p.done : {},
      xp: Number.isFinite(p?.xp) ? p.xp : 0,
      days: Array.isArray(p?.days) ? p.days : [],
    };
  } catch {
    return EMPTY;
  }
}

// useSyncExternalStore needs a stable snapshot, so cache the parsed value
// against the raw string it came from.
let lastRaw: string | null = null;
let lastParsed: Progress = EMPTY;
function progressSnapshot(): Progress {
  const raw = read(PROGRESS_KEY);
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastParsed = parseProgress(raw);
  }
  return lastParsed;
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, progressSnapshot, () => EMPTY);
}

export function localDay(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addXp(points: number) {
  const p = progressSnapshot();
  write(PROGRESS_KEY, JSON.stringify({ ...p, xp: p.xp + points }));
}

export function markUnitDone(lang: string, unit: string) {
  const p = progressSnapshot();
  const units = new Set(p.done[lang] ?? []);
  units.add(unit);
  const days = new Set(p.days);
  days.add(localDay());
  write(
    PROGRESS_KEY,
    JSON.stringify({
      ...p,
      done: { ...p.done, [lang]: [...units] },
      // Keep the list bounded; a streak longer than a year is still shown as 365+.
      days: [...days].sort().slice(-400),
    }),
  );
}

// Consecutive days with a passed lesson, ending today — or yesterday, so a
// streak is not shown as lost before the learner has had a chance today.
export function streak(days: string[], today = new Date()): number {
  const set = new Set(days);
  const d = new Date(today);
  if (!set.has(localDay(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (set.has(localDay(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// --- Today's date, kept current across midnight -----------------------------

function subscribeDay(cb: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const arm = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    timer = setTimeout(() => {
      cb();
      arm();
    }, next.getTime() - now.getTime());
  };
  arm();
  const onVisible = () => document.visibilityState === "visible" && cb();
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", cb);
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", cb);
  };
}

// The learner's local date (YYYY-MM-DD); "" on the server.
export function useToday(): string {
  return useSyncExternalStore(subscribeDay, () => localDay(), () => "");
}
