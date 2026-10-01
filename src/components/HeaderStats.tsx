"use client";

import Link from "next/link";
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
  const R = 9;
  const C = 2 * Math.PI * R;

  return (
    <div className="flex items-center gap-3 text-sm font-bold text-ink-700">
      <span title={`${days}-day streak`} className={days ? "text-accent-ink" : ""}>
        <span aria-hidden>🔥</span> {days}
        <span className="sr-only"> day streak</span>
      </span>
      <span title={`${p.xp} points`}>
        <span aria-hidden>⭐</span> {p.xp}
        <span className="sr-only"> points</span>
      </span>
      <Link href="/account#goal" title={`Today: ${todayXp} of ${p.goal} points`} className="flex items-center">
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
        <span className="sr-only">
          Daily goal: {todayXp} of {p.goal} points
        </span>
      </Link>
      {due > 0 && (
        <Link href="/review" className="rounded-full bg-accent px-2 py-0.5 text-xs font-extrabold text-on-accent" title={`${due} phrases to review`}>
          {due}
          <span className="sr-only"> phrases to review</span>
        </Link>
      )}
    </div>
  );
}
