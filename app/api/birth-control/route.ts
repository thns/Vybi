import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { birthControl, birthControlLogs } from "@/lib/db/schema";

export const runtime = "nodejs";

const METHODS = [
  "pill", "patch", "ring", "iud_hormonal", "iud_copper", "implant", "injection", "condom", "none",
];

// GET /api/birth-control — active method config + recent adherence logs.
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const [config] = await db
    .select()
    .from(birthControl)
    .where(and(eq(birthControl.userId, guard.userId), eq(birthControl.active, true)))
    .orderBy(desc(birthControl.updatedAt))
    .limit(1);

  const logs = await db
    .select()
    .from(birthControlLogs)
    .where(eq(birthControlLogs.userId, guard.userId))
    .orderBy(desc(birthControlLogs.date))
    .limit(30);

  return NextResponse.json({ config: config ?? null, logs }, { status: 200 });
}

// POST /api/birth-control  Body: { method, start_date?, pill_time?, notes? }
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: { method?: string; start_date?: string; pill_time?: string; notes?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!b.method || !METHODS.includes(b.method)) {
    return NextResponse.json({ error: `method must be one of: ${METHODS.join(", ")}` }, { status: 400 });
  }

  // One active config at a time — retire the previous, store the new.
  await db
    .update(birthControl)
    .set({ active: false })
    .where(and(eq(birthControl.userId, guard.userId), eq(birthControl.active, true)));

  const [created] = await db
    .insert(birthControl)
    .values({
      userId: guard.userId,
      method: b.method,
      startDate: b.start_date ?? null,
      pillTime: b.pill_time ?? null,
      notes: b.notes ?? null,
    })
    .returning();

  return NextResponse.json({ config: created }, { status: 201 });
}
