import { currentUser } from "@/lib/server/auth";
import { loadSaved } from "@/lib/server/account";
import { accountsEnabled } from "@/lib/server/db";

// Who is signed in, and their saved progress.
export async function GET() {
  if (!accountsEnabled) return Response.json({ enabled: false, user: null });
  try {
    const user = await currentUser();
    if (!user) return Response.json({ enabled: true, user: null });
    const saved = await loadSaved(user.id);
    return Response.json({ enabled: true, user: { email: user.email }, ...saved });
  } catch (e) {
    console.error("me: database error", e);
    return Response.json({ enabled: true, user: null, error: "unavailable" }, { status: 503 });
  }
}
