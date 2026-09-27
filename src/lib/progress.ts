// Progress shape and the rule for combining two copies of it (this device's
// and the account's). Merging never loses anything: lessons passed and
// streak days are combined, and the higher point total wins. Used by both
// the browser and the server, so they always agree.

import { UNITS } from "./curriculum";
import { getLanguage } from "./languages";

export type Progress = {
  done: Record<string, string[]>; // language code -> lesson slugs passed
  xp: number;
  days: string[]; // local dates (YYYY-MM-DD) with at least one lesson passed
};

export const EMPTY_PROGRESS: Progress = { done: {}, xp: 0, days: [] };

const UNIT_SLUGS = new Set(UNITS.map((u) => u.slug));
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_XP = 10_000_000;
const MAX_DAYS = 400;

// Drops anything that isn't a real language, lesson or date, so stored
// progress can't be polluted by a tampered request.
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
  const xpRaw = typeof p.xp === "number" && Number.isFinite(p.xp) ? Math.floor(p.xp) : 0;
  const days = Array.isArray(p.days)
    ? [...new Set(p.days.filter((d): d is string => typeof d === "string" && DAY.test(d)))].sort().slice(-MAX_DAYS)
    : [];
  return { done, xp: Math.min(Math.max(xpRaw, 0), MAX_XP), days };
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const done: Record<string, string[]> = { ...a.done };
  for (const [code, units] of Object.entries(b.done)) {
    done[code] = [...new Set([...(done[code] ?? []), ...units])];
  }
  return {
    done,
    xp: Math.max(a.xp, b.xp),
    days: [...new Set([...a.days, ...b.days])].sort().slice(-MAX_DAYS),
  };
}

export function sameProgress(a: Progress, b: Progress): boolean {
  const norm = (p: Progress) =>
    JSON.stringify({
      d: Object.keys(p.done)
        .sort()
        .map((k) => [k, [...p.done[k]].sort()]),
      x: p.xp,
      y: [...p.days].sort(),
    });
  return norm(a) === norm(b);
}
