import { endSession } from "@/lib/server/auth";
import { accountsEnabled } from "@/lib/server/db";
import { sameSite } from "@/lib/server/http";

export async function POST(req: Request) {
  if (!accountsEnabled) return Response.json({ ok: true });
  if (!sameSite(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  try {
    await endSession();
  } catch (e) {
    console.error("logout: database error", e);
  }
  return Response.json({ ok: true });
}
