"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { UNITS, type Unit } from "@/lib/curriculum";
import { getLanguage } from "@/lib/languages";
import { dueCards } from "@/lib/progress";
import { useProgress, useToday } from "@/lib/store";

// The course map: a winding path of lessons in two levels. Every lesson is
// open (learners may jump ahead); the suggested next one pulses.
const OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];

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
  const today = useToday();
  const done = new Set(progress.done[lang] ?? []);
  const next = UNITS.find((u) => !done.has(u.slug));
  const due = today ? dueCards(progress, today, lang).length : 0;
  const speech = getLanguage(lang)?.speech;

  const level = (n: 1 | 2, title: string, subtitle: string) => {
    const units = UNITS.filter((u) => u.level === n);
    const passed = units.filter((u) => done.has(u.slug)).length;
    return (
      <section aria-labelledby={`level-${n}`} className={n === 2 ? "mt-6 border-t border-dashed border-sand-300 pt-6" : ""}>
        <div className="my-8 text-center">
          <p className="eyebrow">Level {n}</p>
          <h2 id={`level-${n}`} className="mt-1 text-2xl font-black">
            {title}
          </h2>
          <p className="text-sm text-ink-500">
            {subtitle} · {passed} of {units.length} lessons
          </p>
        </div>
        <ol className="flex flex-col items-center overflow-x-clip">
          {units.map((u, i) => (
            <Stop
              key={u.slug}
              unit={u}
              lang={lang}
              index={UNITS.indexOf(u)}
              offset={OFFSETS[i % OFFSETS.length]}
              state={done.has(u.slug) ? "done" : u === next ? "current" : "todo"}
              preview={previews[u.slug]}
              dir={dir}
              speech={speech}
            />
          ))}
        </ol>
      </section>
    );
  };

  return (
    <div>
      {due > 0 && (
        <div className="mb-6 grid items-center gap-4 rounded-3xl bg-primary-soft p-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow">Memory refresh</p>
            <h3 className="mt-1 text-xl font-extrabold">
              {due} {due === 1 ? "phrase is" : "phrases are"} ready to review
            </h3>
            <p className="text-sm text-ink-600">A quick review keeps them strong.</p>
          </div>
          <Link href="/review" className="btn-coral">
            Review now <Sparkles size={18} aria-hidden />
          </Link>
        </div>
      )}
      {next ? (
        <Link href={`/learn/${lang}/${next.slug}`} className="btn-primary w-full sm:w-auto">
          {done.size ? "Continue" : "Start"}: {next.title} →
        </Link>
      ) : (
        <p className="rounded-2xl bg-success-soft px-4 py-3 font-bold text-success">🎉 Course complete — every lesson passed</p>
      )}
      {level(1, "First conversations", "Everyday basics")}
      {level(2, "Out and about", "Family, travel, work and more")}
    </div>
  );
}

function Stop({
  unit,
  lang,
  index,
  offset,
  state,
  preview,
  dir,
  speech,
}: {
  unit: Unit;
  lang: string;
  index: number;
  offset: number;
  state: "done" | "current" | "todo";
  preview?: string;
  dir: "ltr" | "rtl";
  speech?: string;
}) {
  const node =
    state === "done"
      ? "bg-primary text-on-primary shadow-[0_6px_0_var(--primary-hover)]"
      : state === "current"
        ? "node-current bg-accent text-on-accent shadow-[0_6px_0_color-mix(in_oklab,var(--celebration)_65%,var(--foreground))]"
        : "bg-sand-200 text-ink-700 shadow-[0_6px_0_color-mix(in_oklab,var(--sand-deep)_70%,var(--foreground))]";
  return (
    <li className="relative flex h-28 w-full justify-center">
      <Link
        href={`/learn/${lang}/${unit.slug}`}
        // The path swings less on phones so labels stay on screen.
        className="group relative flex translate-x-[calc(var(--o)*0.55)] items-center sm:translate-x-[var(--o)]"
        style={{ "--o": `${offset}px` } as React.CSSProperties}
        aria-label={`Lesson ${index + 1}: ${unit.title}${state === "done" ? " (passed)" : state === "current" ? " (up next)" : ""}`}
      >
        <span
          className={`grid h-[72px] w-[72px] place-items-center rounded-[26px] border-[5px] border-background font-display text-2xl font-black transition group-hover:scale-105 ${node}`}
        >
          {state === "done" ? <Check size={30} strokeWidth={3} aria-hidden /> : <span aria-hidden>{unit.emoji}</span>}
        </span>
        <span className={`absolute top-1/2 w-[min(8rem,calc(50vw-4.5rem))] -translate-y-1/2 sm:w-56 ${offset > 0 ? "right-full mr-4 text-right" : "left-full ml-4"}`}>
          <span className="block font-display text-sm font-extrabold text-ink-900">{unit.title}</span>
          {preview && (
            <span dir={dir} lang={speech} className="block truncate text-xs text-ink-500">
              {preview}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
