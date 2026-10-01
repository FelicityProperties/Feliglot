"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { languageName, useT } from "@/lib/i18n";
import { LANGUAGES_BY_NAME, getLanguage } from "@/lib/languages";
import { CONCEPTS, UNITS } from "@/lib/curriculum";
import { useSpeakLanguage } from "@/lib/store";
import { useContent } from "@/lib/useContent";
import { DENSE_SCRIPT, NO_SPACES, fold } from "@/lib/fold";
import type { LangContent, TranslateResult } from "@/lib/types";
import { ArrowLeftRight, Check, Copy, Sparkles, X } from "lucide-react";
import { track } from "@/lib/track";
import type { UiKey } from "@/lib/ui";
import SpeakButton from "./SpeakButton";

const MAX = 300;
const UNIT_OF = Object.fromEntries(UNITS.flatMap((u) => u.concepts.map((c) => [c.id, u.slug])));
// Bidi isolates keep a sentence in the site's language readable inside a box in the other direction.
const FSI = "⁨";
const PDI = "⁩";

function LangSelect({
  id,
  label,
  value,
  onChange,
  detect,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  detect?: string;
}) {
  const { lang } = useT();
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full truncate rounded-2xl border-0 bg-transparent px-3 py-3 font-display text-base font-extrabold text-primary hover:bg-primary-soft focus:bg-primary-soft"
      >
        {detect && <option value="auto">{detect}</option>}
        {LANGUAGES_BY_NAME.map((l) => ({ l, name: languageName(l.code, lang) }))
          .sort((a, b) => a.name.localeCompare(b.name, getLanguage(lang)?.speech))
          .map(({ l, name }) => (
            <option key={l.code} value={l.code}>
              {name === l.nativeName ? name : `${name} — ${l.nativeName}`}
            </option>
          ))}
      </select>
    </div>
  );
}

// Phrasebook search. A phrase matches when the query appears inside it (type-
// ahead), or when a whole phrase appears inside a longer query ("thank you so
// much" finds "thank you"). Text and romanization are matched separately.
function findMatches(query: string, from: LangContent): string[] {
  if (!query) return [];
  const dense = DENSE_SCRIPT.test(query);
  const chars = [...query].length;
  const spaced = !NO_SPACES.test(query);
  return CONCEPTS.filter((c) => {
    const t = from.phrases[c.id];
    if (!t) return false;
    const needles = [t.text, t.roman].filter((s): s is string => Boolean(s)).map(fold);
    return needles.some((n) => {
      if (!n) return false;
      // A single character only counts in scripts where one character is a
      // word, or when it is the whole phrase (e.g. a number).
      if (chars < 2 && !dense) return n === query;
      if (n.includes(query)) return true;
      if (chars >= 4 && [...n].length >= (dense ? 1 : 3)) {
        return spaced ? ` ${query} `.includes(` ${n} `) : query.includes(n);
      }
      return false;
    });
  })
    .slice(0, 8)
    .map((c) => c.id);
}

// Translation as you type, like Google Translate: a pause in typing (or a
// language change) asks the AI translator, which also explains the
// translation word by word. Without the AI key the phrasebook still answers
// whatever it knows.
const PAUSE_MS = 650;

type Ai = { status: "idle" | "loading" | "done" | "error"; result?: TranslateResult; error?: string | { key: UiKey }; for?: string };

export default function Translator() {
  const speak = useSpeakLanguage();
  const { t, lang } = useT();
  const [fromChoice, setFrom] = useState<string | null>(null);
  const [toChoice, setTo] = useState<string | null>(null);
  const from = fromChoice ?? speak;
  const preferredTo = toChoice ?? (speak === "es" ? "en" : "es");
  // Never translate a language into itself.
  const to = preferredTo !== from ? preferredTo : from === "en" ? "es" : "en";
  const [text, setText] = useState("");
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [ai, setAi] = useState<Ai>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const cache = useRef(new Map<string, TranslateResult>());

  // "Detect language" has no phrasebook; the learner's own language stands in for matching.
  const matchFrom = from === "auto" ? speak : from;
  const fromState = useContent(matchFrom);
  const toState = useContent(to);
  const fromContent = fromState.content;
  const toContent = toState.content;
  const toLang = getLanguage(to)!;
  const fromLang = getLanguage(matchFrom) ?? getLanguage("en")!;
  const fromName = from === "auto" ? t("account.translate.detect") : languageName(fromLang.code, lang, false);
  const toName = languageName(toLang.code, lang, false);
  // The course to send learners to: whichever side isn't their own language.
  const learnLang = to === speak && from !== speak && from !== "auto" ? from : to;

  useEffect(() => {
    fetch("/api/translate")
      .then((r) => r.json())
      .then((d) => setAiEnabled(Boolean(d.enabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  const input = text.trim();
  const key = `${from}>${to}>${speak}:${input}`;
  useEffect(() => {
    if (!aiEnabled || !input) return;
    const hit = cache.current.get(key);
    if (hit) {
      setAi({ status: "done", result: hit, for: key });
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setAi((a) => ({ ...a, status: "loading" }));
      try {
        const r = await fetch("/api/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: input, from, to, explain: speak }),
          signal: ctrl.signal,
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d.result) setAi({ status: "error", error: d.error ?? { key: "account.translate.error" } });
        else {
          cache.current.set(key, d.result);
          setAi({ status: "done", result: d.result, for: key });
          track("translate_ai", { lang: to });
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setAi({ status: "error", error: { key: "account.translate.offline" } });
      }
    }, PAUSE_MS);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [aiEnabled, input, from, to, key, speak]);

  const query = fold(text);
  const ready = query.length > 0 && ([...query].length >= 2 || DENSE_SCRIPT.test(query) || /\p{N}/u.test(query));
  const matches = ready && fromContent && toContent ? findMatches(query, fromContent) : [];
  // An exact phrasebook hit can fill the output box on its own.
  const exact = matches.find((id) => {
    const p = fromContent?.phrases[id];
    return p && [p.text, p.roman].some((s) => s && fold(s) === query);
  });
  const result = input && ai.for === key ? ai.result : undefined;
  const output = result?.translation ?? (exact && toContent?.phrases[exact]?.text) ?? "";
  const outputRoman = result ? result.romanization : exact ? toContent?.phrases[exact]?.roman : "";
  const loading = Boolean(input) && aiEnabled === true && !result;

  function pickFrom(v: string) {
    if (v === to) setTo(from === "auto" ? speak : from);
    setFrom(v);
  }
  function pickTo(v: string) {
    if (v === from) setFrom(to);
    setTo(v);
  }
  function swap() {
    // Carry the translation over so the text box always matches its language.
    setText(output.slice(0, MAX));
    setFrom(to);
    setTo(from === "auto" ? speak : from);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  const example = fromContent?.phrases.how_much?.text ?? t("account.translate.exampleFallback");
  const status = loading ? t("account.translate.translating") : output ? t("account.translate.ready", { translation: output }) : "";

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-sand-300 bg-card shadow-soft">
        {/* Language bar */}
        <div className="flex items-center gap-1 border-b border-sand-300 px-2 py-1">
          <LangSelect id="from" label={t("account.translate.from")} value={from} onChange={pickFrom} detect={t("account.translate.detect")} />
          <button
            type="button"
            onClick={swap}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-600 hover:bg-sand-100"
            aria-label={t("account.translate.swap")}
          >
            <ArrowLeftRight size={20} aria-hidden />
          </button>
          <LangSelect id="to" label={t("account.translate.to")} value={to} onChange={pickTo} />
        </div>

        <div className="grid md:grid-cols-2">
          {/* Input */}
          <div className="relative border-b border-sand-300 md:border-r md:border-b-0">
            <label htmlFor="text" className="sr-only">
              {from === "auto" ? t("account.translate.textLabelAuto") : t("account.translate.textLabel", { language: fromName })}
            </label>
            <textarea
              id="text"
              dir={from === "auto" ? "auto" : fromLang.dir}
              lang={from === "auto" ? undefined : fromLang.speech}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX))}
              rows={4}
              placeholder={`${FSI}${
                from === "auto"
                  ? t("account.translate.placeholderAuto", { example: `${FSI}${example}${PDI}` })
                  : t("account.translate.placeholder", { language: fromName, example: `${FSI}${example}${PDI}` })
              }${PDI}`}
              className="block min-h-44 w-full resize-none bg-transparent px-5 pt-5 pb-12 text-2xl leading-snug outline-none placeholder:text-lg placeholder:text-ink-500"
            />
            {text && (
              <button
                type="button"
                onClick={() => setText("")}
                className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full text-ink-500 hover:bg-sand-100 rtl:right-auto rtl:left-3"
                aria-label={t("account.translate.clear")}
              >
                <X size={20} aria-hidden />
              </button>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-4 pb-3 text-xs text-ink-500">
              <span>{input && from !== "auto" && <SpeakButton text={input} tag={fromLang.speech} languageName={fromName} />}</span>
              <span>
                {text.length}/{MAX}
              </span>
            </div>
          </div>

          {/* Output */}
          <div className="relative min-h-44 bg-sand-100/60 px-5 pt-5 pb-14" aria-busy={loading}>
            <h2 className="sr-only">{t("account.translate.output")}</h2>
            {output ? (
              <>
                <p dir={toLang.dir} lang={toLang.speech} className={`text-2xl leading-snug text-ink-900 ${loading ? "opacity-50" : ""}`}>
                  {output}
                </p>
                {outputRoman && <p className="mt-1 text-lg text-primary">{outputRoman}</p>}
              </>
            ) : loading ? (
              <p className="text-2xl text-ink-500">{t("account.translate.translating")}</p>
            ) : (
              <p className="text-2xl text-ink-500">{t("account.translate.output")}</p>
            )}
            {output && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-4 pb-3">
                <SpeakButton text={output} tag={toLang.speech} languageName={toName} />
                <button
                  type="button"
                  onClick={copy}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-600 hover:bg-sand-200"
                  aria-label={copied ? t("account.translate.copied") : t("account.translate.copy")}
                  title={copied ? t("account.translate.copied") : t("account.translate.copy")}
                >
                  {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="sr-only" role="status">
        {status}
      </p>
      {ai.status === "error" && input && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-4 text-danger">
          {typeof ai.error === "string" ? ai.error : t(ai.error?.key ?? "account.translate.error")}
        </p>
      )}
      {aiEnabled === false && input && !exact && <p className="mt-4 rounded-xl bg-sand-100 p-4 text-ink-700">{t("account.translate.notOn")}</p>}

      {result && (result.breakdown.length > 0 || result.note) && (
        <section className="mt-6 rounded-3xl bg-primary-soft p-6">
          <h2 className="eyebrow flex items-center gap-1.5">
            <Sparkles size={14} aria-hidden /> {t("account.translate.learnTitle")}
          </h2>
          {result.breakdown.length > 0 && (
            <table className="mt-3 w-full rounded-2xl bg-card text-start text-sm">
              <caption className="sr-only">{t("account.translate.wordByWord")}</caption>
              <thead className="text-ink-500">
                <tr>
                  <th className="px-3 py-1 text-start font-medium">{t("account.translate.word")}</th>
                  <th className="px-3 py-1 text-start font-medium">{t("account.translate.meaning")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {result.breakdown.map((w, i) => (
                  <tr key={i}>
                    <td dir={toLang.dir} className="px-3 py-2 text-start align-top">
                      <span lang={toLang.speech} className="font-semibold text-ink-900">
                        {w.word}
                      </span>
                      {w.romanization && (
                        <span dir="ltr" className="block text-primary">
                          {w.romanization}
                        </span>
                      )}
                    </td>
                    <td dir="auto" className="px-3 py-2 text-start align-top text-ink-700">
                      {w.meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {result.note && (
            <p dir="auto" className="mt-3 text-sm text-ink-600">
              💡 {result.note}
            </p>
          )}
          <p className="mt-3 text-xs text-ink-500">{t("account.translate.aiWarning")}</p>
        </section>
      )}

      {(fromState.failed || toState.failed || matches.length > 0) && (
        <section className="mt-8">
          <p className="eyebrow">{t("account.translate.matchesEyebrow")}</p>
          <h2 className="mt-1 text-xl font-extrabold text-ink-900">{t("account.translate.matchesTitle")}</h2>
          {fromState.failed || toState.failed ? (
            <p className="mt-2 text-ink-600">
              {t("account.translate.loadFailed")}{" "}
              <button
                className="font-medium text-primary underline"
                onClick={() => {
                  if (fromState.failed) fromState.retry();
                  if (toState.failed) toState.retry();
                }}
              >
                {t("account.translate.retry")}
              </button>
            </p>
          ) : (
            fromContent &&
            toContent && (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {matches.map((id) => {
                  const src = fromContent.phrases[id];
                  const dst = toContent.phrases[id];
                  return (
                    <li key={id} className="flex flex-col gap-3 rounded-3xl border border-sand-300 bg-card p-5 shadow-soft">
                      <div className="min-w-0">
                        <p dir={fromLang.dir} lang={fromLang.speech} className="text-sm text-ink-500">
                          {src.text}
                        </p>
                        <p dir={toLang.dir} lang={toLang.speech} className="font-display text-2xl font-black text-ink-900">
                          {dst?.text}
                        </p>
                        {dst?.roman && <p className="text-primary">{dst.roman}</p>}
                        {dst?.note && <p className="mt-1 text-sm text-ink-500">💡 {dst.note}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        {dst && <SpeakButton text={dst.text} tag={toLang.speech} languageName={toName} />}
                        {learnLang !== speak && (
                          <Link href={`/learn/${learnLang}/${UNIT_OF[id]}`} className="text-sm text-primary hover:underline">
                            {t("account.translate.learnIt", { language: languageName(learnLang, lang, false) })}
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          )}
        </section>
      )}
    </div>
  );
}
