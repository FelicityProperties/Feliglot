import { dummyHash, startSession, verifyPassword } from "@/lib/server/auth";
import { accountsEnabled, query } from "@/lib/server/db";
import { clientIp, makeLimiter, sameSite } from "@/lib/server/http";
import { readCredentials } from "../credentials";

// Slow down password guessing, per visitor and per account.
const byIp = makeLimiter(20, 15 * 60 * 1000);
const byEmail = makeLimiter(10, 15 * 60 * 1000);

export async function POST(req: Request) {
  if (!accountsEnabled) return Response.json({ error: "Accounts are not switched on yet." }, { status: 503 });
  if (!sameSite(req)) return Response.json({ error: "Not allowed." }, { status: 403 });

  const creds = await readCredentials(req);
  if ("error" in creds) return Response.json({ error: "Wrong email or password." }, { status: 401 });
  if (byIp(clientIp(req)) || byEmail(creds.email)) {
    return Response.json({ error: "Too many attempts — please wait 15 minutes." }, { status: 429 });
  }

  try {
    const rows = await query<{ id: string; password_hash: string | null; google_sub: string | null }>(
      "SELECT id, password_hash, google_sub FROM fg_users WHERE email = $1",
      [creds.email],
    );
    const ok = await verifyPassword(creds.password, rows[0]?.password_hash ?? (await dummyHash()));
    if (rows[0] && !rows[0].password_hash && rows[0].google_sub) {
      return Response.json({ error: "This account signs in with Google — use “Continue with Google”." }, { status: 401 });
    }
    if (!rows[0] || !ok) return Response.json({ error: "Wrong email or password." }, { status: 401 });
    await query("UPDATE fg_users SET last_seen_at = now() WHERE id = $1", [rows[0].id]);
    await startSession(rows[0].id);
    return Response.json({ user: { email: creds.email } });
  } catch (e) {
    console.error("login: database error", e);
    return Response.json({ error: "Couldn't log in right now — please try again." }, { status: 503 });
  }
}
