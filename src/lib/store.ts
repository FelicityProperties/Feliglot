"use client";

// What a learner has done: which language they speak, lessons passed,
// points and their daily streak. It is always kept in the browser, so the
// site works without an account. When they are signed in, every change is
// also saved to their account and merged with what other devices saved.

import { useSyncExternalStore } from "react";
import { getLanguage } from "./languages";
import { EMPTY_PROGRESS, cleanProgress, mergeProgress, sameProgress, type Progress } from "./progress";

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
  writeProgress({ ...p, xp: p.xp + points });
}

export function markUnitDone(lang: string, unit: string) {
  const p = progressSnapshot();
  const units = new Set(p.done[lang] ?? []);
  units.add(unit);
  const days = new Set(p.days);
  days.add(localDay());
  writeProgress({
    ...p,
    done: { ...p.done, [lang]: [...units] },
    // Keep the list bounded; a streak longer than a year is still shown as 365+.
    days: [...days].sort().slice(-400),
  });
}

// --- Account ---------------------------------------------------------------

export type Account =
  | { status: "loading" }
  | { status: "off" } // accounts not switched on for this site
  | { status: "signed-out" }
  | { status: "signed-in"; email: string; saving: boolean; saveFailed: boolean };

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
      else if (!d.user) setAccount({ status: "signed-out" });
      else {
        setAccount({ status: "signed-in", email: d.user.email, saving: false, saveFailed: false });
        adopt(d);
        scheduleSave(0);
      }
    } catch {
      // Offline or the server is unreachable: carry on with this device's copy.
      if (account.status === "loading") setAccount({ status: "signed-out" });
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
      setAccount({ status: "signed-out" });
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
export async function signUp(email: string, password: string) {
  const r = await post("/api/auth/signup", { email, password });
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
  write(PROGRESS_KEY, null);
  write(SPEAK_KEY, null);
  setAccount({ status: "signed-out" });
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
