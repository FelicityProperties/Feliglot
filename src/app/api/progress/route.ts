import { currentUser } from "@/lib/server/auth";
import { saveMerged } from "@/lib/server/account";
import { accountsEnabled } from "@/lib/server/db";
import { sameSite } from "@/lib/server/http";
import { cleanProgress } from "@/lib/progress";

// Save this device's progress into the account (merged, never overwritten).
export async function PUT(req: Request) {
  if (!accountsEnabled) return Response.json({ error: "Accounts are not switched on." }, { status: 503 });
  if (!sameSite(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const text = await req.text();
  if (text.length > 100_000) return Response.json({ error: "Too large." }, { status: 413 });
  let body: { progress?: unknown; speak?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
    const saved = await saveMerged(user.id, cleanProgress(body.progress), typeof body.speak === "string" ? body.speak : null);
    return Response.json(saved);
  } catch (e) {
    console.error("progress: database error", e);
    return Response.json({ error: "Couldn't save right now." }, { status: 503 });
  }
}
