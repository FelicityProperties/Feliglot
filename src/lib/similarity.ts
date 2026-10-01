import { fold } from "./fold";

// How close two answers are, from 0 (nothing alike) to 1 (identical), after
// ignoring case, accents and punctuation. Used to forgive small typos and
// imperfect speech recognition.
export function similarity(a: string, b: string): number {
  const x = [...fold(a.replace(/…/g, " "))];
  const y = [...fold(b.replace(/…/g, " "))];
  if (!x.length && !y.length) return 1;
  if (!x.length || !y.length) return 0;
  let prev = Array.from({ length: y.length + 1 }, (_, j) => j);
  for (let i = 1; i <= x.length; i++) {
    const cur = [i];
    for (let j = 1; j <= y.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return 1 - prev[y.length] / Math.max(x.length, y.length);
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// "…" in a phrase is a blank the learner fills in ("Me llamo …" → "Me llamo
// Ana"), so whatever they put there doesn't count against them.
function score(answer: string, target: string): number {
  let best = similarity(answer, target);
  if (!target.includes("…") || best === 1) return best;
  // Exact match around the blank, ignoring spaces (also covers scripts
  // written without them).
  const squash = (s: string) => fold(s).replace(/\s/g, "");
  const parts = target.split("…").map(squash);
  if (new RegExp(`^${parts.map(escape).join(".{1,40}")}$`, "u").test(squash(answer))) return 1;
  // Otherwise forgive typos once the one to four words in the blank are set aside.
  const words = fold(answer).split(" ").filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    for (let n = 1; n <= 4 && i + n <= words.length; n++) {
      best = Math.max(best, similarity([...words.slice(0, i), ...words.slice(i + n)].join(" "), target));
    }
  }
  return best;
}

export function closeEnough(answer: string, targets: (string | undefined)[], threshold: number): boolean {
  return targets.some((t) => t && score(answer, t) >= threshold);
}
