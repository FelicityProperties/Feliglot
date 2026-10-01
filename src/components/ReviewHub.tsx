"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CONCEPTS, UNITS } from "@/lib/curriculum";
import { getLanguage } from "@/lib/languages";
import { dueCards, knownCount } from "@/lib/progress";
import type { Result } from "@/lib/quiz";
import { recordReview, useProgress, useToday } from "@/lib/store";
import { track } from "@/lib/track";
import type { LessonPhrase } from "@/lib/types";
import { useContent } from "@/lib/useContent";
import { useMeanings } from "@/lib/useMeanings";
import Feli from "./Feli";
import LessonComplete from "./LessonComplete";
import QuizRunner from "./QuizRunner";

const SESSION = 12; // phrases per review session
const EN = Object.fromEntries(CONCEPTS.map((c) => [c.id, c.en]));

export default function ReviewHub({ initialLang }: { initialLang?: string }) {
  const progress = useProgress();
  const today = useToday();
  const [lang, setLang] = useState<string | null>(initialLang ?? null);
  // Leaving a session puts focus back on that language's button.
  const [returnTo, setReturnTo] = useState<string | null>(null);
  useEffect(() => {
    if (lang || !returnTo) return;
    const row = document.getElementById(`review-${returnTo}`);
    (row?.querySelector<HTMLElement>("button:not(:disabled)") ?? row)?.focus();
  }, [lang, returnTo]);

  const byLang = useMemo(() => {
    if (!today) return [];
    const counts = new Map<string, { due: number; total: number }>();
    for (const key of Object.keys(progress.cards)) {
      const code = key.slice(0, key.lastIndexOf(":"));
      const c = counts.get(code) ?? { due: 0, total: 0 };
      c.total++;
      counts.set(code, c);
    }
    for (const key of dueCards(progress, today)) {
      const code = key.slice(0, key.lastIndexOf(":"));
      counts.get(code)!.due++;
    }
    return [...counts.entries()]
      .filter(([code]) => getLanguage(code))
      .sort((a, b) => b[1].due - a[1].due || b[1].total - a[1].total);
  }, [progress, today]);

  if (lang)
    return (
      <ReviewSession
        key={lang}
        code={lang}
        onExit={() => {
          setReturnTo(lang);
          setLang(null);
        }}
      />
    );

  if (!byLang.length) {
    return (
      <div className="rounded-3xl border border-sand-200 bg-card p-8 text-center shadow-soft">
        <div className="flex justify-center">
          <Feli mood="think" size={110} />
        </div>
        <p className="mt-4 text-lg text-ink-700">Nothing to review yet.</p>
        <p className="mt-1 text-ink-600">Pass a lesson and its phrases come back here — just before you&apos;d forget them.</p>
        <Link href="/learn" className="btn-primary mt-6">
          Choose a language
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {byLang.map(([code, { due, total }]) => {
        const l = getLanguage(code)!;
        return (
          <li
            key={code}
            id={`review-${code}`}
            tabIndex={-1}
            className="flex items-center justify-between gap-4 rounded-3xl border border-sand-200 bg-card p-5 shadow-soft outline-none"
          >
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-ink-900">
                <span dir={l.dir} lang={l.speech}>
                  {l.nativeName}
                </span>
                {l.nativeName !== l.name && <span className="text-sm font-medium text-ink-500"> {l.name}</span>}
              </p>
              <p className="text-sm text-ink-600">
                {due ? `${due} ready to review` : "All caught up"} · {knownCount(progress, code)} of {total} well known
              </p>
            </div>
            <button onClick={() => setLang(code)} disabled={!due} className="btn-primary shrink-0 disabled:opacity-40">
              {due ? "Review" : "Done ✓"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ReviewSession({ code, onExit }: { code: string; onExit: () => void }) {
  const l = getLanguage(code)!;
  const progress = useProgress();
  const today = useToday();
  const { content, failed, retry } = useContent(code);
  // Fix the set of phrases when the session starts, so answering doesn't reshuffle it.
  const [keys] = useState(() => dueCards(progress, today).filter((k) => k.startsWith(`${code}:`)).slice(0, SESSION));
  const [results, setResults] = useState<Result[] | null>(null);
  const [round, setRound] = useState(0);

  // Wrong options come from every lesson the learner has passed in this language.
  const learned = useMemo(() => {
    const units = new Set(progress.done[code] ?? []);
    return UNITS.filter((u) => units.has(u.slug)).flatMap((u) => u.concepts.map((c) => c.id));
  }, [progress.done, code]);

  const phrases: LessonPhrase[] = useMemo(() => {
    if (!content) return [];
    const ids = [...new Set([...keys.map((k) => k.slice(k.lastIndexOf(":") + 1)), ...learned])];
    return ids.filter((id) => content.phrases[id]).map((id) => ({ id, en: EN[id], ...content.phrases[id] }));
  }, [content, keys, learned]);
  const { shown, meaning, ready, base } = useMeanings(code, phrases);
  const dueIds = new Set(keys.map((k) => k.slice(k.lastIndexOf(":") + 1)));
  const items = shown.filter((p) => dueIds.has(p.id));

  if (failed)
    return (
      <p className="text-ink-600">
        Couldn&apos;t load the phrases.{" "}
        <button onClick={retry} className="font-medium text-primary underline">
          Try again
        </button>
      </p>
    );
  if (!content || !ready) return <p className="text-ink-600">Loading…</p>;

  if (results)
    return (
      <LessonComplete
        results={results}
        title="Review done!"
        onRetry={() => {
          setResults(null);
          setRound((r) => r + 1);
        }}
        back={{ onClick: onExit, label: "Back to reviews" }}
      />
    );

  if (!items.length)
    return (
      <div className="text-center">
        <p className="text-ink-700">All caught up in {l.name} for today.</p>
        <button onClick={onExit} className="btn-secondary mt-4">
          Back
        </button>
      </div>
    );

  return (
    <div>
      <button onClick={onExit} className="mb-4 text-sm text-ink-500 hover:text-primary">
        ← All reviews
      </button>
      <QuizRunner
        key={`${base}:${round}`}
        lang={{ code: l.code, name: l.name, nativeName: l.nativeName, speech: l.speech, dir: l.dir }}
        items={items}
        pool={shown}
        meaning={meaning}
        onFinish={(r) => {
          setResults(r);
          // Only the first round counts for the review schedule; "Practise
          // again" is extra practice.
          if (round === 0) recordReview(r.filter((x) => !x.skipped).map((x) => ({ key: `${code}:${x.id}`, correct: x.correct })));
          track("review_done", { lang: code, value: r.length });
        }}
      />
    </div>
  );
}
