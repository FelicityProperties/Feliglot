import { currentUser } from "@/lib/server/auth";
import { loadSaved } from "@/lib/server/account";
import { isAdmin } from "@/lib/server/admin";
import { accountsEnabled, query } from "@/lib/server/db";
import { googleEnabled } from "@/lib/server/google";

// Who is signed in, and their saved progress.
export async function GET() {
  if (!accountsEnabled) return Response.json({ enabled: false, user: null, google: false });
  try {
    const session = await currentUser();
    if (!session) return Response.json({ enabled: true, user: null, google: googleEnabled });
    const [u] = await query<{
      email: string;
      name: string | null;
      avatar_url: string | null;
      signup_method: string;
      created_at: string;
      has_password: boolean;
      google_sub: string | null;
    }>(
      `SELECT email, name, avatar_url, signup_method, created_at, password_hash IS NOT NULL AS has_password, google_sub
       FROM fg_users WHERE id = $1`,
      [session.id],
    );
    const saved = await loadSaved(session.id);
    return Response.json({
      enabled: true,
      google: googleEnabled,
      user: {
        email: u.email,
        name: u.name,
        avatar: u.avatar_url,
        method: u.signup_method,
        joined: u.created_at,
        admin: isAdmin(u),
      },
      ...saved,
    });
  } catch (e) {
    console.error("me: database error", e);
    return Response.json({ enabled: true, user: null, google: googleEnabled, error: "unavailable" }, { status: 503 });
  }
}
