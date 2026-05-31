import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/partner — current share token (if any).
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  const [u] = await db
    .select({ token: users.partnerShareToken })
    .from(users)
    .where(eq(users.id, guard.userId))
    .limit(1);
  return NextResponse.json({ token: u?.token ?? null }, { status: 200 });
}

// POST /api/partner — create (or return existing) share token.
export async function POST() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const [u] = await db
    .select({ token: users.partnerShareToken })
    .from(users)
    .where(eq(users.id, guard.userId))
    .limit(1);

  let token = u?.token ?? null;
  if (!token) {
    token = randomBytes(12).toString("hex");
    await db.update(users).set({ partnerShareToken: token }).where(eq(users.id, guard.userId));
  }
  return NextResponse.json({ token }, { status: 201 });
}

// DELETE /api/partner — revoke the share token.
export async function DELETE() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  await db.update(users).set({ partnerShareToken: null }).where(eq(users.id, guard.userId));
  return NextResponse.json({ ok: true }, { status: 200 });
}
