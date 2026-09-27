import { Pool } from "pg";

// Neon (connected in Vercel) provides DATABASE_URL; older Vercel Postgres
// setups call it POSTGRES_URL. Without either, accounts are switched off and
// the site keeps working with progress saved in the browser only.
const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

export const accountsEnabled = Boolean(url);

// One small pool per server instance, reused across requests.
const g = globalThis as unknown as { __fgPool?: Pool; __fgSchema?: Promise<void> };

function pool(): Pool {
  if (!url) throw new Error("No database configured");
  g.__fgPool ??= new Pool({ connectionString: url, max: 3, idleTimeoutMillis: 10_000 });
  return g.__fgPool;
}

// Tables are created on first use, so there is no separate setup step.
function ensureSchema(): Promise<void> {
  g.__fgSchema ??= pool()
    .query(
      `CREATE TABLE IF NOT EXISTS fg_users (
         id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
         email text NOT NULL UNIQUE,
         password_hash text NOT NULL,
         created_at timestamptz NOT NULL DEFAULT now()
       );
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
       );`,
    )
    .then(() => undefined)
    .catch((e) => {
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
