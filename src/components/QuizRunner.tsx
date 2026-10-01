"use client";

import { useEffect, useRef, useState } from "react";
import type { LangInfo } from "@/lib/types";
import { UNITS } from "@/lib/curriculum";
import { fold } from "@/lib/fold";
import { buildQuiz, type Kind, type Meaning, type Question, type Result, type Shown } from "@/lib/quiz";
import { closeEnough } from "@/lib/similarity";
import { listen, pauseSpeaking, recognitionSupported, speakingPaused, type Listening } from "@/lib/recognition";
import { speak } from "@/lib/speech";
import { addXp } from "@/lib/store";
import Feli from "./Feli";
import SpeakButton from "./SpeakButton";

export const XP_PER_ANSWER = 10;
const TYPE_THRESHOLD = 0.8; // forgives a typo or two
const SPEAK_THRESHOLD = 0.6; // speech recognition is imperfect, especially for learners

// Speech recognisers write spoken numbers as digits ("dos" comes back as "2").
const DIGITS: Record<string, string> = Object.fromEntries(
  UNITS.flatMap((u) => u.concepts).flatMap((c) => {
    const m = c.hint?.match(/^the number (\d+)$/);
    return m ? [[c.id, m[1]]] : [];
  }),
);

function Target({ lang, p, size = "lg" }: { lang: LangInfo; p: Shown; size?: "md" | "lg" }) {
  return (
    <span className="flex flex-col items-center">
      <span dir={lang.dir} lang={lang.speech} className={size === "lg" ? "font-display text-3xl font-bold sm:text-4xl" : "text-lg font-semibold"}>
        {p.text}
      </span>
      {p.roman && (
        <span dir="ltr" className={`${size === "lg" ? "mt-1 text-lg" : "text-sm"} text-primary`}>
          {p.roman}
        </span>
      )}
    </span>
  );
}

const PROMPTS: Record<Kind, (lang: LangInfo) => string> = {
  read: () => "What does this mean?",
  recall: (l) => `How do you say this in ${l.name}?`,
  type: (l) => `Type this in ${l.name}`,
  speak: () => "Say it out loud",
};

export default function QuizRunner({
  lang,
  items,
  pool,
  meaning,
  onFinish,
}: {
  lang: LangInfo;
  items: Shown[];
  pool?: Shown[];
  meaning: Meaning;
  onFinish: (results: Result[]) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>(() =>
    buildQuiz(items, pool ?? items, recognitionSupported() && !speakingPaused()),
  );
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [answered, setAnswered] = useState<{ correct: boolean; skipped?: boolean; picked?: string; heard?: string } | null>(null);
  const headingRef = useRef<HTMLParagraphElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const byId = Object.fromEntries([...(pool ?? []), ...items].map((p) => [p.id, p]));

  // Each question takes focus as it appears (the quiz never opens a page, so
  // this also catches focus when the quiz starts or restarts). A typing
  // question focuses its own input instead.
  useEffect(() => {
    if (questions[i].kind !== "type") headingRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the question changes
  }, [i]);
  useEffect(() => {
    if (answered) continueRef.current?.focus();
  }, [answered]);

  const q = questions[i];
  const phrase = byId[q.id];

  function answer(correct: boolean, extra: { picked?: string; heard?: string; skipped?: boolean } = {}) {
    if (answered) return;
    setAnswered({ correct, ...extra });
    if (correct) addXp(XP_PER_ANSWER);
    if (q.kind !== "read" && !extra.skipped) speak(phrase.text, lang.speech);
  }

  function next() {
    const all = [...results, { id: q.id, correct: Boolean(answered?.correct), skipped: answered?.skipped }];
    setResults(all);
    setAnswered(null);
    if (i === questions.length - 1) onFinish(all);
    else setI(i + 1);
  }

  const progress = (i + (answered ? 1 : 0)) / questions.length;
  const answerText = q.kind === "read" ? phrase.meaning : phrase.text;
  // In some languages two phrases share one meaning ("Bonjour" is both hello
  // and good morning), so typing either is right.
  const typeTargets = Object.values(byId)
    .filter((p) => p.id === phrase.id || fold(p.meaning) === fold(phrase.meaning))
    .flatMap((p) => [p.text, p.roman]);

  // "I can't speak right now" also turns the quiz's remaining speaking
  // questions into reading ones.
  function skipSpeaking() {
    pauseSpeaking();
    setQuestions((qs) => qs.map((x, j) => (j > i && x.kind === "speak" ? { ...x, kind: "read" } : x)));
    answer(false, { skipped: true });
  }

  return (
    <div className="pb-48">
      <div className="mb-5 flex items-center gap-3">
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-sand-200"
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={i + (answered ? 1 : 0)}
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${progress * 100}%` }} />
        </div>
        <span className="text-sm font-semibold text-ink-500">
          {i + 1}/{questions.length}
        </span>
      </div>

      <p ref={headingRef} tabIndex={-1} className="font-display text-xl font-bold text-ink-900 outline-none">
        {PROMPTS[q.kind](lang)}
      </p>

      <div className="mt-5 rounded-3xl border border-sand-200 bg-card p-6 text-center text-ink-900 shadow-soft">
        {q.kind === "read" || q.kind === "speak" ? (
          <div className="flex flex-col items-center gap-3">
            <Target lang={lang} p={phrase} />
            {q.kind === "speak" && (
              <p dir={meaning.dir} lang={meaning.lang} className="text-ink-600">
                {phrase.meaning}
              </p>
            )}
            <SpeakButton text={phrase.text} tag={lang.speech} languageName={lang.name} />
          </div>
        ) : (
          <p dir={meaning.dir} lang={meaning.lang} className="font-display text-3xl font-bold">
            {phrase.meaning}
          </p>
        )}
      </div>

      {(q.kind === "read" || q.kind === "recall") && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {q.options.map((id) => {
            const o = byId[id];
            const isRight = id === q.id;
            const state = !answered
              ? "border-sand-200 bg-card hover:border-primary active:scale-[0.98]"
              : isRight
                ? "border-success bg-success-soft"
                : id === answered.picked
                  ? "border-danger bg-danger-soft"
                  : "border-sand-200 bg-card opacity-60";
            return (
              <button
                key={id}
                onClick={() => answer(isRight, { picked: id })}
                aria-disabled={Boolean(answered)}
                className={`min-h-16 rounded-2xl border-2 p-4 text-start text-ink-900 transition ${state}`}
              >
                {q.kind === "read" ? (
                  <span dir={meaning.dir} lang={meaning.lang} className="text-lg">
                    {o.meaning}
                  </span>
                ) : (
                  <Target lang={lang} p={o} size="md" />
                )}
                {answered && isRight && <span className="sr-only"> — correct answer</span>}
                {answered && !isRight && id === answered.picked && <span className="sr-only"> — your answer</span>}
              </button>
            );
          })}
        </div>
      )}

      {q.kind === "type" && <TypeIt key={`t${i}`} lang={lang} latin={Boolean(phrase.roman)} targets={typeTargets} locked={Boolean(answered)} onAnswer={answer} />}
      {q.kind === "speak" && (
        <SayIt key={`s${i}`} lang={lang} phrase={phrase} locked={Boolean(answered)} onAnswer={answer} onSkip={skipSpeaking} />
      )}

      {/* Feedback sheet. Always mounted so screen readers announce each result. */}
      <div
        className={`px-safe fixed inset-x-0 bottom-0 z-40 border-t-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 transition-transform duration-300 ${
          !answered
            ? "pointer-events-none translate-y-full"
            : answered.skipped
              ? "border-sand-300 bg-sand-100"
              : answered.correct
                ? "border-success bg-success-soft"
                : "border-danger bg-danger-soft"
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-4">
          <Feli mood={!answered ? "happy" : answered.skipped ? "think" : answered.correct ? "cheer" : "sad"} size={56} />
          <div role="status" className="min-w-0 flex-1">
            {answered && (
              <>
                <p className={`font-display text-lg font-bold ${answered.skipped ? "text-ink-700" : answered.correct ? "text-success" : "text-danger"}`}>
                  {answered.skipped ? "Skipped" : answered.correct ? `Great! +${XP_PER_ANSWER}` : "Not quite"}
                </p>
                {!answered.correct && !answered.skipped && (
                  <p className="text-ink-700">
                    Answer:{" "}
                    <bdi lang={q.kind === "read" ? meaning.lang : lang.speech} className="font-semibold">
                      {answerText}
                    </bdi>
                    {q.kind !== "read" && phrase.roman && <span className="text-primary"> · {phrase.roman}</span>}
                  </p>
                )}
                {answered.heard !== undefined && (
                  <p className="text-sm text-ink-600">
                    We heard: “<bdi lang={lang.speech}>{answered.heard || "…"}</bdi>”
                  </p>
                )}
              </>
            )}
          </div>
          {answered && (
            <button ref={continueRef} onClick={next} className="btn-primary w-full sm:w-auto">
              {i === questions.length - 1 ? "See results" : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TypeIt({
  lang,
  latin,
  targets,
  locked,
  onAnswer,
}: {
  lang: LangInfo;
  // Non-Latin scripts are typed in Latin letters (most learners' keyboards).
  latin: boolean;
  targets: (string | undefined)[];
  locked: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (locked || !value.trim()) return;
        onAnswer(closeEnough(value, targets, TYPE_THRESHOLD));
      }}
    >
      <label htmlFor="type-answer" className="mb-2 block text-sm font-medium text-ink-600">
        {latin ? "Type it in Latin letters (as it sounds)" : `Type it in ${lang.name}`}
      </label>
      <input
        id="type-answer"
        autoFocus
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        dir={latin ? "ltr" : lang.dir}
        lang={latin ? "en" : lang.speech}
        value={value}
        readOnly={locked}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-2xl border-2 border-sand-300 bg-card px-5 py-4 text-xl outline-none focus:border-primary"
      />
      {!locked && (
        <button type="submit" disabled={!value.trim()} className="btn-primary mt-4 w-full disabled:opacity-50">
          Check
        </button>
      )}
    </form>
  );
}

function SayIt({
  lang,
  phrase,
  locked,
  onAnswer,
  onSkip,
}: {
  lang: LangInfo;
  phrase: Shown;
  locked: boolean;
  onAnswer: (correct: boolean, extra?: { heard?: string }) => void;
  onSkip: () => void;
}) {
  const [state, setState] = useState<"idle" | "listening" | "blocked" | "failed">("idle");
  const session = useRef<Listening | null>(null);
  // Set once the learner skips or moves on: a late result must not grade anything.
  const done = useRef(false);

  useEffect(
    () => () => {
      done.current = true;
      session.current?.cancel();
    },
    [],
  );

  async function start() {
    if (locked || done.current) return;
    if (state === "listening") {
      session.current?.stop();
      return;
    }
    setState("listening");
    const s = listen(lang.speech);
    session.current = s;
    try {
      const heard = await s.result;
      if (done.current) return;
      setState("idle");
      if (!heard.length) return; // nothing heard: let them try again
      // Any of the recogniser's guesses counts: it often ranks a learner's accent oddly.
      const targets = [phrase.text, phrase.roman, DIGITS[phrase.id]];
      const ok = heard.some((h) => closeEnough(h, targets, SPEAK_THRESHOLD));
      onAnswer(ok, { heard: heard[0] });
    } catch (e) {
      if (done.current) return;
      const code = e instanceof Error ? e.message : "";
      setState(code === "not-allowed" || code === "service-not-allowed" ? "blocked" : "failed");
    }
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-4">
      <button
        onClick={start}
        disabled={locked || state === "blocked"}
        className={`flex h-24 w-24 items-center justify-center rounded-full text-4xl text-on-primary shadow-lift transition active:scale-95 disabled:opacity-50 ${
          state === "listening" ? "animate-pulse bg-accent" : "bg-primary"
        }`}
      >
        <span aria-hidden>🎙️</span>
        <span className="sr-only">{state === "listening" ? "Stop listening" : "Start speaking"}</span>
      </button>
      <p className="text-sm text-ink-600" aria-live="polite">
        {state === "listening"
          ? "Listening… say the phrase"
          : state === "blocked"
            ? "The microphone is blocked. Allow it in your browser settings, or skip."
            : state === "failed"
              ? "That didn't work. Checking speech needs an internet connection. Try again, or skip."
              : "Tap the microphone and say the phrase"}
      </p>
      {!locked && (
        <button
          onClick={() => {
            done.current = true;
            session.current?.cancel();
            onSkip();
          }}
          className="text-sm font-medium text-ink-500 underline"
        >
          I can&apos;t speak right now
        </button>
      )}
    </div>
  );
}
