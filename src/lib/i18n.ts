"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { EN, type UiKey } from "./ui";
import { getLanguage } from "./languages";
import { useSpeakLanguage } from "./store";

// The site's own words (menus, buttons, messages) in the language the learner
// speaks. English is built in; every other language is a small JSON file in
// public/ui/ that loads when it is picked. A missing word falls back to
// English, so a half-finished translation never breaks a page.
//
// A value is either text or, for counts, plural forms chosen with the
// language's own rules: { "one": "{n} phrase", "other": "{n} phrases" }.
// "{name}" placeholders are filled from `vars`.

export type Plural = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
export type Dict = Partial<Record<UiKey, string | Plural>>;
export type T = (key: UiKey, vars?: Record<string, string | number>) => string;

const dicts = new Map<string, Dict>();
const loading = new Set<string>();
const listeners = new Set<() => void>();

function ensure(code: string) {
  if (code === "en" || dicts.has(code) || loading.has(code)) return;
  loading.add(code);
  fetch(`/ui/${encodeURIComponent(code)}.json`)
    .then((r) => (r.ok ? (r.json() as Promise<Dict>) : Promise.reject(new Error(String(r.status)))))
    .then((d) => {
      dicts.set(code, d);
      listeners.forEach((l) => l());
    })
    .catch(() => {})
    .finally(() => loading.delete(code));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function translate(code: string, dict: Dict | undefined, key: UiKey, vars?: Record<string, string | number>): string {
  let v: string | Plural = dict?.[key] ?? EN[key];
  if (typeof v !== "string") {
    const n = Number(vars?.n ?? 0);
    const tag = getLanguage(code)?.speech ?? "en";
    let rule: Intl.LDMLPluralRule = "other";
    try {
      rule = new Intl.PluralRules(tag).select(n);
    } catch {}
    v = v[rule] ?? v.other;
  }
  if (!vars) return v;
  return v.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

// The language the site's words are shown in, and a function that looks them up.
export function useT(): { t: T; lang: string } {
  const lang = useSpeakLanguage();
  const dict = useSyncExternalStore(
    subscribe,
    () => dicts.get(lang),
    () => undefined,
  );
  useEffect(() => ensure(lang), [lang]);
  const t = useCallback<T>((key, vars) => translate(lang, dict, key, vars), [lang, dict]);
  return { t, lang };
}

// A language's name in the learner's language ("Japanese" → "ياباني"), from
// the browser's own data; falls back to the English name. Names come as the
// language writes them inside a sentence ("japonés" in Spanish, "Japanisch"
// in German); `standalone` capitalises them for lists and headings.
const names = new Map<string, Intl.DisplayNames | null>();
const VARIANTS = new Set(["ar", "ar-gulf", "ar-eg", "pt", "zh", "yue", "fil"]);
export function languageName(code: string, inLang: string, standalone = true): string {
  const l = getLanguage(code);
  if (!l) return code;
  if (inLang === "en") return l.name;
  const tag = getLanguage(inLang)?.speech ?? inLang;
  if (!names.has(tag)) {
    try {
      names.set(tag, new Intl.DisplayNames([tag], { type: "language", fallback: "none" }));
    } catch {
      names.set(tag, null);
    }
  }
  // Courses whose name says which variety they teach are named by us.
  if (VARIANTS.has(l.code)) return translate(inLang, dicts.get(inLang), `app.lang.${l.code}` as UiKey);
  try {
    const n = names.get(tag)?.of(l.speech.split("-")[0]);
    if (!n) return l.name;
    return standalone ? n.charAt(0).toLocaleUpperCase(tag) + n.slice(1) : n;
  } catch {
    return l.name;
  }
}
