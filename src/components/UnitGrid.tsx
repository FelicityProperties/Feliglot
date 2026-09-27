"use client";

import Link from "next/link";
import { UNITS } from "@/lib/curriculum";
import { getLanguage } from "@/lib/languages";
import { useProgress } from "@/lib/store";

export default function UnitGrid({
  lang,
  dir,
  previews,
}: {
  lang: string;
  dir: "ltr" | "rtl";
  previews: Record<string, string>;
}) {
  const progress = useProgress();
  const done = new Set(progress.done[lang] ?? []);
  const next = UNITS.find((u) => !done.has(u.slug));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {next ? (
          <Link href={`/learn/${lang}/${next.slug}`} className="btn-primary">
            {done.size ? "Continue" : "Start"}: {next.title} →
          </Link>
        ) : (
          <p className="rounded-full bg-teal-50 px-4 py-2 font-medium text-teal-700">
            🎉 Course complete — every lesson passed
          </p>
        )}
        <p className="text-sm text-ink-500">
          {done.size} of {UNITS.length} lessons done
        </p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2">
        {UNITS.map((u, n) => (
          <li key={u.slug}>
            <Link
              href={`/learn/${lang}/${u.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-5 transition hover:border-teal-600 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl" aria-hidden>
                  {u.emoji}
                </span>
                {done.has(u.slug) ? (
                  <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">✓ Done</span>
                ) : (
                  <span className="text-xs text-ink-500">Lesson {n + 1}</span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold text-ink-900 group-hover:text-teal-700">{u.title}</h3>
              <p className="mt-1 text-sm text-ink-600">{u.blurb}</p>
              <p dir={dir} lang={getLanguage(lang)?.speech} className="mt-3 truncate text-sm text-ink-500">
                {previews[u.slug]}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
