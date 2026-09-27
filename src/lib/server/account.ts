import { getLanguage } from "@/lib/languages";
import { EMPTY_PROGRESS, cleanProgress, type Progress } from "@/lib/progress";
import { query } from "./db";

export type Saved = { progress: Progress; speak: string | null };

export async function loadSaved(userId: string): Promise<Saved> {
  const rows = await query<{ done: unknown; xp: number; days: unknown; speak: string | null }>(
    "SELECT done, xp, days, speak FROM fg_progress WHERE user_id = $1",
    [userId],
  );
  if (!rows[0]) return { progress: EMPTY_PROGRESS, speak: null };
  return { progress: cleanProgress(rows[0]), speak: rows[0].speak };
}

// Merge what the browser sent into what's stored. The merge happens inside
// a single upsert (atomic per row), and it only ever adds lessons and days
// and keeps the higher points, so two devices saving at once can't erase
// each other's progress.
export async function saveMerged(userId: string, progress: Progress, speak: string | null): Promise<Saved> {
  const lang = speak && getLanguage(speak) ? speak : null;
  const rows = await query<{ done: unknown; xp: number; days: unknown; speak: string | null }>(
    `INSERT INTO fg_progress (user_id, done, xp, days, speak, updated_at)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (user_id) DO UPDATE SET
       done = (
         SELECT coalesce(jsonb_object_agg(k, v), '{}'::jsonb) FROM (
           SELECT k, jsonb_agg(DISTINCT u) AS v FROM (
             SELECT k, jsonb_array_elements_text(v) AS u FROM jsonb_each(fg_progress.done) AS a(k, v)
             UNION ALL
             SELECT k, jsonb_array_elements_text(v) FROM jsonb_each(EXCLUDED.done) AS b(k, v)
           ) units GROUP BY k
         ) merged
       ),
       xp = GREATEST(fg_progress.xp, EXCLUDED.xp),
       days = (
         SELECT coalesce(jsonb_agg(d ORDER BY d), '[]'::jsonb) FROM (
           SELECT DISTINCT d FROM (
             SELECT jsonb_array_elements_text(fg_progress.days) AS d
             UNION ALL SELECT jsonb_array_elements_text(EXCLUDED.days)
           ) all_days ORDER BY d DESC LIMIT 400
         ) recent
       ),
       speak = coalesce(EXCLUDED.speak, fg_progress.speak),
       updated_at = now()
     RETURNING done, xp, days, speak`,
    [userId, JSON.stringify(progress.done), progress.xp, JSON.stringify(progress.days), lang],
  );
  return { progress: cleanProgress(rows[0]), speak: rows[0].speak };
}
