"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lesson, Phrase } from "@/lib/lessons";
import { markDone } from "@/lib/progress";
import SpeakButton, { speak } from "./SpeakButton";

type Mode = "learn" | "cards" | "quiz";

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Question = { phrase: Phrase; options: string[] };

function buildQuiz(phrases: Phrase[]): Question[] {
  return shuffle(phrases).map((phrase) => {
    const wrong = shuffle(phrases.filter((p) => p.en !== phrase.en)).slice(0, 3);
    return { phrase, options: shuffle([phrase.en, ...wrong.map((p) => p.en)]) };
  });
}

export default function LessonPlayer({ lesson, next }: { lesson: Lesson; next?: Lesson }) {
  const [mode, setMode] = useState<Mode>("learn");

  return (
    <div>
      <div role="tablist" className="mb-6 flex gap-2">
        {(
          [
            ["learn", "1. Learn"],
            ["cards", "2. Flashcards"],
            ["quiz", "3. Quiz"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              mode === m ? "bg-ink-900 text-white" : "bg-sand-100 text-ink-700 hover:bg-sand-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "learn" && <LearnList phrases={lesson.phrases} onNext={() => setMode("cards")} />}
      {mode === "cards" && <Flashcards phrases={lesson.phrases} onNext={() => setMode("quiz")} />}
      {mode === "quiz" && <Quiz lesson={lesson} next={next} />}
    </div>
  );
}

function LearnList({ phrases, onNext }: { phrases: Phrase[]; onNext: () => void }) {
  return (
    <div>
      <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200 bg-white">
        {phrases.map((p) => (
          <li key={p.ar} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-lg font-semibold text-ink-900">{p.say}</p>
              <p className="text-ink-600">{p.en}</p>
              {p.note && <p className="mt-1 text-sm text-ink-500">💡 {p.note}</p>}
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end">
              <p dir="rtl" lang="ar" className="font-arabic text-2xl text-ink-900">
                {p.ar}
              </p>
              <SpeakButton text={p.ar} />
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

function Flashcards({ phrases, onNext }: { phrases: Phrase[]; onNext: () => void }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const p = phrases[i];
  const last = i === phrases.length - 1;

  function go(to: number) {
    setI(to);
    setFlipped(false);
  }

  return (
    <div className="flex flex-col items-center">
      <p className="mb-3 text-sm text-ink-500">
        Card {i + 1} of {phrases.length} — tap the card to see the Arabic
      </p>
      <button
        onClick={() => {
          if (!flipped) speak(p.ar);
          setFlipped(!flipped);
        }}
        className="flex min-h-56 w-full max-w-md flex-col items-center justify-center rounded-3xl border border-sand-200 bg-white p-8 text-center shadow-sm"
      >
        {flipped ? (
          <>
            <span dir="rtl" lang="ar" className="font-arabic text-4xl text-ink-900">
              {p.ar}
            </span>
            <span className="mt-3 text-xl font-semibold text-teal-700">{p.say}</span>
          </>
        ) : (
          <>
            <span className="text-sm uppercase tracking-wide text-ink-500">How do you say…</span>
            <span className="mt-2 text-2xl font-semibold text-ink-900">{p.en}</span>
          </>
        )}
      </button>
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

function Quiz({ lesson, next }: { lesson: Lesson; next?: Lesson }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  function start() {
    setQuestions(buildQuiz(lesson.phrases));
    setI(0);
    setPicked(null);
    setScore(0);
  }

  if (!questions) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center">
        <p className="text-lg text-ink-700">
          {lesson.phrases.length} quick questions. Hear the Arabic, pick the meaning.
        </p>
        <button onClick={start} className="btn-primary mt-6">
          Start the quiz
        </button>
      </div>
    );
  }

  if (i >= questions.length) {
    const passed = score / questions.length >= 0.7;
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center">
        <p className="text-5xl">{passed ? "🎉" : "💪"}</p>
        <p className="mt-4 text-2xl font-semibold text-ink-900">
          {score} out of {questions.length}
        </p>
        <p className="mt-2 text-ink-600">
          {passed ? "Lesson complete. Mabrook!" : "Keep going — get 70% to complete the lesson."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={start} className="btn-secondary">
            Try again
          </button>
          {passed && next && (
            <Link href={`/learn/${next.slug}`} className="btn-primary">
              Next: {next.title} →
            </Link>
          )}
          {passed && !next && (
            <Link href="/learn" className="btn-primary">
              Back to all lessons
            </Link>
          )}
        </div>
      </div>
    );
  }

  const q = questions[i];

  function choose(option: string) {
    if (picked || !questions) return;
    setPicked(option);
    const right = option === q.phrase.en;
    const newScore = score + (right ? 1 : 0);
    if (right) setScore(newScore);
    if (i === questions.length - 1 && newScore / questions.length >= 0.7) markDone(lesson.slug);
  }

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6 sm:p-8">
      <p className="text-sm text-ink-500">
        Question {i + 1} of {questions.length}
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 text-center">
        <p dir="rtl" lang="ar" className="font-arabic text-4xl text-ink-900">
          {q.phrase.ar}
        </p>
        <p className="text-xl font-semibold text-teal-700">{q.phrase.say}</p>
        <SpeakButton text={q.phrase.ar} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {q.options.map((o) => {
          const isRight = o === q.phrase.en;
          const state = !picked
            ? "border-sand-200 hover:border-teal-600"
            : isRight
              ? "border-teal-600 bg-teal-50"
              : o === picked
                ? "border-red-400 bg-red-50"
                : "border-sand-200 opacity-60";
          return (
            <button
              key={o}
              onClick={() => choose(o)}
              className={`rounded-xl border-2 p-4 text-left text-ink-900 ${state}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked && (
        <button
          onClick={() => {
            setI(i + 1);
            setPicked(null);
          }}
          className="btn-primary mt-6"
        >
          {i === questions.length - 1 ? "See my score" : "Next question →"}
        </button>
      )}
    </div>
  );
}
