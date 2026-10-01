"use client";

import { useEffect, useRef, useState } from "react";
import type { LangInfo, LessonPhrase } from "@/lib/types";
import type { Meaning, Result, Shown } from "@/lib/quiz";
import { markUnitDone } from "@/lib/store";
import { speak } from "@/lib/speech";
import { track } from "@/lib/track";
import { useMeanings } from "@/lib/useMeanings";
import LessonComplete, { scoreOf } from "./LessonComplete";
import QuizRunner from "./QuizRunner";
import SpeakButton from "./SpeakButton";

type Mode = "learn" | "cards" | "quiz";

// Moves keyboard/screen-reader focus to a view's heading when the view
// changes, but not on first load (the page shouldn't jump).
function useFocusOnChange<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    ref.current?.focus();
  }, [key]);
  return ref;
}

export default function LessonPlayer({
  lang,
  unit,
  title,
  phrases,
  next,
}: {
  lang: LangInfo;
  unit: string;
  title: string;
  phrases: LessonPhrase[];
  next?: { slug: string; title: string };
}) {
  const [mode, setMode] = useState<Mode>("learn");
  const { shown, meaning, ready, base } = useMeanings(lang.code, phrases);
  const [results, setResults] = useState<Result[] | null>(null);
  const [attempt, setAttempt] = useState(0);

  function finish(r: Result[]) {
    setResults(r);
    const { passed, right, total } = scoreOf(r);
    if (passed) {
      markUnitDone(lang.code, unit, phrases.map((p) => p.id));
      track("lesson_passed", { lang: lang.code, name: unit, value: total ? Math.round((right / total) * 100) : 0 });
    }
  }

  return (
    <div>
      <nav aria-label="Lesson steps" className="mb-6 flex gap-2">
        {(
          [
            ["learn", "Learn"],
            ["cards", "Flashcards"],
            ["quiz", "Quiz"],
          ] as const
        ).map(([m, label], n) => (
          <button
            key={m}
            aria-current={mode === m ? "step" : undefined}
            onClick={() => {
              setMode(m);
              setResults(null);
            }}
            className={`flex-1 rounded-2xl px-3 py-2.5 text-sm font-bold transition sm:flex-none sm:px-5 ${
              mode === m ? "bg-ink-900 text-background shadow-soft" : "bg-sand-100 text-ink-700 hover:bg-sand-200"
            }`}
          >
            <span className="opacity-60">{n + 1}.</span> {label}
          </button>
        ))}
      </nav>

      {mode === "learn" && <LearnList lang={lang} phrases={shown} meaning={meaning} onNext={() => setMode("cards")} />}
      {mode === "cards" && <Flashcards lang={lang} phrases={shown} meaning={meaning} onNext={() => setMode("quiz")} />}
      {mode === "quiz" &&
        (results ? (
          <LessonComplete
            results={results}
            title={`${title}: done!`}
            onRetry={() => {
              setResults(null);
              setAttempt((a) => a + 1);
            }}
            next={next ? { href: `/learn/${lang.code}/${next.slug}`, label: `Next: ${next.title}` } : undefined}
            back={{ href: `/learn/${lang.code}`, label: "Back to the course" }}
          />
        ) : !ready ? (
          <p className="text-ink-600">Loading…</p>
        ) : (
          // Remount for each attempt, and when the meaning language changes, so a quiz never mixes languages.
          <QuizRunner key={`${base}:${attempt}`} lang={lang} items={shown} meaning={meaning} onFinish={finish} />
        ))}
    </div>
  );
}

function Target({ lang, p, size }: { lang: LangInfo; p: Shown; size: "md" | "lg" }) {
  return (
    <span className="flex flex-col">
      <span dir={lang.dir} lang={lang.speech} className={size === "lg" ? "font-display text-3xl font-bold sm:text-4xl" : "font-display text-2xl font-bold"}>
        {p.text}
      </span>
      {p.roman && (
        <span dir="ltr" className={`${size === "lg" ? "mt-2 text-lg" : "text-base"} text-primary`}>
          {p.roman}
        </span>
      )}
    </span>
  );
}

type Common = { lang: LangInfo; phrases: Shown[]; meaning: Meaning };

function LearnList({ lang, phrases, meaning, onNext }: Common & { onNext: () => void }) {
  return (
    <div>
      <ul className="space-y-3">
        {phrases.map((p) => (
          <li
            key={p.id}
            className="flex flex-col gap-3 rounded-3xl border border-sand-200 bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 text-ink-900">
              <Target lang={lang} p={p} size="md" />
              <p dir={meaning.dir} lang={meaning.lang} className="mt-1 text-ink-600">
                {p.meaning}
              </p>
              {p.note && <p className="mt-2 rounded-xl bg-sand-100 px-3 py-2 text-sm text-ink-600">💡 {p.note}</p>}
            </div>
            <div className="shrink-0">
              <SpeakButton text={p.text} tag={lang.speech} languageName={lang.name} />
            </div>
          </li>
        ))}
      </ul>
      <button onClick={onNext} className="btn-primary mt-6 w-full sm:w-auto">
        Practise with flashcards →
      </button>
    </div>
  );
}

function Flashcards({ lang, phrases, meaning, onNext }: Common & { onNext: () => void }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const headingRef = useFocusOnChange<HTMLParagraphElement>(i);
  const p = phrases[i];
  const last = i === phrases.length - 1;

  function go(to: number) {
    setI(to);
    setFlipped(false);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 h-2 w-full max-w-md overflow-hidden rounded-full bg-sand-200" aria-hidden>
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${((i + 1) / phrases.length) * 100}%` }} />
      </div>
      <p ref={headingRef} tabIndex={-1} className="mb-3 text-sm text-ink-500 outline-none">
        Card {i + 1} of {phrases.length} — tap the card to turn it over
      </p>
      <button
        onClick={() => {
          if (!flipped) speak(p.text, lang.speech);
          setFlipped(!flipped);
        }}
        aria-pressed={flipped}
        className={`flip-card flex min-h-64 w-full max-w-md flex-col items-center justify-center rounded-3xl border border-sand-200 p-8 text-center text-ink-900 shadow-lift transition ${
          flipped ? "is-flipped bg-card" : "bg-gradient-to-br from-card to-sand-100"
        }`}
      >
        {flipped ? (
          <Target lang={lang} p={p} size="lg" />
        ) : (
          <>
            <span className="text-sm font-bold uppercase tracking-wide text-ink-500">How do you say…</span>
            <span dir={meaning.dir} lang={meaning.lang} className="mt-2 font-display text-3xl font-bold">
              {p.meaning}
            </span>
          </>
        )}
        <span className="sr-only">{flipped ? " (tap to see the meaning)" : " (tap to see the answer)"}</span>
      </button>
      <p className="sr-only" aria-live="polite">
        {flipped && (
          <>
            <span lang={lang.speech}>{p.text}</span>
            {p.roman ? `, ${p.roman}` : ""}
          </>
        )}
      </p>
      {flipped && p.note && <p className="mt-3 max-w-md text-center text-sm text-ink-500">💡 {p.note}</p>}
      <div className="mt-6 flex w-full max-w-md gap-3">
        <button disabled={i === 0} onClick={() => go(i - 1)} className="btn-secondary flex-1 disabled:opacity-40">
          ← Back
        </button>
        {last ? (
          <button onClick={onNext} className="btn-primary flex-1">
            Take the quiz →
          </button>
        ) : (
          <button onClick={() => go(i + 1)} className="btn-primary flex-1">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
