import { requireAdmin } from "@/lib/server/requireAdmin";
import { loadStats } from "@/lib/server/stats";

export async function GET(req: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const asked = Number(new URL(req.url).searchParams.get("days"));
    const days = [7, 30, 90].includes(asked) ? asked : 30;
    return Response.json(await loadStats(days), { headers: { "cache-control": "no-store" } });
  } catch (e) {
    console.error("admin stats: database error", e);
    return Response.json({ error: "Couldn't load the numbers right now." }, { status: 503 });
  }
}
