import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { healthMetrics } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/health/summary — monthly aggregate of health metrics.
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const rows = await db
    .select()
    .from(healthMetrics)
    .where(eq(healthMetrics.userId, guard.userId));

  // Group by YYYY-MM and average the numeric fields.
  const byMonth = new Map<string, typeof rows>();
  for (const r of rows) {
    const month = (r.date ?? "").slice(0, 7);
    if (!month) continue;
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(r);
  }

  const avg = (nums: (number | null)[]) => {
    const vals = nums.filter((n): n is number => n != null);
    return vals.length ? Number((vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(2)) : null;
  };

  const summary = [...byMonth.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, ms]) => ({
      month,
      entries: ms.length,
      avg_sleep_hours: avg(ms.map((m) => m.sleepHours)),
      avg_hydration_litres: avg(ms.map((m) => m.hydrationLitres)),
      total_exercise_sessions: ms.reduce((s, m) => s + (m.exerciseSessions ?? 0), 0),
      stress_levels: ms.map((m) => m.stressLevel).filter(Boolean),
    }));

  return NextResponse.json({ summary }, { status: 200 });
}
