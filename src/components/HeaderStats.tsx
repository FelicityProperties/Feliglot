"use client";

import { streak, useProgress, useToday } from "@/lib/store";

export default function HeaderStats() {
  const p = useProgress();
  const today = useToday();
  const days = today ? streak(p.days, new Date(`${today}T12:00:00`)) : 0;
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-ink-700">
      <span title={`${days}-day streak`}>
        <span aria-hidden>🔥</span> {days}
        <span className="sr-only"> day streak</span>
      </span>
      <span title={`${p.xp} points`}>
        <span aria-hidden>⭐</span> {p.xp}
        <span className="sr-only"> points</span>
      </span>
    </div>
  );
}
