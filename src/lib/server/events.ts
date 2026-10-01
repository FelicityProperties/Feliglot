import { createHash, randomBytes } from "node:crypto";
import { query } from "./db";

// Anonymous analytics, never linked to an account. A visitor is counted with
// a hash of their IP address and browser, salted with a random key made fresh
// for each day (UTC) and deleted two days later. The dashboard can count
// unique visitors per day, but nobody can be followed from one day to the
// next — once a day's key is gone, not even we can recompute its hashes. No
// cookie is ever set.

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|go-http/i;

export function isBot(req: Request): boolean {
  return BOT.test(req.headers.get("user-agent") ?? "");
}

function device(ua: string): string {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

export function country(req: Request): string | null {
  const c = req.headers.get("x-vercel-ip-country");
  return c && /^[A-Z]{2}$/.test(c) ? c : null;
}

const utcDay = () => new Date().toISOString().slice(0, 10);

// Today's salt: whichever server instance asks first creates it; everyone
// else reads the same one. Kept in memory for the rest of the day.
let saltCache: { day: string; salt: string } | undefined;

async function dailySalt(day: string): Promise<string> {
  if (saltCache?.day === day) return saltCache.salt;
  await query("INSERT INTO fg_salts (day, salt) VALUES ($1, $2) ON CONFLICT (day) DO NOTHING", [day, randomBytes(32).toString("base64url")]);
  const [row] = await query<{ salt: string }>("SELECT salt FROM fg_salts WHERE day = $1", [day]);
  if (!row) throw new Error("events: no salt for today");
  saltCache = { day, salt: row.salt };
  return row.salt;
}

async function visitor(req: Request, day: string): Promise<string> {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ua = req.headers.get("user-agent") ?? "";
  const salt = await dailySalt(day);
  return createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("base64url").slice(0, 16);
}

// Once per UTC day per server instance: delete events older than 13 months,
// and the salts of days before yesterday (after which those days' visitor
// hashes can never be recomputed). A failure here never breaks the request.
let lastPurgeDay: string | undefined;

async function dailyCleanup(day: string) {
  if (lastPurgeDay === day) return;
  lastPurgeDay = day;
  try {
    await query("DELETE FROM fg_events WHERE day < $1::date - interval '13 months'", [day]);
    await query("DELETE FROM fg_salts WHERE day < $1::date - 1", [day]);
  } catch (err) {
    console.error("events: daily clean-up failed", err);
  }
}

// Keeps only the referring site's name, and drops our own pages.
function referrerHost(ref: unknown, req: Request): string | null {
  if (typeof ref !== "string" || !ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "");
    const own = new URL(req.url).hostname.replace(/^www\./, "");
    return host && host !== own ? host.slice(0, 100) : null;
  } catch {
    return null;
  }
}

export type EventInput = {
  type: "pageview" | "event";
  name?: string | null;
  path?: string | null;
  referrer?: unknown;
  lang?: string | null;
  label?: string | null;
  value?: number | null;
};

export async function recordEvent(req: Request, e: EventInput) {
  const ua = req.headers.get("user-agent") ?? "";
  const day = utcDay();
  await query(
    `INSERT INTO fg_events (day, type, name, path, referrer, country, device, lang, visitor, label, value)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      day,
      e.type,
      e.name ?? null,
      e.path ?? null,
      referrerHost(e.referrer, req),
      country(req),
      device(ua),
      e.lang ?? null,
      await visitor(req, day),
      e.label ?? null,
      e.value ?? null,
    ],
  );
  await dailyCleanup(day);
}
