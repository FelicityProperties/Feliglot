// Shared request guards for the API routes.

// Only Feliglot's own pages may call write endpoints: a JSON content type
// forces a browser preflight for cross-site requests (which we never allow),
// and Sec-Fetch-Site / Origin must point back at this site.
export function sameSite(req: Request): boolean {
  if (!req.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return false;
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      const host = new URL(origin).host;
      if (host !== new URL(req.url).host && host !== req.headers.get("host")) return false;
    } catch {
      return false;
    }
  }
  return true;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// Best-effort limiter per key within one server instance (serverless
// instances don't share memory, so this slows abuse rather than stopping it).
export function makeLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return (key: string): boolean => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (hits.size > 5000) hits.clear();
    if (recent.length >= max) {
      hits.set(key, recent);
      return true;
    }
    recent.push(now);
    hits.set(key, recent);
    return false;
  };
}

// A redirect whose headers stay writable, so cookies set during the request
// (sessions, the Google sign-in attempt) are attached to it.
export function redirectTo(location: string | URL): Response {
  return new Response(null, { status: 302, headers: { location: String(location) } });
}
