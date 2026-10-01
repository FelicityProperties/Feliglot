import { cookies } from "next/headers";
import { SESSION_COOKIE, currentUser } from "@/lib/server/auth";
import { accountsEnabled, query } from "@/lib/server/db";
import { sameSite } from "@/lib/server/http";

// Deletes the signed-in learner's account and everything saved with it
// (progress, sessions). Anonymous visit and learning-event counts were never
// linked to the account, so there is nothing of theirs left there. Required
// by app stores, and simply the right thing to offer.
export async function DELETE(req: Request) {
  if (!accountsEnabled) return Response.json({ error: "Accounts are not switched on." }, { status: 503 });
  if (!sameSite(req)) return Response.json({ error: "Not allowed." }, { status: 403 });
  try {
    const user = await currentUser();
    if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
    await query("DELETE FROM fg_users WHERE id = $1", [user.id]);
    (await cookies()).delete(SESSION_COOKIE);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("delete account: database error", e);
    return Response.json({ error: "Couldn't delete the account right now — please try again." }, { status: 503 });
  }
}
