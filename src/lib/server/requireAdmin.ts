import { isAdmin, isAdminEmail } from "./admin";
import { currentUser } from "./auth";
import { accountsEnabled } from "./db";

// Returns null when the signed-in user may see the owner dashboard, or the
// response to send instead.
export async function requireAdmin(): Promise<Response | null> {
  if (!accountsEnabled) return Response.json({ error: "Accounts are not switched on." }, { status: 503 });
  const user = await currentUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  if (isAdmin(user)) return null;
  if (isAdminEmail(user.email)) {
    return Response.json({ error: "Sign in with Google using the owner email to open the dashboard." }, { status: 403 });
  }
  return Response.json({ error: "This page is for the site owner." }, { status: 403 });
}
