import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { wearableReadings } from "@/lib/db/schema";
import { computeAndStorePrediction } from "@/lib/prediction/service";

export const runtime = "nodejs";

// POST /api/wearable/log
// Body: { date?: string, bbt?: number, resting_hr?: number, hrv?: number }
// Upserts the day's reading and recalculates predictions (activates Layer 4).
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: { date?: string; bbt?: number; resting_hr?: number; hrv?: number };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const date = b.date ?? new Date().toISOString().slice(0, 10);
  const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

  const [existing] = await db
    .select()
    .from(wearableReadings)
    .where(and(eq(wearableReadings.userId, guard.userId), eq(wearableReadings.date, date)))
    .limit(1);

  const values = {
    bbt: num(b.bbt),
    restingHr: num(b.resting_hr) as number | null,
    hrv: num(b.hrv),
  };

  let row;
  if (existing) {
    [row] = await db
      .update(wearableReadings)
      .set({ ...values, loggedAt: new Date() })
      .where(eq(wearableReadings.id, existing.id))
      .returning();
  } else {
    [row] = await db
      .insert(wearableReadings)
      .values({ userId: guard.userId, date, ...values })
      .returning();
  }

  const { result } = await computeAndStorePrediction(guard.userId);
  return NextResponse.json({ reading: row, prediction: result }, { status: 201 });
}
