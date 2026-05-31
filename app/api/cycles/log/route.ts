import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { cycleLogs } from "@/lib/db/schema";
import { computeAndStorePrediction } from "@/lib/prediction/service";

export const runtime = "nodejs";

// GET /api/cycles/log — list the user's cycle logs (newest first).
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const rows = await db
    .select()
    .from(cycleLogs)
    .where(eq(cycleLogs.userId, guard.userId))
    .orderBy(desc(cycleLogs.periodStartDate));

  return NextResponse.json({ cycles: rows }, { status: 200 });
}

// POST /api/cycles/log
// Body: { period_start_date: string, period_end_date?: string, cycle_length?: number }
// Saves a period log and recalculates predictions (Layer 1).
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let body: { period_start_date?: string; period_end_date?: string; cycle_length?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.period_start_date) {
    return NextResponse.json({ error: "period_start_date is required" }, { status: 400 });
  }

  const [log] = await db
    .insert(cycleLogs)
    .values({
      userId: guard.userId,
      periodStartDate: body.period_start_date,
      periodEndDate: body.period_end_date ?? null,
      cycleLength: body.cycle_length ?? null,
    })
    .returning();

  const { result } = await computeAndStorePrediction(guard.userId);
  return NextResponse.json({ log, prediction: result }, { status: 201 });
}
