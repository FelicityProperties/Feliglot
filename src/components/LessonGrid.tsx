"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { LESSONS } from "@/lib/lessons";
import { doneSnapshot, subscribeProgress } from "@/lib/progress";

export default function LessonGrid() {
  const snapshot = useSyncExternalStore(subscribeProgress, doneSnapshot, () => "");
  const done = new Set(snapshot ? snapshot.split(",") : []);

  return (
    <div>
      <p className="mb-4 text-sm text-ink-500">
        {done.size} of {LESSONS.length} lessons complete
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {LESSONS.map((l, n) => (
          <Link
            key={l.slug}
            href={`/learn/${l.slug}`}
            className="group rounded-2xl border border-sand-200 bg-white p-5 transition hover:border-teal-600 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl" aria-hidden>
                {l.emoji}
              </span>
              {done.has(l.slug) ? (
                <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">✓ Done</span>
              ) : (
                <span className="text-xs text-ink-500">Lesson {n + 1}</span>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-ink-900 group-hover:text-teal-700">{l.title}</h3>
            <p className="mt-1 text-sm text-ink-600">{l.blurb}</p>
            <p className="mt-3 text-xs text-ink-500">{l.phrases.length} phrases · about 5 minutes</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
