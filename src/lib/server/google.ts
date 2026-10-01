import { createHash, randomBytes } from "node:crypto";

// "Continue with Google" (OAuth 2.0 authorization code flow with PKCE).
// Switched on by GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, from a Google
// Cloud "OAuth client ID" (type: Web application) whose authorised redirect
// URI is https://<your site>/api/auth/google/callback.

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const googleEnabled = Boolean(CLIENT_ID && CLIENT_SECRET);
export const OAUTH_COOKIE = "fg_oauth";

export function callbackUrl(req: Request): string {
  return `${new URL(req.url).origin}/api/auth/google/callback`;
}

export function newAttempt() {
  const state = randomBytes(24).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { state, verifier, challenge };
}

export function authUrl(req: Request, state: string, challenge: string): string {
  const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  u.searchParams.set("client_id", CLIENT_ID!);
  u.searchParams.set("redirect_uri", callbackUrl(req));
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "openid email profile");
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", challenge);
  u.searchParams.set("code_challenge_method", "S256");
  u.searchParams.set("prompt", "select_account");
  return u.toString();
}

export type GoogleProfile = { sub: string; email: string; name: string | null; picture: string | null };

// Swaps the one-time code for tokens, then asks Google who signed in. Both
// calls go straight to Google over HTTPS, so the answer can be trusted.
export async function profileFromCode(req: Request, code: string, verifier: string): Promise<GoogleProfile> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      redirect_uri: callbackUrl(req),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!tokenRes.ok) throw new Error(`google token: ${tokenRes.status}`);
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("google token: no access token");

  const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) throw new Error(`google userinfo: ${infoRes.status}`);
  const info = (await infoRes.json()) as { sub?: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
  if (!info.sub || !info.email || info.email_verified !== true) throw new Error("google: email not verified");
  return {
    sub: info.sub,
    email: info.email.toLowerCase(),
    name: info.name?.slice(0, 100) ?? null,
    picture: info.picture?.startsWith("https://") ? info.picture.slice(0, 500) : null,
  };
}

// Only send people back to a page on this site. Browsers ignore tabs and
// line breaks in addresses and read a backslash as "/", so "/\t/evil.com" would
// really mean "//evil.com" — another site. Anything like that is refused;
// what's left is resolved the way a browser would and must stay on this site.
const ORIGIN = "https://feliglot.invalid"; // stands in for this site's address
const FALLBACK = "/account";

export function safeReturnTo(v: string | null | undefined): string {
  if (typeof v !== "string" || !v.startsWith("/") || v.length > 200 || /[\u0000-\u001f\u007f\\]/.test(v)) return FALLBACK;
  try {
    const u = new URL(v, ORIGIN);
    const out = u.pathname + u.search + u.hash;
    // "/.//evil.com" tidies up to "//evil.com", so check the result again.
    if (u.origin !== ORIGIN || out.startsWith("//") || new URL(out, ORIGIN).origin !== ORIGIN) return FALLBACK;
    return out;
  } catch {
    return FALLBACK;
  }
}
