import { Pool, type PoolClient } from "pg";

// Neon (connected in Vercel) provides DATABASE_URL; older Vercel Postgres
// setups call it POSTGRES_URL. Without either, accounts are switched off and
// the site keeps working with progress saved in the browser only.
const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

export const accountsEnabled = Boolean(url);

// One small pool per server instance, reused across requests.
const g = globalThis as unknown as { __fgPool?: Pool; __fgSchema?: Promise<void>; __fgSchemaVersion?: number };

function pool(): Pool {
  if (!url) throw new Error("No database configured");
  g.__fgPool ??= new Pool({ connectionString: url, max: 3, idleTimeoutMillis: 10_000 });
  return g.__fgPool;
}

// Tables are created (and upgraded) automatically, so there is no separate
// setup step. Every statement is safe to run again. Bump SCHEMA_VERSION
// whenever SCHEMA changes: the upgrade then runs once, instead of on every
// cold start (its ALTER TABLEs lock whole tables and could deadlock with a
// progress save that is in flight).
const SCHEMA_VERSION = 2;
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS fg_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  ALTER TABLE fg_users ALTER COLUMN password_hash DROP NOT NULL;
  ALTER TABLE fg_users ADD COLUMN IF NOT EXISTS name text;
  ALTER TABLE fg_users ADD COLUMN IF NOT EXISTS avatar_url text;
  ALTER TABLE fg_users ADD COLUMN IF NOT EXISTS google_sub text;
  ALTER TABLE fg_users ADD COLUMN IF NOT EXISTS signup_method text NOT NULL DEFAULT 'email';
  ALTER TABLE fg_users ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
  ALTER TABLE fg_users ADD COLUMN IF NOT EXISTS country text;
  CREATE UNIQUE INDEX IF NOT EXISTS fg_users_google_sub ON fg_users(google_sub);

  CREATE TABLE IF NOT EXISTS fg_sessions (
    token_hash text PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES fg_users(id) ON DELETE CASCADE,
    expires_at timestamptz NOT NULL
  );
  CREATE INDEX IF NOT EXISTS fg_sessions_user ON fg_sessions(user_id);

  CREATE TABLE IF NOT EXISTS fg_progress (
    user_id uuid PRIMARY KEY REFERENCES fg_users(id) ON DELETE CASCADE,
    done jsonb NOT NULL DEFAULT '{}',
    xp integer NOT NULL DEFAULT 0,
    days jsonb NOT NULL DEFAULT '[]',
    speak text,
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  ALTER TABLE fg_progress ADD COLUMN IF NOT EXISTS data jsonb NOT NULL DEFAULT '{}';

  -- Anonymous traffic and learning events for the owner dashboard. No
  -- cookies and no link to accounts: "visitor" is a hash salted with a random
  -- key that changes every day (fg_salts) and is deleted soon after, so a
  -- person can be counted once per day but never followed across days.
  CREATE TABLE IF NOT EXISTS fg_events (
    id bigserial PRIMARY KEY,
    at timestamptz NOT NULL DEFAULT now(),
    day date NOT NULL DEFAULT current_date,
    type text NOT NULL,
    name text,
    path text,
    referrer text,
    country text,
    device text,
    lang text,
    visitor text
  );
  ALTER TABLE fg_events ADD COLUMN IF NOT EXISTS label text;
  ALTER TABLE fg_events ADD COLUMN IF NOT EXISTS value integer;
  -- Early versions linked events to the signed-in account; remove that link.
  ALTER TABLE fg_events DROP COLUMN IF EXISTS user_id;
  CREATE INDEX IF NOT EXISTS fg_events_day ON fg_events(day, type);

  CREATE TABLE IF NOT EXISTS fg_salts (
    day date PRIMARY KEY,
    salt text NOT NULL
  );
`;

// Any constant will do: it just has to be the same for every server instance.
const MIGRATION_LOCK = "4711202610";

const isMissingTable = (e: unknown) => (e as { code?: string } | null)?.code === "42P01";

async function storedVersion(run: (text: string) => Promise<{ rows: { value: string }[] }>): Promise<number> {
  const { rows } = await run("SELECT value FROM fg_meta WHERE key = 'schema_version'");
  return Number(rows[0]?.value ?? 0) || 0;
}

async function migrate(): Promise<void> {
  // Fast path, taking no locks: already up to date (or a newer deployment
  // got there first — never run an older schema over a newer one).
  try {
    if ((await storedVersion((t) => pool().query(t))) >= SCHEMA_VERSION) return;
  } catch (e) {
    if (!isMissingTable(e)) throw e; // no fg_meta yet: version unknown
  }

  const client: PoolClient = await pool().connect();
  try {
    await client.query("BEGIN");
    // One instance upgrades at a time; the others wait here, then find the
    // work done.
    await client.query(`SELECT pg_advisory_xact_lock(${MIGRATION_LOCK}::bigint)`);
    await client.query("CREATE TABLE IF NOT EXISTS fg_meta (key text PRIMARY KEY, value text NOT NULL)");
    if ((await storedVersion((t) => client.query(t))) < SCHEMA_VERSION) {
      // Don't queue up behind a long-running request for ever: give up and
      // let the next request try again.
      await client.query("SET LOCAL lock_timeout = '5s'");
      await client.query(SCHEMA);
      await client.query(
        `INSERT INTO fg_meta (key, value) VALUES ('schema_version', $1)
         ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
        [String(SCHEMA_VERSION)],
      );
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

function ensureSchema(): Promise<void> {
  // (The version check also catches a code reload during development.)
  if (g.__fgSchemaVersion !== SCHEMA_VERSION) g.__fgSchema = undefined;
  g.__fgSchemaVersion = SCHEMA_VERSION;
  g.__fgSchema ??= migrate().catch((e) => {
    g.__fgSchema = undefined; // try again on the next request
    throw e;
  });
  return g.__fgSchema;
}

export async function query<T extends Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const res = await pool().query(text, params);
  return res.rows as T[];
}

// Runs fn inside a transaction on one connection; rolls back on any error.
export async function transaction<T>(fn: (q: <R extends Record<string, unknown>>(text: string, params?: unknown[]) => Promise<R[]>) => Promise<T>): Promise<T> {
  await ensureSchema();
  const client: PoolClient = await pool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(async (text, params = []) => (await client.query(text, params)).rows);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
