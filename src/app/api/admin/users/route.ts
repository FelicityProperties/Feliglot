import { requireAdmin } from "@/lib/server/requireAdmin";
import { recentUsers } from "@/lib/server/stats";

// Every learner as a spreadsheet (CSV), newest first.
export async function GET() {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const users = await recentUsers(100_000);
    // Quote every cell; neutralise values a spreadsheet would run as a formula.
    // Dates come out as "2026-10-01 14:05" (UTC), which spreadsheets read.
    const cell = (v: unknown) => {
      let s = v == null ? "" : v instanceof Date ? v.toISOString().replace("T", " ").slice(0, 16) : String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = ["Name", "Email", "Signed up with", "Country", "Joined (UTC)", "Last active (UTC)", "Points", "Lessons passed", "Languages"];
    const lines = users.map((u) =>
      [u.name, u.email, u.method, u.country, u.joined, u.last_seen, u.xp, u.lessons, u.languages.join(" ")].map(cell).join(","),
    );
    const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="feliglot-learners-${new Date().toISOString().slice(0, 10)}.csv"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error("admin users: database error", e);
    return Response.json({ error: "Couldn't export right now." }, { status: 503 });
  }
}
