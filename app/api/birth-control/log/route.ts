import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { birthControlLogs } from "@/lib/db/schema";

export const runtime = "nodejs";

// POST /api/birth-control/log  Body: { date?: string, taken?: boolean }
// Records (or updates) whether the pill was taken on a given day.
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: { date?: string; taken?: boolean } = {};
  try {
    b = await req.json();
  } catch {
    // default to today / taken
  }

  const date = b.date ?? new Date().toISOString().slice(0, 10);
  const taken = b.taken ?? true;

  // Upsert by (user, date) so a day isn't logged twice.
  const [existing] = await db
    .select()
    .from(birthControlLogs)
    .where(and(eq(birthControlLogs.userId, guard.userId), eq(birthControlLogs.date, date)))
    .limit(1);

  let row;
  if (existing) {
    [row] = await db
      .update(birthControlLogs)
      .set({ taken, loggedAt: new Date() })
      .where(eq(birthControlLogs.id, existing.id))
      .returning();
  } else {
    [row] = await db
      .insert(birthControlLogs)
      .values({ userId: guard.userId, date, taken })
      .returning();
  }

  return NextResponse.json({ log: row }, { status: 201 });
}
