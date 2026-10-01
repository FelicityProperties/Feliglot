"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { getLanguage } from "@/lib/languages";
import { useAccount } from "@/lib/store";
import type { Stats } from "@/lib/server/stats";
import { AreaChart, ColumnChart, RankBars } from "./Charts";

const RANGES = [7, 30, 90] as const;
const fmt = (n: number) => n.toLocaleString("en-US");
const regions = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
const countryName = (c: string) => {
  if (c === "??" || c === "—") return "Unknown";
  try {
    return regions?.of(c) ?? c;
  } catch {
    return c;
  }
};
const ago = (iso: string | null) => {
  if (!iso) return "—";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export default function AdminDashboard() {
  const account = useAccount();
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  // The numbers on screen and the range they are for (which may lag `days`
  // while a reload is under way, or if it failed).
  const [data, setData] = useState<{ days: number; stats: Stats } | null>(null);
  const [failed, setFailed] = useState<{ days: number; error: string } | null>(null);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    if (account.status !== "signed-in") return;
    let live = true;
    fetch(`/api/admin/stats?days=${days}`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!live) return;
        if (!r.ok) setFailed({ days, error: d.error ?? "Couldn't load the numbers." });
        else {
          setData({ days, stats: d });
          setFailed(null);
        }
      })
      .catch(() => {
        if (live) setFailed({ days, error: "No connection — please try again." });
      });
    return () => {
      live = false;
    };
  }, [days, account.status]);

  if (account.status === "loading") return <p className="text-ink-600">Loading…</p>;
  if (account.status !== "signed-in")
    return (
      <p className="text-ink-600">
        This page is for the site owner.{" "}
        <Link href="/account" className="font-bold text-primary underline">
          Sign in
        </Link>
      </p>
    );
  const error = failed?.days === days ? failed.error : null;
  if (!data) return error ? <p className="rounded-2xl bg-danger-soft p-4 text-danger">{error}</p> : <p className="text-ink-600">Loading…</p>;

  const { stats } = data;
  const shown = data.days;
  const loading = shown !== days && !error;
  const t = stats.totals;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const series = stats.series;

  return (
    <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Owner analytics</p>
          <h1 className="mt-1 text-4xl font-black tracking-tight">
            {greeting}
            {account.name ? `, ${account.name}` : ""}.
          </h1>
          <p className="text-ink-600">Here&apos;s how learners are moving. Days are in UTC.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-2xl bg-sand-100 p-1" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r}
              aria-pressed={days === r}
              onClick={() => setDays(r)}
              className={`rounded-xl px-4 py-2 font-display text-sm font-extrabold ${days === r ? "bg-card text-primary shadow-soft" : "text-ink-600"}`}
            >
              Last {r} days
            </button>
          ))}
        </div>
        <a href="/api/admin/users" className="btn-secondary min-h-10! text-sm">
          <Download size={16} aria-hidden /> Download all learners (CSV)
        </a>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-danger-soft p-4 text-danger">
          {error} Still showing the last {shown} days.
        </p>
      )}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Visitors today", t.visitors_today],
          [`Sign-ups, last ${shown} days`, t.signups],
          [`Lessons passed, last ${shown} days`, t.lessons],
          ["Active learners, last 7 days", t.active7],
          ["Learners in total", t.users],
        ].map(([label, value]) => (
          <div key={label as string} className="panel flex flex-col-reverse gap-1 p-4!">
            <dt className="text-sm text-ink-500">{label as string}</dt>
            <dd className="font-display text-3xl font-black tabular-nums">{fmt(value as number)}</dd>
          </div>
        ))}
      </dl>

      <section className="panel">
        <p className="eyebrow">Audience</p>
        <h2 className="mt-1 text-xl font-extrabold">Visitors per day</h2>
        <p className="mb-3 text-sm text-ink-500">
          Unique visitors (counted once per day, no cookies) · {fmt(t.pageviews)} page views in {shown} days
        </p>
        <AreaChart
          label="visitors"
          data={series.map((s) => ({ day: s.day, value: s.visitors, extra: [["page views", s.pageviews], ["sign-ups", s.signups], ["lessons", s.lessons]] }))}
        />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="panel">
          <h2 className="text-lg font-extrabold">Sign-ups per day</h2>
          <p className="mb-2 text-sm text-ink-500">
            {stats.methods.map((m) => `${fmt(m.count)} with ${m.key === "google" ? "Google" : "email"}`).join(" · ") || "None yet"}
          </p>
          <ColumnChart label="sign-ups" data={series.map((s) => ({ day: s.day, value: s.signups }))} />
        </section>
        <section className="panel">
          <h2 className="text-lg font-extrabold">Lessons passed per day</h2>
          <p className="mb-2 text-sm text-ink-500">{fmt(t.reviews)} review sessions too</p>
          <ColumnChart label="lessons" data={series.map((s) => ({ day: s.day, value: s.lessons }))} />
        </section>
      </div>

      <div>
        <button onClick={() => setShowTable((v) => !v)} aria-expanded={showTable} className="text-sm font-bold text-primary underline">
          {showTable ? "Hide" : "Show"} the daily numbers as a table
        </button>
        {showTable && (
          <div className="panel mt-3 overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <caption className="sr-only">Daily numbers</caption>
              <thead className="text-left text-xs tracking-wide text-ink-500 uppercase">
                <tr>
                  {["Day", "Visitors", "Page views", "Sign-ups", "Lessons"].map((h) => (
                    <th key={h} className="border-b border-sand-300 px-3 py-2 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...series].reverse().map((s) => (
                  <tr key={s.day}>
                    <td className="border-b border-sand-300 px-3 py-2">{s.day}</td>
                    <td className="border-b border-sand-300 px-3 py-2">{fmt(s.visitors)}</td>
                    <td className="border-b border-sand-300 px-3 py-2">{fmt(s.pageviews)}</td>
                    <td className="border-b border-sand-300 px-3 py-2">{fmt(s.signups)}</td>
                    <td className="border-b border-sand-300 px-3 py-2">{fmt(s.lessons)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <section className="panel">
          <p className="eyebrow">Demand</p>
          <h2 className="mt-1 mb-4 text-lg font-extrabold">Languages being learned</h2>
          <RankBars label="Lessons passed by language" rows={stats.languages.map((r) => ({ key: r.key, label: getLanguage(r.key)?.name ?? r.key, count: r.count }))} />
        </section>
        <section className="panel">
          <h2 className="mb-4 text-lg font-extrabold">Top countries</h2>
          <RankBars label="Visitors by country" rows={stats.countries.map((r) => ({ key: r.key, label: countryName(r.key), count: r.count }))} />
        </section>
        <section className="panel">
          <h2 className="mb-4 text-lg font-extrabold">Where visitors come from</h2>
          <RankBars label="Visitors by referring site" rows={stats.referrers.map((r) => ({ key: r.key, label: r.key, count: r.count }))} />
        </section>
        <section className="panel">
          <h2 className="mb-4 text-lg font-extrabold">Top pages</h2>
          <RankBars label="Page views by page" rows={stats.pages.map((r) => ({ key: r.key, label: r.key, count: r.count }))} />
        </section>
        <section className="panel">
          <h2 className="mb-4 text-lg font-extrabold">Devices</h2>
          <RankBars label="Visitors by device" rows={stats.devices.map((r) => ({ key: r.key, label: r.key[0].toUpperCase() + r.key.slice(1), count: r.count }))} />
        </section>
      </div>

      <section className="panel">
        <p className="eyebrow">Newest learners</p>
        <h2 className="mt-1 mb-4 text-xl font-extrabold">Who joined</h2>
        {stats.recent.length === 0 ? (
          <p className="text-ink-600">No sign-ups yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">The 50 most recent sign-ups</caption>
              <thead className="text-xs tracking-wide text-ink-500 uppercase">
                <tr>
                  {["Name", "Email", "Joined with", "Country", "Joined", "Last active", "Points", "Lessons", "Learning"].map((h) => (
                    <th key={h} className="border-b border-sand-300 px-3 py-2 font-bold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((u) => (
                  <tr key={u.email}>
                    <td className="border-b border-sand-300 px-3 py-2.5 font-bold">{u.name ?? "—"}</td>
                    <td className="border-b border-sand-300 px-3 py-2.5">{u.email}</td>
                    <td className="border-b border-sand-300 px-3 py-2.5">
                      <span className="inline-flex items-center gap-1">
                        {u.method === "google" ? "G" : <Mail size={14} aria-hidden />} {u.method === "google" ? "Google" : "Email"}
                      </span>
                    </td>
                    <td className="border-b border-sand-300 px-3 py-2.5">{u.country ? countryName(u.country) : "—"}</td>
                    <td className="border-b border-sand-300 px-3 py-2.5 whitespace-nowrap">{ago(u.joined)}</td>
                    <td className="border-b border-sand-300 px-3 py-2.5 whitespace-nowrap">{ago(u.last_seen)}</td>
                    <td className="border-b border-sand-300 px-3 py-2.5 tabular-nums">{fmt(u.xp)}</td>
                    <td className="border-b border-sand-300 px-3 py-2.5 tabular-nums">{fmt(u.lessons)}</td>
                    <td className="border-b border-sand-300 px-3 py-2.5">{u.languages.map((c) => getLanguage(c)?.name ?? c).join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
