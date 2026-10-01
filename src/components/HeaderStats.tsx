"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { getLanguage } from "@/lib/languages";
import { dueCards } from "@/lib/progress";
import { streak, useProgress, useToday } from "@/lib/store";

// Streak, points, today's goal ring and phrases due for review.
export default function HeaderStats() {
  const p = useProgress();
  const today = useToday();
  const days = today ? streak(p.days, new Date(`${today}T12:00:00`)) : 0;
  const todayXp = today ? (p.xpDays[today] ?? 0) : 0;
  const ratio = Math.min(todayXp / p.goal, 1);
  const due = today ? dueCards(p, today).length : 0;
  const { t, lang } = useT();
  const num = (n: number) => n.toLocaleString(getLanguage(lang)?.speech ?? "en");
  const R = 9;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex items-center gap-3 text-sm font-bold text-ink-700">
      <span title={t("app.stats.streak", { n: days })} className={days ? "text-accent-ink" : ""}>
        <span aria-hidden>🔥 {num(days)}</span>
        <span className="sr-only">{t("app.stats.streak", { n: days })}</span>
      </span>
      <span title={t("app.stats.points", { n: p.xp, count: num(p.xp) })}>
        <span aria-hidden>⭐ {num(p.xp)}</span>
        <span className="sr-only">{t("app.stats.points", { n: p.xp, count: num(p.xp) })}</span>
      </span>
      <Link href="/account#goal" title={t("app.stats.goal", { done: num(todayXp), goal: num(p.goal) })} className="flex items-center">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden className="-rotate-90">
          <circle cx="12" cy="12" r={R} fill="none" stroke="var(--sand-deep)" strokeWidth="4" />
          <circle
            cx="12"
            cy="12"
            r={R}
            fill="none"
            stroke={ratio >= 1 ? "var(--success)" : "var(--primary)"}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - ratio)}
          />
        </svg>
        <span className="sr-only">{t("app.stats.goal", { done: num(todayXp), goal: num(p.goal) })}</span>
      </Link>
      {due > 0 && (
        <Link href="/review" className="rounded-full bg-accent px-2 py-0.5 text-xs font-extrabold text-on-accent" title={t("app.stats.due", { n: due })}>
          <span aria-hidden>{num(due)}</span>
          <span className="sr-only">{t("app.stats.due", { n: due })}</span>
        </Link>
      )}
    </div>
  );
}
