"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { languageName, useT } from "@/lib/i18n";
import { LANGUAGES_BY_NAME, getLanguage } from "@/lib/languages";
import { CONCEPTS, UNITS } from "@/lib/curriculum";
import { useSpeakLanguage } from "@/lib/store";
import { useContent } from "@/lib/useContent";
import { DENSE_SCRIPT, NO_SPACES, fold } from "@/lib/fold";
import type { LangContent, TranslateResult } from "@/lib/types";
import { ArrowLeftRight, Sparkles } from "lucide-react";
import { track } from "@/lib/track";
import type { UiKey } from "@/lib/ui";
import SpeakButton from "./SpeakButton";

const MAX = 300;
const UNIT_OF = Object.fromEntries(UNITS.flatMap((u) => u.concepts.map((c) => [c.id, u.slug])));
// Bidi isolates keep a sentence in the site's language readable inside a box in the other direction.
const FSI = "⁨";
const PDI = "⁩";

function LangSelect({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const { lang } = useT();
  return (
    <div className="flex-1">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink-600">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input py-3"
      >
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

export default function Translator() {
  const speak = useSpeakLanguage();
  const { t, lang } = useT();
  const [fromChoice, setFrom] = useState<string | null>(null);
  const [toChoice, setTo] = useState<string | null>(null);
  const from = fromChoice ?? speak;
  const preferredTo = toChoice ?? "es";
  // Never translate a language into itself.
  const to = preferredTo !== from ? preferredTo : from === "en" ? "es" : "en";
  const [text, setText] = useState("");
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [ai, setAi] = useState<{ loading: boolean; result?: TranslateResult; error?: string | { key: UiKey }; for?: string }>({ loading: false });

  const fromState = useContent(from);
  const toState = useContent(to);
  const fromContent = fromState.content;
  const toContent = toState.content;
  const toLang = getLanguage(to)!;
  const fromLang = getLanguage(from) ?? getLanguage("en")!;
  const fromName = languageName(fromLang.code, lang, false);
  const toName = languageName(toLang.code, lang, false);
  // The course to send learners to: whichever side isn't their own language.
  const learnLang = to === speak && from !== speak ? from : to;

  useEffect(() => {
    fetch("/api/translate")
      .then((r) => r.json())
      .then((d) => setAiEnabled(Boolean(d.enabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  const query = fold(text);
  const ready = query.length > 0 && ([...query].length >= 2 || DENSE_SCRIPT.test(query) || /\p{N}/u.test(query));
  const matches = ready && fromContent && toContent ? findMatches(query, fromContent) : [];
  const aiCurrent = Boolean(ai.result) && ai.for === `${from}>${to}:${text.trim()}`;

  function pickFrom(v: string) {
    if (v === to) setTo(from);
    setFrom(v);
  }
  function pickTo(v: string) {
    if (v === from) setFrom(to);
    setTo(v);
  }
  function swap() {
    // Carry the translation over so the text box always matches its language.
    let next = "";
    if (aiCurrent && ai.result) next = ai.result.translation;
    else if (matches.length === 1 && toContent?.phrases[matches[0]]) next = toContent.phrases[matches[0]].text;
    setText(next.slice(0, MAX));
    setFrom(to);
    setTo(from);
    setAi({ loading: false });
  }

  async function translate() {
    const input = text.trim();
    if (!input || ai.loading) return;
    setAi({ loading: true });
    try {
      const r = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: input, from, to }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.result) setAi({ loading: false, error: d.error ?? { key: "account.translate.error" } });
      else {
        setAi({ loading: false, result: d.result, for: `${from}>${to}:${input}` });
        track("translate_ai", { lang: to });
      }
    } catch {
      setAi({ loading: false, error: { key: "account.translate.offline" } });
    }
  }

  const example = fromContent?.phrases.how_much?.text ?? t("account.translate.exampleFallback");
  const busy = !text.trim() || ai.loading;
  const status = ai.loading
    ? t("account.translate.translating")
    : aiCurrent && ai.result
      ? t("account.translate.ready", { translation: ai.result.translation })
      : "";

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <LangSelect id="from" label={t("account.translate.from")} value={from} onChange={pickFrom} />
        <button
          type="button"
          onClick={swap}
          className="grid h-12 w-12 place-items-center self-center rounded-2xl border border-sand-300 bg-card text-primary shadow-soft sm:self-end"
          aria-label={t("account.translate.swap")}
        >
          <ArrowLeftRight size={20} aria-hidden />
        </button>
        <LangSelect id="to" label={t("account.translate.to")} value={to} onChange={pickTo} />
      </div>

      <label htmlFor="text" className="sr-only">
        {t("account.translate.textLabel", { language: fromName })}
      </label>
      <textarea
        id="text"
        dir={fromLang.dir}
        lang={fromLang.speech}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        rows={3}
        placeholder={`${FSI}${t("account.translate.placeholder", { language: fromName, example: `${FSI}${example}${PDI}` })}${PDI}`}
        className="input mt-4 min-h-32 resize-y text-xl"
      />
      <div className="mt-1 flex items-center justify-between gap-3 text-xs text-ink-500">
        <span>
          {text.length}/{MAX}
        </span>
        {aiEnabled && (
          <button onClick={translate} aria-disabled={busy} className={`btn-primary py-2! ${busy ? "opacity-50" : ""}`}>
            {ai.loading ? t("account.translate.translating") : t("account.translate.button")}
          </button>
        )}
      </div>

      <p className="sr-only" role="status">
        {status}
      </p>
      {ai.error && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">
          {typeof ai.error === "string" ? ai.error : t(ai.error.key)}
        </p>
      )}

      {aiCurrent && ai.result && (
        <section className="mt-6 rounded-3xl bg-primary-soft p-6">
          <h2 className="eyebrow flex items-center gap-1.5">
            <Sparkles size={14} aria-hidden /> {t("account.translate.aiTitle")}
          </h2>
          <p dir={toLang.dir} lang={toLang.speech} className="mt-2 font-display text-3xl font-black text-ink-900">
            {ai.result.translation}
          </p>
          {ai.result.romanization && <p className="text-lg text-teal-700">{ai.result.romanization}</p>}
          <div className="mt-2">
            <SpeakButton text={ai.result.translation} tag={toLang.speech} languageName={toName} />
          </div>
          {ai.result.breakdown.length > 0 && (
            <table className="mt-5 w-full rounded-2xl bg-card text-start text-sm">
              <caption className="sr-only">{t("account.translate.wordByWord")}</caption>
              <thead className="text-ink-500">
                <tr>
                  <th className="py-1 pr-3 text-start font-medium">{t("account.translate.word")}</th>
                  <th className="py-1 text-start font-medium">{t("account.translate.meaning")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {ai.result.breakdown.map((w, i) => (
                  <tr key={i}>
                    <td dir={toLang.dir} className="py-2 pr-3 text-start align-top">
                      <span lang={toLang.speech} className="font-semibold text-ink-900">
                        {w.word}
                      </span>
                      {w.romanization && (
                        <span dir="ltr" className="block text-teal-700">
                          {w.romanization}
                        </span>
                      )}
                    </td>
                    <td dir={fromLang.dir} lang={fromLang.speech} className="py-2 text-start align-top text-ink-700">
                      {w.meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {ai.result.note && (
            <p dir={fromLang.dir} lang={fromLang.speech} className="mt-3 text-sm text-ink-600">
              💡 {ai.result.note}
            </p>
          )}
          <p className="mt-3 text-xs text-ink-500">{t("account.translate.aiWarning")}</p>
        </section>
      )}

      <section className="mt-8">
        <p className="eyebrow">{t("account.translate.matchesEyebrow")}</p>
        <h2 className="mt-1 text-xl font-extrabold text-ink-900">{t("account.translate.matchesTitle")}</h2>
        {fromState.failed || toState.failed ? (
          <p className="mt-2 text-ink-600">
            {t("account.translate.loadFailed")}{" "}
            <button
              className="font-medium text-teal-700 underline"
              onClick={() => {
                if (fromState.failed) fromState.retry();
                if (toState.failed) toState.retry();
              }}
            >
              {t("account.translate.retry")}
            </button>
          </p>
        ) : !ready ? (
          <p className="mt-2 text-ink-600">
            {t("account.translate.startTyping")}
            {aiEnabled === false && ` ${t("account.translate.aiSoon")}`}
          </p>
        ) : !fromContent || !toContent ? (
          <p className="mt-2 text-ink-600">{t("account.translate.loadingPhrases")}</p>
        ) : matches.length === 0 ? (
          <p className="mt-2 text-ink-600">
            {t("account.translate.noMatch")}
            {aiEnabled && ` ${t("account.translate.useAi")}`}
          </p>
        ) : (
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
                      <Link href={`/learn/${learnLang}/${UNIT_OF[id]}`} className="text-sm text-teal-700 hover:underline">
                        {t("account.translate.learnIt", { language: languageName(learnLang, lang, false) })}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
