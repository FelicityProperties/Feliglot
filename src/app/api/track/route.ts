import { getLanguage } from "@/lib/languages";
import { accountsEnabled } from "@/lib/server/db";
import { isBot, recordEvent } from "@/lib/server/events";
import { clientIp, makeLimiter, sameSite } from "@/lib/server/http";

// Page views and learning events from the site's own pages. Anonymous: the
// signed-in account (if any) is deliberately not looked up or stored.
const EVENTS = new Set(["lesson_passed", "review_done", "translate_ai", "install", "goal_set"]);
const limited = makeLimiter(120, 60 * 1000);

const str = (v: unknown, max: number) => (typeof v === "string" && v ? v.slice(0, max) : null);

export async function POST(req: Request) {
  if (!accountsEnabled) return new Response(null, { status: 204 });
  if (!sameSite(req) || isBot(req)) return new Response(null, { status: 204 });
  if (req.headers.get("dnt") === "1" || req.headers.get("sec-gpc") === "1") return new Response(null, { status: 204 });
  if (limited(clientIp(req))) return new Response(null, { status: 429 });

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const path = str(b.path, 200);
  if (!path || !path.startsWith("/")) return new Response(null, { status: 400 });
  const type = b.type === "pageview" ? "pageview" : b.type === "event" ? "event" : null;
  if (!type) return new Response(null, { status: 400 });
  const name = type === "event" ? str(b.event, 40) : null;
  if (type === "event" && (!name || !EVENTS.has(name))) return new Response(null, { status: 400 });
  const lang = typeof b.lang === "string" && getLanguage(b.lang) ? b.lang : null;
  const value = typeof b.value === "number" && Number.isFinite(b.value) ? Math.round(b.value) : null;

  try {
    await recordEvent(req, { type, name, path, referrer: b.referrer, lang, label: str(b.label, 60), value });
  } catch (e) {
    console.error("track: could not record", e);
  }
  return new Response(null, { status: 204 });
}
