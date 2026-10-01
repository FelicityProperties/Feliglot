"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { UNITS, type Unit } from "@/lib/curriculum";
import { useT, type T } from "@/lib/i18n";
import { getLanguage } from "@/lib/languages";
import { dueCards } from "@/lib/progress";
import { useProgress, useToday } from "@/lib/store";
import type { UiKey } from "@/lib/ui";

const unitTitle = (t: T, slug: string) => t(`course.unit.${slug}.title` as UiKey);

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
  const { t } = useT();

  const level = (n: 1 | 2) => {
    const units = UNITS.filter((u) => u.level === n);
    const passed = units.filter((u) => done.has(u.slug)).length;
    return (
      <section aria-labelledby={`level-${n}`} className={n === 2 ? "mt-6 border-t border-dashed border-sand-300 pt-6" : ""}>
        <div className="my-8 text-center">
          <p className="eyebrow">{t("course.level", { n })}</p>
          <h2 id={`level-${n}`} className="mt-1 text-2xl font-black">
            {t(`course.level.${n}.title`)}
          </h2>
          <p className="text-sm text-ink-500">
            {t("course.level.progress", { subtitle: t(`course.level.${n}.subtitle`), passed, total: units.length })}
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
              t={t}
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
            <p className="eyebrow">{t("course.review.eyebrow")}</p>
            <h3 className="mt-1 text-xl font-extrabold">{t("course.review.title", { n: due })}</h3>
            <p className="text-sm text-ink-600">{t("course.review.body")}</p>
          </div>
          <Link href="/review" className="btn-coral">
            {t("course.review.button")} <Sparkles size={18} aria-hidden />
          </Link>
        </div>
      )}
      {next ? (
        <Link href={`/learn/${lang}/${next.slug}`} className="btn-primary w-full sm:w-auto">
          {t(done.size ? "course.continue" : "course.start", { title: unitTitle(t, next.slug) })}{" "}
          <ArrowRight size={18} aria-hidden className="rtl:-scale-x-100" />
        </Link>
      ) : (
        <p className="rounded-2xl bg-success-soft px-4 py-3 font-bold text-success">🎉 {t("course.complete")}</p>
      )}
      {level(1)}
      {level(2)}
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
  t,
}: {
  unit: Unit;
  lang: string;
  index: number;
  offset: number;
  state: "done" | "current" | "todo";
  preview?: string;
  dir: "ltr" | "rtl";
  speech?: string;
  t: T;
}) {
  const title = unitTitle(t, unit.slug);
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
        aria-label={t(state === "done" ? "course.stop.passed" : state === "current" ? "course.stop.next" : "course.stop.label", { n: index + 1, title })}
      >
        <span
          className={`grid h-[72px] w-[72px] place-items-center rounded-[26px] border-[5px] border-background font-display text-2xl font-black transition group-hover:scale-105 ${node}`}
        >
          {state === "done" ? <Check size={30} strokeWidth={3} aria-hidden /> : <span aria-hidden>{unit.emoji}</span>}
        </span>
        <span className={`absolute top-1/2 w-[min(8rem,calc(50vw-4.5rem))] -translate-y-1/2 sm:w-56 ${offset > 0 ? "right-full mr-4 text-right" : "left-full ml-4"}`}>
          <span className="block font-display text-sm font-extrabold text-ink-900">{title}</span>
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
