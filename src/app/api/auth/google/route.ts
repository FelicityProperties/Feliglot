import { cookies } from "next/headers";
import { redirectTo } from "@/lib/server/http";
import { accountsEnabled } from "@/lib/server/db";
import { OAUTH_COOKIE, authUrl, googleEnabled, newAttempt, safeReturnTo } from "@/lib/server/google";

// Starts "Continue with Google": remembers this attempt in a short-lived
// cookie, then sends the visitor to Google.
export async function GET(req: Request) {
  if (!accountsEnabled || !googleEnabled) return redirectTo(new URL("/account", req.url));
  const { state, verifier, challenge } = newAttempt();
  const returnTo = safeReturnTo(new URL(req.url).searchParams.get("returnTo"));
  (await cookies()).set(OAUTH_COOKIE, JSON.stringify({ state, verifier, returnTo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return redirectTo(authUrl(req, state, challenge));
}
