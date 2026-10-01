import { query } from "./db";

// Numbers for the owner dashboard. Days are calendar days in UTC: "last N
// days" means today and the N - 1 days before it, for every number alike.

export type Stats = Awaited<ReturnType<typeof loadStats>>;

const n = (v: unknown) => Number(v ?? 0);

export async function loadStats(days: number) {
  const [totals] = await query<Record<string, string>>(
    `SELECT
       (SELECT count(*) FROM fg_users) AS users,
       (SELECT count(*) FROM fg_users WHERE created_at::date > current_date - $1::int) AS signups,
       (SELECT count(*) FROM fg_users WHERE created_at >= current_date) AS signups_today,
       (SELECT count(*) FROM fg_progress WHERE updated_at >= now() - interval '7 days') AS active7,
       (SELECT count(DISTINCT visitor) FROM fg_events WHERE type = 'pageview' AND day = current_date) AS visitors_today,
       (SELECT count(*) FROM fg_events WHERE type = 'pageview' AND day > current_date - $1::int) AS pageviews,
       (SELECT count(*) FROM fg_events WHERE type = 'event' AND name = 'lesson_passed' AND day > current_date - $1::int) AS lessons,
       (SELECT count(*) FROM fg_events WHERE type = 'event' AND name = 'review_done' AND day > current_date - $1::int) AS reviews`,
    [days],
  );

  const series = await query<{ day: string; visitors: string; pageviews: string; signups: string; lessons: string }>(
    `WITH d AS (SELECT generate_series(current_date - ($1::int - 1), current_date, interval '1 day')::date AS day),
     pv AS (SELECT day, count(DISTINCT visitor) AS visitors, count(*) AS pageviews FROM fg_events
            WHERE type = 'pageview' AND day > current_date - $1::int GROUP BY day),
     le AS (SELECT day, count(*) AS lessons FROM fg_events
            WHERE type = 'event' AND name = 'lesson_passed' AND day > current_date - $1::int GROUP BY day),
     su AS (SELECT created_at::date AS day, count(*) AS signups FROM fg_users
            WHERE created_at::date > current_date - $1::int GROUP BY 1)
     SELECT to_char(d.day, 'YYYY-MM-DD') AS day, coalesce(pv.visitors, 0) AS visitors, coalesce(pv.pageviews, 0) AS pageviews,
            coalesce(su.signups, 0) AS signups, coalesce(le.lessons, 0) AS lessons
     FROM d LEFT JOIN pv USING (day) LEFT JOIN le USING (day) LEFT JOIN su USING (day) ORDER BY d.day`,
    [days],
  );

  const top = (sql: string) => query<{ key: string | null; count: string }>(sql, [days]);
  const [pages, referrers, countries, devices, languages, methods] = await Promise.all([
    top(`SELECT path AS key, count(*) AS count FROM fg_events WHERE type = 'pageview' AND day > current_date - $1::int
         GROUP BY path ORDER BY count DESC LIMIT 10`),
    top(`SELECT coalesce(referrer, 'Direct / unknown') AS key, count(DISTINCT visitor) AS count FROM fg_events
         WHERE type = 'pageview' AND day > current_date - $1::int GROUP BY 1 ORDER BY count DESC LIMIT 10`),
    top(`SELECT coalesce(country, '??') AS key, count(DISTINCT visitor) AS count FROM fg_events
         WHERE type = 'pageview' AND day > current_date - $1::int GROUP BY 1 ORDER BY count DESC LIMIT 10`),
    top(`SELECT coalesce(device, 'unknown') AS key, count(DISTINCT visitor) AS count FROM fg_events
         WHERE type = 'pageview' AND day > current_date - $1::int GROUP BY 1 ORDER BY count DESC`),
    top(`SELECT lang AS key, count(*) AS count FROM fg_events WHERE type = 'event' AND name = 'lesson_passed'
         AND lang IS NOT NULL AND day > current_date - $1::int GROUP BY lang ORDER BY count DESC LIMIT 10`),
    top(`SELECT signup_method AS key, count(*) AS count FROM fg_users
         WHERE created_at::date > current_date - $1::int GROUP BY 1 ORDER BY count DESC`),
  ]);

  const rank = (rows: { key: string | null; count: string }[]) => rows.map((r) => ({ key: r.key ?? "—", count: n(r.count) }));

  return {
    days,
    totals: Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, n(v)])) as Record<string, number>,
    series: series.map((s) => ({ day: s.day, visitors: n(s.visitors), pageviews: n(s.pageviews), signups: n(s.signups), lessons: n(s.lessons) })),
    pages: rank(pages),
    referrers: rank(referrers),
    countries: rank(countries),
    devices: rank(devices),
    languages: rank(languages),
    methods: rank(methods),
    recent: await recentUsers(50),
  };
}

export type UserRow = {
  name: string | null;
  email: string;
  method: string;
  country: string | null;
  joined: string;
  last_seen: string | null;
  xp: number;
  lessons: number;
  languages: string[];
};

export async function recentUsers(limit: number): Promise<UserRow[]> {
  const rows = await query<{
    name: string | null;
    email: string;
    method: string;
    country: string | null;
    joined: string;
    last_seen: string | null;
    xp: number | null;
    lessons: string | null;
    languages: string[] | null;
  }>(
    `SELECT u.name, u.email, u.signup_method AS method, u.country, u.created_at AS joined,
            greatest(u.last_seen_at, p.updated_at) AS last_seen, p.xp,
            (SELECT sum(jsonb_array_length(v)) FROM jsonb_each(coalesce(p.done, '{}'::jsonb)) AS e(k, v)) AS lessons,
            (SELECT array_agg(k ORDER BY k) FROM jsonb_object_keys(coalesce(p.done, '{}'::jsonb)) AS k) AS languages
     FROM fg_users u LEFT JOIN fg_progress p ON p.user_id = u.id
     ORDER BY u.created_at DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ ...r, xp: n(r.xp), lessons: n(r.lessons), languages: r.languages ?? [] }));
}
