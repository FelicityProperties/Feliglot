"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { LangInfo, LessonPhrase } from "@/lib/types";
import { getLanguage } from "@/lib/languages";
import { addXp, markUnitDone, useSpeakLanguage } from "@/lib/store";
import { speak } from "@/lib/speech";
import { useContent } from "@/lib/useContent";
import SpeakButton from "./SpeakButton";

type Mode = "learn" | "cards" | "quiz";
const PASS = 0.7;
const XP_PER_ANSWER = 10;

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

type Shown = LessonPhrase & { meaning: string };
// "read": see the phrase, pick its meaning. "recall": see the meaning, pick the phrase.
// Questions hold ids only, so the text always comes from the current language.
type Question = { id: string; kind: "read" | "recall"; options: string[] };

// Some phrases are worded the same in a language (e.g. "sorry" and "excuse
// me"). A wrong option must differ from the right one on both sides —
// the prompt and the answer — or a learner could be marked wrong for a
// correct pick.
function buildQuiz(phrases: Shown[]): Question[] {
  return shuffle(phrases).map((phrase, i) => {
    const kind = i % 2 === 0 ? "read" : "recall";
    const answer = (p: Shown) => norm(kind === "read" ? p.meaning : p.text);
    const prompt = (p: Shown) => norm(kind === "read" ? p.text : p.meaning);
    const seen = new Set([answer(phrase)]);
    const wrong: string[] = [];
    for (const p of shuffle(phrases)) {
      if (wrong.length === 3) break;
      if (p.id === phrase.id || seen.has(answer(p)) || prompt(p) === prompt(phrase)) continue;
      seen.add(answer(p));
      wrong.push(p.id);
    }
    return { id: phrase.id, kind, options: shuffle([phrase.id, ...wrong]) };
  });
}

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
  phrases,
  next,
}: {
  lang: LangInfo;
  unit: string;
  phrases: LessonPhrase[];
  next?: { slug: string; title: string };
}) {
  const [mode, setMode] = useState<Mode>("learn");
  const speakCode = useSpeakLanguage();
  // Meanings are shown in the language the learner speaks. English is used
  // while that loads, and when they are learning their own language.
  const base = speakCode !== lang.code ? speakCode : "en";
  const { content: baseContent } = useContent(base === "en" ? null : base);
  const baseReady = base === "en" || Boolean(baseContent);
  const baseInfo = (baseReady && getLanguage(base)) || getLanguage("en")!;
  const meaning: Meaning = { dir: baseInfo.dir, lang: baseInfo.speech };
  const shown: Shown[] = phrases.map((p) => ({
    ...p,
    meaning: (baseReady && baseContent?.phrases[p.id]?.text) || p.en,
  }));

  return (
    <div>
      <nav aria-label="Lesson steps" className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["learn", "1. Learn"],
            ["cards", "2. Flashcards"],
            ["quiz", "3. Quiz"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            aria-current={mode === m ? "step" : undefined}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === m ? "bg-ink-900 text-white" : "bg-sand-100 text-ink-700 hover:bg-sand-200"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {mode === "learn" && <LearnList lang={lang} phrases={shown} meaning={meaning} onNext={() => setMode("cards")} />}
      {mode === "cards" && <Flashcards lang={lang} phrases={shown} meaning={meaning} onNext={() => setMode("quiz")} />}
      {mode === "quiz" && (
        // Remount when the meaning language changes so a quiz never mixes languages.
        <Quiz key={baseInfo.code} lang={lang} unit={unit} phrases={shown} meaning={meaning} ready={baseReady} next={next} />
      )}
    </div>
  );
}

type Meaning = { dir: "ltr" | "rtl"; lang: string };
type Common = { lang: LangInfo; phrases: Shown[]; meaning: Meaning };

function Target({ lang, p, size }: { lang: LangInfo; p: Shown; size: "md" | "lg" }) {
  return (
    <span className="flex flex-col">
      <span dir={lang.dir} lang={lang.speech} className={size === "lg" ? "text-3xl font-semibold sm:text-4xl" : "text-2xl font-semibold"}>
        {p.text}
      </span>
      {p.roman && (
        <span dir="ltr" className={`${size === "lg" ? "mt-2 text-lg" : "text-base"} text-teal-700`}>
          {p.roman}
        </span>
      )}
    </span>
  );
}

function LearnList({ lang, phrases, meaning, onNext }: Common & { onNext: () => void }) {
  return (
    <div>
      <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200 bg-white">
        {phrases.map((p) => (
          <li key={p.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 text-ink-900">
              <Target lang={lang} p={p} size="md" />
              <p dir={meaning.dir} lang={meaning.lang} className="mt-1 text-ink-600">
                {p.meaning}
              </p>
              {p.note && <p className="mt-1 text-sm text-ink-500">💡 {p.note}</p>}
            </div>
            <div className="shrink-0">
              <SpeakButton text={p.text} tag={lang.speech} languageName={lang.name} />
            </div>
          </li>
        ))}
      </ul>
      <button onClick={onNext} className="btn-primary mt-6">
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
      <p ref={headingRef} tabIndex={-1} className="mb-3 text-sm text-ink-500 outline-none">
        Card {i + 1} of {phrases.length} — tap the card to turn it over
      </p>
      <button
        onClick={() => {
          if (!flipped) speak(p.text, lang.speech);
          setFlipped(!flipped);
        }}
        aria-pressed={flipped}
        className="flex min-h-56 w-full max-w-md flex-col items-center justify-center rounded-3xl border border-sand-200 bg-white p-8 text-center text-ink-900 shadow-sm"
      >
        {flipped ? (
          <Target lang={lang} p={p} size="lg" />
        ) : (
          <>
            <span className="text-sm uppercase tracking-wide text-ink-500">How do you say…</span>
            <span dir={meaning.dir} lang={meaning.lang} className="mt-2 text-2xl font-semibold">
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
      <div className="mt-6 flex gap-3">
        <button disabled={i === 0} onClick={() => go(i - 1)} className="btn-secondary disabled:opacity-40">
          ← Back
        </button>
        {last ? (
          <button onClick={onNext} className="btn-primary">
            Take the quiz →
          </button>
        ) : (
          <button onClick={() => go(i + 1)} className="btn-primary">
            Next card →
          </button>
        )}
      </div>
    </div>
  );
}

function Quiz({
  lang,
  unit,
  phrases,
  meaning,
  ready,
  next,
}: Common & { unit: string; ready: boolean; next?: { slug: string; title: string } }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const headingRef = useFocusOnChange<HTMLParagraphElement>(questions ? i : -1);
  const byId = Object.fromEntries(phrases.map((p) => [p.id, p]));

  function start() {
    setQuestions(buildQuiz(phrases));
    setI(0);
    setPicked(null);
    setScore(0);
  }

  if (!questions) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center">
        <p className="text-lg text-ink-700">{phrases.length} quick questions. Get 70% or more to pass the lesson.</p>
        <button onClick={start} disabled={!ready} className="btn-primary mt-6 disabled:opacity-50">
          {ready ? "Start the quiz" : "Loading…"}
        </button>
      </div>
    );
  }

  if (i >= questions.length) {
    const passed = score / questions.length >= PASS;
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center">
        <p className="text-5xl" aria-hidden>
          {passed ? "🎉" : "💪"}
        </p>
        <p ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-semibold text-ink-900 outline-none">
          {score} out of {questions.length}
        </p>
        <p className="mt-2 text-ink-600">
          {passed ? `Lesson passed — +${score * XP_PER_ANSWER} points.` : "Keep going — get 70% to pass the lesson."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={start} className="btn-secondary">
            Try again
          </button>
          {passed && next && (
            <Link href={`/learn/${lang.code}/${next.slug}`} className="btn-primary">
              Next: {next.title} →
            </Link>
          )}
          {passed && !next && (
            <Link href={`/learn/${lang.code}`} className="btn-primary">
              Back to the course
            </Link>
          )}
        </div>
      </div>
    );
  }

  const q = questions[i];
  const phrase = byId[q.id];
  const right = picked === q.id;
  const answerText = q.kind === "read" ? phrase.meaning : phrase.text;

  function choose(id: string) {
    if (picked || !questions) return;
    setPicked(id);
    const isRight = id === q.id;
    const newScore = score + (isRight ? 1 : 0);
    if (isRight) {
      setScore(newScore);
      addXp(XP_PER_ANSWER);
    }
    if (q.kind === "recall") speak(phrase.text, lang.speech);
    if (i === questions.length - 1 && newScore / questions.length >= PASS) markUnitDone(lang.code, unit);
  }

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8">
      <p ref={headingRef} tabIndex={-1} className="text-sm text-ink-500 outline-none">
        Question {i + 1} of {questions.length} ·{" "}
        {q.kind === "read" ? "What does this mean?" : `How do you say this in ${lang.name}?`}
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 text-center text-ink-900">
        {q.kind === "read" ? (
          <>
            <Target lang={lang} p={phrase} size="lg" />
            <SpeakButton text={phrase.text} tag={lang.speech} languageName={lang.name} />
          </>
        ) : (
          <p dir={meaning.dir} lang={meaning.lang} className="text-3xl font-semibold">
            {phrase.meaning}
          </p>
        )}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.options.map((id) => {
          const o = byId[id];
          const isRight = id === q.id;
          const state = !picked
            ? "border-sand-200 hover:border-teal-600"
            : isRight
              ? "border-teal-600 bg-teal-50"
              : id === picked
                ? "border-red-400 bg-red-50"
                : "border-sand-200 opacity-60";
          return (
            <button
              key={id}
              onClick={() => choose(id)}
              aria-disabled={Boolean(picked)}
              className={`rounded-xl border-2 p-4 text-start text-ink-900 ${state}`}
            >
              {q.kind === "read" ? (
                <span dir={meaning.dir} lang={meaning.lang}>
                  {o.meaning}
                </span>
              ) : (
                <span className="flex flex-col">
                  <span dir={lang.dir} lang={lang.speech} className="text-lg">
                    {o.text}
                  </span>
                  {o.roman && (
                    <span dir="ltr" className="text-sm text-teal-700">
                      {o.roman}
                    </span>
                  )}
                </span>
              )}
              {picked && isRight && <span className="sr-only"> — correct answer</span>}
              {picked && !isRight && id === picked && <span className="sr-only"> — your answer</span>}
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex min-h-12 flex-wrap items-center gap-4">
        {/* Always mounted, so screen readers announce each new result. */}
        <p role="status" className={right ? "font-medium text-teal-700" : "font-medium text-red-600"}>
          {!picked ? (
            ""
          ) : right ? (
            `Correct! +${XP_PER_ANSWER}`
          ) : (
            <>
              Not quite — the answer is “
              <bdi lang={q.kind === "read" ? meaning.lang : lang.speech}>{answerText}</bdi>”.
            </>
          )}
        </p>
        {picked && (
          <button
            onClick={() => {
              setI(i + 1);
              setPicked(null);
            }}
            className="btn-primary"
          >
            {i === questions.length - 1 ? "See my score" : "Next question →"}
          </button>
        )}
      </div>
    </div>
  );
}
