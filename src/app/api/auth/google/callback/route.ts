import { cookies } from "next/headers";
import { redirectTo } from "@/lib/server/http";
import { startSession } from "@/lib/server/auth";
import { query, transaction } from "@/lib/server/db";
import { country } from "@/lib/server/events";
import { OAUTH_COOKIE, googleEnabled, profileFromCode, safeReturnTo } from "@/lib/server/google";

// Google sends the visitor back here with a one-time code.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const fail = (why: string) => {
    console.error("google sign-in failed:", why);
    return redirectTo(new URL("/account?error=google", req.url));
  };
  if (!googleEnabled) return fail("not configured");

  const jar = await cookies();
  const raw = jar.get(OAUTH_COOKIE)?.value;
  jar.delete({ name: OAUTH_COOKIE, path: "/api/auth/google" });
  let saved: { state?: string; verifier?: string; returnTo?: string } = {};
  try {
    saved = raw ? JSON.parse(raw) : {};
  } catch {}
  const code = url.searchParams.get("code");
  // The state must match the one we set, or this isn't the visitor who started.
  if (!code || !saved.state || !saved.verifier || url.searchParams.get("state") !== saved.state) {
    return fail(url.searchParams.get("error") ?? "state mismatch");
  }

  try {
    const g = await profileFromCode(req, code, saved.verifier);
    const found = await transaction(async (q) => {
      // 1. Returning Google user.
      let rows = await q<{ id: string }>("SELECT id FROM fg_users WHERE google_sub = $1", [g.sub]);
      if (rows[0]) return { id: rows[0].id, isNew: false };
      // 2. Existing email account: link it, since Google has verified the
      // address. Anyone could have signed up with that email before, so the
      // old password and every existing session stop working: from now on
      // only this Google account gets in. Google's name and photo replace
      // whatever the earlier sign-up typed in.
      rows = await q<{ id: string }>(
        `UPDATE fg_users SET google_sub = $2, password_hash = NULL,
                name = coalesce($3, name), avatar_url = coalesce($4, avatar_url)
         WHERE email = $1 AND google_sub IS NULL RETURNING id`,
        [g.email, g.sub, g.name, g.picture],
      );
      if (rows[0]) {
        await q("DELETE FROM fg_sessions WHERE user_id = $1", [rows[0].id]);
        return { id: rows[0].id, isNew: false };
      }
      // 3. New learner.
      rows = await q<{ id: string }>(
        `INSERT INTO fg_users (email, password_hash, name, avatar_url, google_sub, signup_method, country)
         VALUES ($1, NULL, $2, $3, $4, 'google', $5)
         ON CONFLICT (email) DO NOTHING RETURNING id`,
        [g.email, g.name, g.picture, g.sub, country(req)],
      );
      return rows[0] ? { id: rows[0].id, isNew: true } : null;
    });
    if (!found) return fail("email belongs to a different Google account");
    const { id, isNew } = found;
    await query("UPDATE fg_users SET last_seen_at = now() WHERE id = $1", [id]);
    await startSession(id);
    const dest = new URL(safeReturnTo(saved.returnTo), req.url);
    if (isNew) dest.searchParams.set("welcome", "1");
    return redirectTo(dest);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "unknown");
  }
}
