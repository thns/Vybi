import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { wearableReadings } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/wearable — recent readings (newest first).
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const rows = await db
    .select()
    .from(wearableReadings)
    .where(eq(wearableReadings.userId, guard.userId))
    .orderBy(desc(wearableReadings.date))
    .limit(30);

  return NextResponse.json({ readings: rows }, { status: 200 });
}
