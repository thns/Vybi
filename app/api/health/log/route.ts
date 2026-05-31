import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { healthMetrics } from "@/lib/db/schema";

export const runtime = "nodejs";

// POST /api/health/log
// Body: { date, sleep_hours?, stress_level?, hydration_litres?, exercise_sessions? }
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: {
    date?: string;
    sleep_hours?: number;
    stress_level?: string;
    hydration_litres?: number;
    exercise_sessions?: number;
  };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!b.date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const [row] = await db
    .insert(healthMetrics)
    .values({
      userId: guard.userId,
      date: b.date,
      sleepHours: b.sleep_hours ?? null,
      stressLevel: b.stress_level ?? null,
      hydrationLitres: b.hydration_litres ?? null,
      exerciseSessions: b.exercise_sessions ?? null,
    })
    .returning();

  return NextResponse.json({ metric: row }, { status: 201 });
}
