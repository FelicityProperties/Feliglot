// Progress shape and the rule for combining two copies of it (this device's
// and the account's). Merging never loses anything: lessons passed and
// streak days are combined, the higher point totals win, and for each
// remembered phrase the most recently practised copy wins. Used by both the
// browser and the server, so they always agree.

import { CONCEPTS, UNITS } from "./curriculum";
import { getLanguage } from "./languages";

// One phrase in the learner's memory (spaced repetition, Leitner boxes).
// box 1 = just learned … box 6 = well known. due = next review date.
export type Card = { b: number; due: string; t: number };

export type Progress = {
  done: Record<string, string[]>; // language code -> lesson slugs passed
  xp: number;
  days: string[]; // local dates (YYYY-MM-DD) with at least one lesson or review
  xpDays: Record<string, number>; // points earned per local date (last 90 days)
  cards: Record<string, Card>; // "<lang>:<concept id>" -> memory state
  goal: number; // daily points goal
  goalT: number; // when the goal was last changed (ms), so the newest choice wins
};

export const GOALS = [
  { xp: 20, label: "Casual", blurb: "About 5 minutes a day" },
  { xp: 50, label: "Regular", blurb: "About 10 minutes a day" },
  { xp: 100, label: "Serious", blurb: "About 20 minutes a day" },
] as const;
export const DEFAULT_GOAL = 50;

export const EMPTY_PROGRESS: Progress = { done: {}, xp: 0, days: [], xpDays: {}, cards: {}, goal: DEFAULT_GOAL, goalT: 0 };

// Days until the next review for each box.
export const BOX_DAYS = [0, 1, 3, 7, 16, 35, 90];
export const MAX_BOX = BOX_DAYS.length - 1;

const UNIT_SLUGS = new Set(UNITS.map((u) => u.slug));
const CONCEPT_IDS = new Set(CONCEPTS.map((c) => c.id));
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_XP = 10_000_000;
const MAX_DAYS = 400;
const MAX_XP_DAYS = 90;

const int = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(Math.floor(v), min), max) : fallback;

function lastDays<T>(entries: [string, T][], n: number): [string, T][] {
  return entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).slice(-n);
}

// Drops anything that isn't a real language, lesson, phrase or date, so
// stored progress can't be polluted by a tampered request.
export function cleanProgress(input: unknown): Progress {
  const p = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;

  const done: Record<string, string[]> = {};
  if (p.done && typeof p.done === "object") {
    for (const [code, units] of Object.entries(p.done as Record<string, unknown>)) {
      if (!getLanguage(code) || !Array.isArray(units)) continue;
      const valid = [...new Set(units.filter((u): u is string => typeof u === "string" && UNIT_SLUGS.has(u)))];
      if (valid.length) done[code] = valid;
    }
  }

  const days = Array.isArray(p.days)
    ? [...new Set(p.days.filter((d): d is string => typeof d === "string" && DAY.test(d)))].sort().slice(-MAX_DAYS)
    : [];

  const xpDays: Record<string, number> = {};
  if (p.xpDays && typeof p.xpDays === "object") {
    const entries = Object.entries(p.xpDays as Record<string, unknown>)
      .filter(([d]) => DAY.test(d))
      .map(([d, v]) => [d, int(v, 0, MAX_XP, 0)] as [string, number])
      .filter(([, v]) => v > 0);
    for (const [d, v] of lastDays(entries, MAX_XP_DAYS)) xpDays[d] = v;
  }

  const cards: Record<string, Card> = {};
  if (p.cards && typeof p.cards === "object") {
    for (const [key, raw] of Object.entries(p.cards as Record<string, unknown>)) {
      const sep = key.lastIndexOf(":");
      const code = key.slice(0, sep);
      const id = key.slice(sep + 1);
      if (sep < 1 || !getLanguage(code) || !CONCEPT_IDS.has(id) || !raw || typeof raw !== "object") continue;
      const c = raw as Record<string, unknown>;
      if (typeof c.due !== "string" || !DAY.test(c.due)) continue;
      cards[key] = { b: int(c.b, 1, MAX_BOX, 1), due: c.due, t: int(c.t, 0, Number.MAX_SAFE_INTEGER, 0) };
    }
  }

  const goal = GOALS.some((g) => g.xp === p.goal) ? (p.goal as number) : DEFAULT_GOAL;

  return {
    done,
    xp: int(p.xp, 0, MAX_XP, 0),
    days,
    xpDays,
    cards,
    goal,
    goalT: int(p.goalT, 0, Number.MAX_SAFE_INTEGER, 0),
  };
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const done: Record<string, string[]> = { ...a.done };
  for (const [code, units] of Object.entries(b.done)) {
    done[code] = [...new Set([...(done[code] ?? []), ...units])];
  }
  const xpDaysAll: Record<string, number> = { ...a.xpDays };
  for (const [d, v] of Object.entries(b.xpDays)) xpDaysAll[d] = Math.max(xpDaysAll[d] ?? 0, v);
  const xpDays: Record<string, number> = {};
  for (const [d, v] of lastDays(Object.entries(xpDaysAll), MAX_XP_DAYS)) xpDays[d] = v;

  const cards: Record<string, Card> = { ...a.cards };
  for (const [k, c] of Object.entries(b.cards)) {
    const mine = cards[k];
    if (!mine || c.t > mine.t) cards[k] = c;
  }
  const newerGoal = b.goalT > a.goalT ? b : a;

  return {
    done,
    xp: Math.max(a.xp, b.xp),
    days: [...new Set([...a.days, ...b.days])].sort().slice(-MAX_DAYS),
    xpDays,
    cards,
    goal: newerGoal.goal,
    goalT: newerGoal.goalT,
  };
}

export function sameProgress(a: Progress, b: Progress): boolean {
  return canonical(a) === canonical(b);
}

function canonical(p: Progress): string {
  const sortObj = <T>(o: Record<string, T>) =>
    Object.keys(o)
      .sort()
      .map((k) => [k, o[k]]);
  return JSON.stringify({
    d: Object.keys(p.done)
      .sort()
      .map((k) => [k, [...p.done[k]].sort()]),
    x: p.xp,
    y: [...p.days].sort(),
    xd: sortObj(p.xpDays),
    c: sortObj(p.cards),
    g: [p.goal, p.goalT],
  });
}

// --- Derived numbers used across the app -----------------------------------

export function dueCards(p: Progress, today: string, lang?: string): string[] {
  return Object.entries(p.cards)
    .filter(([k, c]) => c.due <= today && (!lang || k.startsWith(`${lang}:`)))
    .sort(([, a], [, b]) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.b - b.b))
    .map(([k]) => k);
}

export function knownCount(p: Progress, lang?: string): number {
  return Object.entries(p.cards).filter(([k, c]) => c.b >= 3 && (!lang || k.startsWith(`${lang}:`))).length;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}
