import { getLanguage } from "@/lib/languages";
import { EMPTY_PROGRESS, cleanProgress, mergeProgress, type Progress } from "@/lib/progress";
import { query, transaction } from "./db";

export type Saved = { progress: Progress; speak: string | null };

type Row = { done: unknown; xp: number; days: unknown; data: unknown; speak: string | null };

// Older rows kept lessons/points/days in their own columns; newer fields live in `data`.
function fromRow(row: Row | undefined): Saved {
  if (!row) return { progress: EMPTY_PROGRESS, speak: null };
  const data = row.data && typeof row.data === "object" ? (row.data as Record<string, unknown>) : {};
  return { progress: cleanProgress({ ...data, done: row.done, xp: row.xp, days: row.days }), speak: row.speak };
}

export async function loadSaved(userId: string): Promise<Saved> {
  const rows = await query<Row>("SELECT done, xp, days, data, speak FROM fg_progress WHERE user_id = $1", [userId]);
  return fromRow(rows[0]);
}

// Merge what the browser sent into what's stored. The row is locked for the
// length of the merge, and merging only ever adds (lessons, days, phrases)
// or keeps the newer/higher value, so two devices saving at once can't
// erase each other's progress.
export async function saveMerged(userId: string, incoming: Progress, speak: string | null): Promise<Saved> {
  const lang = speak && getLanguage(speak) ? speak : null;
  return transaction(async (q) => {
    await q("INSERT INTO fg_progress (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING", [userId]);
    const rows = await q<Row>("SELECT done, xp, days, data, speak FROM fg_progress WHERE user_id = $1 FOR UPDATE", [userId]);
    const current = fromRow(rows[0]);
    const progress = mergeProgress(current.progress, incoming);
    const { done, xp, days, ...data } = progress;
    const newSpeak = lang ?? current.speak;
    await q(
      `UPDATE fg_progress SET done = $2, xp = $3, days = $4, data = $5, speak = $6, updated_at = now()
       WHERE user_id = $1`,
      [userId, JSON.stringify(done), xp, JSON.stringify(days), JSON.stringify(data), newSpeak],
    );
    await q("UPDATE fg_users SET last_seen_at = now() WHERE id = $1", [userId]);
    return { progress, speak: newSpeak };
  });
}
