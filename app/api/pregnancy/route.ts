import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { pregnancies } from "@/lib/db/schema";
import { pregnancyStatus, dueDateFromLMP } from "@/lib/pregnancy";

export const runtime = "nodejs";

async function activePregnancy(userId: string) {
  const [p] = await db
    .select()
    .from(pregnancies)
    .where(and(eq(pregnancies.userId, userId), eq(pregnancies.active, true)))
    .orderBy(desc(pregnancies.createdAt))
    .limit(1);
  return p ?? null;
}

// GET /api/pregnancy — active pregnancy + computed week/trimester status.
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  const p = await activePregnancy(guard.userId);
  if (!p) return NextResponse.json({ pregnancy: null, status: null }, { status: 200 });
  return NextResponse.json({ pregnancy: p, status: pregnancyStatus(p.dueDate) }, { status: 200 });
}

// POST /api/pregnancy  Body: { due_date?: string, last_period_date?: string }
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: { due_date?: string; last_period_date?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const dueDate = b.due_date ?? (b.last_period_date ? dueDateFromLMP(b.last_period_date) : null);
  if (!dueDate) {
    return NextResponse.json({ error: "due_date or last_period_date is required" }, { status: 400 });
  }

  // Close any existing active pregnancy, then start the new one.
  await db
    .update(pregnancies)
    .set({ active: false, endedAt: new Date() })
    .where(and(eq(pregnancies.userId, guard.userId), eq(pregnancies.active, true)));

  const [created] = await db
    .insert(pregnancies)
    .values({
      userId: guard.userId,
      dueDate,
      lastPeriodDate: b.last_period_date ?? null,
    })
    .returning();

  return NextResponse.json(
    { pregnancy: created, status: pregnancyStatus(created.dueDate) },
    { status: 201 },
  );
}

// DELETE /api/pregnancy — end the active pregnancy.
export async function DELETE() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  await db
    .update(pregnancies)
    .set({ active: false, endedAt: new Date() })
    .where(and(eq(pregnancies.userId, guard.userId), eq(pregnancies.active, true)));
  return NextResponse.json({ ok: true }, { status: 200 });
}
