import { hashPassword, startSession } from "@/lib/server/auth";
import { accountsEnabled, query } from "@/lib/server/db";
import { clientIp, makeLimiter, sameSite } from "@/lib/server/http";
import { readCredentials } from "../credentials";

const limited = makeLimiter(10, 60 * 60 * 1000); // sign-ups per visitor per hour

export async function POST(req: Request) {
  if (!accountsEnabled) return Response.json({ error: "Accounts are not switched on yet." }, { status: 503 });
  if (!sameSite(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  if (limited(clientIp(req))) return Response.json({ error: "Too many attempts — please try again later." }, { status: 429 });

  const creds = await readCredentials(req);
  if ("error" in creds) return Response.json({ error: creds.error }, { status: 400 });

  try {
    const hash = await hashPassword(creds.password);
    const rows = await query<{ id: string }>(
      "INSERT INTO fg_users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id",
      [creds.email, hash],
    );
    if (!rows[0]) {
      return Response.json({ error: "There's already an account with that email — log in instead." }, { status: 409 });
    }
    await startSession(rows[0].id);
    return Response.json({ user: { email: creds.email } });
  } catch (e) {
    console.error("signup: database error", e);
    return Response.json({ error: "Couldn't create the account right now — please try again." }, { status: 503 });
  }
}
