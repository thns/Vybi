import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users, cycleLogs } from "@/lib/db/schema";
import { computeAndStorePrediction } from "@/lib/prediction/service";

export const runtime = "nodejs";

// POST /api/onboarding
// Body: { last_period_date?: string, cycle_length?: number }
// Marks the user onboarded and (if provided) seeds their first cycle so the
// prediction engine has a baseline to work from.
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: { last_period_date?: string; cycle_length?: number } = {};
  try {
    b = await req.json();
  } catch {
    // empty body is fine (skip flow)
  }

  await db.update(users).set({ onboarded: true }).where(eq(users.id, guard.userId));

  if (b.last_period_date) {
    await db.insert(cycleLogs).values({
      userId: guard.userId,
      periodStartDate: b.last_period_date,
      cycleLength: b.cycle_length ?? null,
    });
    const { result } = await computeAndStorePrediction(guard.userId);
    return NextResponse.json({ ok: true, prediction: result }, { status: 201 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
