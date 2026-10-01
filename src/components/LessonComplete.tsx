"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Result } from "@/lib/quiz";
import { streak, useProgress } from "@/lib/store";
import Confetti from "./Confetti";
import Feli from "./Feli";
import SavePrompt from "./SavePrompt";
import { XP_PER_ANSWER } from "./QuizRunner";

export const PASS = 0.7;

// Score counts only questions that were answered (skipped speaking doesn't count against you).
export function scoreOf(results: Result[]) {
  const counted = results.filter((r) => !r.skipped);
  const right = counted.filter((r) => r.correct).length;
  return { right, total: counted.length, passed: counted.length > 0 && right / counted.length >= PASS };
}

export default function LessonComplete({
  results,
  title,
  onRetry,
  next,
  back,
}: {
  results: Result[];
  title: string;
  onRetry: () => void;
  next?: { href: string; label: string };
  back: { label: string } & ({ href: string } | { onClick: () => void });
}) {
  const { right, total, passed } = scoreOf(results);
  const progress = useProgress();
  const days = streak(progress.days);
  const accuracy = total ? Math.round((right / total) * 100) : 0;
  const heading = useRef<HTMLHeadingElement>(null);

  // The quiz that had focus is gone: move focus to the result.
  useEffect(() => heading.current?.focus(), []);

  const backClass = passed && !next ? "btn-primary" : "btn-secondary";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sand-200 bg-card p-8 text-center shadow-soft">
      {passed && <Confetti />}
      <div className="flex justify-center">
        <Feli mood={passed ? "cheer" : "think"} size={120} />
      </div>
      <h2 ref={heading} tabIndex={-1} className="mt-4 font-display text-3xl font-extrabold text-ink-900 outline-none">
        {passed ? title : "Almost there!"}
      </h2>
      <p className="mt-2 text-ink-600">
        {passed ? "Lesson passed — these phrases will come back for review so they stick." : `Get ${Math.round(PASS * 100)}% to pass. Try once more!`}
      </p>
      <dl className="mt-6 grid grid-cols-3 gap-3">
        {[
          ["⭐", `+${right * XP_PER_ANSWER}`, "points"],
          ["🎯", `${accuracy}%`, "accuracy"],
          ["🔥", String(days), days === 1 ? "day streak" : "day streak"],
        ].map(([icon, value, label]) => (
          <div key={label} className="rounded-2xl bg-sand-100 p-3">
            <dt className="text-xs text-ink-500">
              <span aria-hidden>{icon}</span> {label}
            </dt>
            <dd className="font-display text-2xl font-extrabold text-ink-900">{value}</dd>
          </div>
        ))}
      </dl>
      {passed && <SavePrompt />}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={onRetry} className={passed ? "btn-secondary" : "btn-primary"}>
          {passed ? "Practise again" : "Try again"}
        </button>
        {passed && next ? (
          <Link href={next.href} className="btn-primary">
            {next.label} →
          </Link>
        ) : "href" in back ? (
          <Link href={back.href} className={backClass}>
            {back.label}
          </Link>
        ) : (
          <button onClick={back.onClick} className={backClass}>
            {back.label}
          </button>
        )}
      </div>
    </div>
  );
}
