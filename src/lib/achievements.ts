import { UNITS } from "./curriculum";
import { GOALS, knownCount, type Progress } from "./progress";

// Badges are worked out from progress, so they need no storage of their own
// and appear on every device as soon as progress syncs.
export type Badge = { id: string; icon: string; title: string; how: string; earned: boolean };

// `streakDays` is the best streak ever, so a badge stays earned after a break.
export function badges(p: Progress, streakDays: number): Badge[] {
  const lessons = Object.values(p.done).reduce((n, u) => n + u.length, 0);
  const languages = Object.values(p.done).filter((u) => u.length > 0).length;
  const level1 = UNITS.filter((u) => u.level === 1).map((u) => u.slug);
  const finishedLevel1 = Object.values(p.done).some((u) => level1.every((s) => u.includes(s)));
  const finishedCourse = Object.values(p.done).some((u) => UNITS.every((x) => u.includes(x.slug)));
  const known = knownCount(p);
  const bestDay = Math.max(0, ...Object.values(p.xpDays));
  const out: Badge[] = [];
  const add = (b: Omit<Badge, "earned">, earned: boolean) => out.push({ ...b, earned });
  add({ id: "first", icon: "🌱", title: "First steps", how: "Pass your first lesson" }, lessons >= 1);
  add({ id: "five", icon: "📚", title: "Bookworm", how: "Pass 5 lessons" }, lessons >= 5);
  add({ id: "streak3", icon: "🔥", title: "On fire", how: "Keep a 3-day streak" }, streakDays >= 3);
  add({ id: "streak7", icon: "🗓️", title: "Week warrior", how: "Keep a 7-day streak" }, streakDays >= 7);
  add({ id: "streak30", icon: "🏆", title: "Unstoppable", how: "Keep a 30-day streak" }, streakDays >= 30);
  add({ id: "goal", icon: "🎯", title: "Goal getter", how: "Reach a daily goal" }, bestDay >= Math.min(...GOALS.map((g) => g.xp)));
  add({ id: "xp1000", icon: "⭐", title: "Star learner", how: "Earn 1,000 points" }, p.xp >= 1000);
  add({ id: "memory", icon: "🧠", title: "Memory master", how: "Know 50 phrases well" }, known >= 50);
  add({ id: "polyglot", icon: "🌍", title: "Polyglot", how: "Start 3 languages" }, languages >= 3);
  add({ id: "level1", icon: "🥇", title: "Level 1 done", how: "Finish Level 1 of any course" }, finishedLevel1);
  add({ id: "course", icon: "👑", title: "Fluent-ish", how: "Finish a whole course" }, finishedCourse);
  return out;
}
