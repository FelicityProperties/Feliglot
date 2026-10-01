"use client";

// What a learner has done: which language they speak, lessons passed,
// points and their daily streak. It is always kept in the browser, so the
// site works without an account. When they are signed in, every change is
// also saved to their account and merged with what other devices saved.

import { useSyncExternalStore } from "react";
import { getLanguage } from "./languages";
import { BOX_DAYS, EMPTY_PROGRESS, MAX_BOX, addDays, cleanProgress, mergeProgress, sameProgress, type Card, type Progress } from "./progress";

export type { Progress } from "./progress";

const SPEAK_KEY = "feliglot:speak";
const PROGRESS_KEY = "feliglot:progress";
const EVENT = "feliglot:store";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
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

function speakSnapshot(): string {
  const code = read(SPEAK_KEY);
  return code && getLanguage(code) ? code : "en";
}

export function useSpeakLanguage(): string {
  return useSyncExternalStore(subscribe, speakSnapshot, () => "en");
}

export function setSpeakLanguage(code: string) {
  write(SPEAK_KEY, code);
  scheduleSave();
}

// --- Progress --------------------------------------------------------------

function parseProgress(raw: string | null): Progress {
  if (!raw) return EMPTY_PROGRESS;
  try {
    return cleanProgress(JSON.parse(raw));
  } catch {
    return EMPTY_PROGRESS;
  }
}

// useSyncExternalStore needs a stable snapshot, so cache the parsed value
// against the raw string it came from.
let lastRaw: string | null = null;
let lastParsed: Progress = EMPTY_PROGRESS;
function progressSnapshot(): Progress {
  const raw = read(PROGRESS_KEY);
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastParsed = parseProgress(raw);
  }
  return lastParsed;
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, progressSnapshot, () => EMPTY_PROGRESS);
}

function writeProgress(p: Progress) {
  write(PROGRESS_KEY, JSON.stringify(p));
  scheduleSave();
}

export function localDay(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addXp(points: number) {
  const p = progressSnapshot();
  const today = localDay();
  writeProgress({ ...p, xp: p.xp + points, xpDays: { ...p.xpDays, [today]: (p.xpDays[today] ?? 0) + points } });
}

function withDay(days: string[], day: string): string[] {
  // Keep the list bounded; a streak longer than a year is still shown as 365+.
  return [...new Set([...days, day])].sort().slice(-400);
}

// Passing a lesson marks it done, extends the streak, and puts its phrases
// into the learner's memory so they come back for review tomorrow.
export function markUnitDone(lang: string, unit: string, conceptIds: string[]) {
  const p = progressSnapshot();
  const today = localDay();
  const units = new Set(p.done[lang] ?? []);
  units.add(unit);
  const cards = { ...p.cards };
  for (const id of conceptIds) {
    const key = `${lang}:${id}`;
    // t: 0 marks a card that has never been reviewed, so when progress is
    // merged with an account any reviewed copy of it wins.
    if (!cards[key]) cards[key] = { b: 1, due: addDays(today, BOX_DAYS[1]), t: 0 };
  }
  writeProgress({ ...p, done: { ...p.done, [lang]: [...units] }, days: withDay(p.days, today), cards });
}

// After a review: remembered phrases move up a box (seen less often),
// forgotten ones start again tomorrow. Only phrases that are due count, so
// practising the same ones again can't push them weeks ahead.
export function recordReview(results: { key: string; correct: boolean }[]) {
  const p = progressSnapshot();
  const today = localDay();
  const now = Date.now();
  const cards = { ...p.cards };
  for (const { key, correct } of results) {
    const old: Card = cards[key] ?? { b: 1, due: today, t: 0 };
    if (old.due > today) continue;
    const b = correct ? Math.min(old.b + 1, MAX_BOX) : 1;
    cards[key] = { b, due: addDays(today, BOX_DAYS[b]), t: now };
  }
  writeProgress({ ...p, cards, days: withDay(p.days, today) });
}

export function setGoal(xp: number) {
  const p = progressSnapshot();
  writeProgress({ ...p, goal: xp, goalT: Date.now() });
}

// --- Account ---------------------------------------------------------------

export type AccountUser = {
  email: string;
  name: string | null;
  avatar: string | null;
  method: string;
  joined: string;
  admin: boolean;
};

export type Account =
  | { status: "loading" }
  | { status: "off" } // accounts not switched on for this site
  | { status: "signed-out"; google: boolean }
  | ({ status: "signed-in"; google: boolean; saving: boolean; saveFailed: boolean } & AccountUser);

let account: Account = { status: "loading" };
const accountListeners = new Set<() => void>();
function setAccount(next: Account) {
  account = next;
  accountListeners.forEach((l) => l());
}
function subscribeAccount(cb: () => void) {
  accountListeners.add(cb);
  if (account.status === "loading") void refreshAccount();
  return () => accountListeners.delete(cb);
}
const LOADING: Account = { status: "loading" };

export function useAccount(): Account {
  return useSyncExternalStore(subscribeAccount, () => account, () => LOADING);
}

type Saved = { progress?: unknown; speak?: string | null };

// Combine the account's saved progress into this device, then save the
// combined result back, so both end up identical.
function adopt(saved: Saved) {
  const local = progressSnapshot();
  const merged = mergeProgress(local, cleanProgress(saved.progress));
  if (!sameProgress(merged, local)) write(PROGRESS_KEY, JSON.stringify(merged));
  if (saved.speak && getLanguage(saved.speak) && !read(SPEAK_KEY)) write(SPEAK_KEY, saved.speak);
}

let refreshing: Promise<void> | null = null;
export function refreshAccount(): Promise<void> {
  refreshing ??= (async () => {
    try {
      const r = await fetch("/api/me", { cache: "no-store" });
      const d = await r.json();
      if (d.enabled === false) setAccount({ status: "off" });
      else if (!d.user) setAccount({ status: "signed-out", google: Boolean(d.google) });
      else {
        setAccount({ status: "signed-in", google: Boolean(d.google), saving: false, saveFailed: false, ...(d.user as AccountUser) });
        adopt(d);
        scheduleSave(0);
      }
    } catch {
      // Offline or the server is unreachable: carry on with this device's copy.
      if (account.status === "loading") setAccount({ status: "signed-out", google: false });
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
function scheduleSave(delay = 800) {
  if (account.status !== "signed-in") return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => void saveNow(), delay);
}

async function saveNow() {
  if (account.status !== "signed-in") return;
  setAccount({ ...account, saving: true });
  try {
    const r = await fetch("/api/progress", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ progress: progressSnapshot(), speak: read(SPEAK_KEY) }),
    });
    if (r.status === 401) {
      setAccount({ status: "signed-out", google: account.google });
      return;
    }
    if (!r.ok) throw new Error(String(r.status));
    adopt(await r.json());
    if (account.status === "signed-in") setAccount({ ...account, saving: false, saveFailed: false });
  } catch {
    if (account.status === "signed-in") setAccount({ ...account, saving: false, saveFailed: true });
  }
}

async function post(path: string, body: unknown): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    return r.ok ? { ok: true } : { ok: false, error: d.error ?? "Something went wrong — please try again." };
  } catch {
    return { ok: false, error: "No connection — please try again." };
  }
}

// Signing up or in keeps everything done on this device and adds it to the account.
export async function signUp(email: string, password: string, name?: string) {
  const r = await post("/api/auth/signup", { email, password, name });
  if (r.ok) await refreshAccount();
  return r;
}

export async function logIn(email: string, password: string) {
  const r = await post("/api/auth/login", { email, password });
  if (r.ok) await refreshAccount();
  return r;
}

// Logging out clears this device's copy, so the next person on a shared
// phone or computer doesn't see (or add to) this learner's progress.
export async function logOut() {
  // Save anything still waiting before the session ends.
  clearTimeout(saveTimer);
  await saveNow();
  await post("/api/auth/logout", {});
  clearDevice();
}

function clearDevice() {
  const google = account.status === "signed-in" || account.status === "signed-out" ? account.google : false;
  write(PROGRESS_KEY, null);
  write(SPEAK_KEY, null);
  setAccount({ status: "signed-out", google });
}

// Permanently deletes the account and everything saved with it.
export async function deleteAccount(): Promise<{ ok: boolean; error?: string }> {
  clearTimeout(saveTimer);
  try {
    const r = await fetch("/api/account", { method: "DELETE", headers: { "content-type": "application/json" } });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: d.error ?? "Something went wrong — please try again." };
    clearDevice();
    return { ok: true };
  } catch {
    return { ok: false, error: "No connection — please try again." };
  }
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

// Longest run of consecutive learning days ever.
export function bestStreak(days: string[]): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}
