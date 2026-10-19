import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const runtime = "nodejs";

const TIERS = ["free", "core", "premium"] as const;

// PATCH /api/admin/users/[id]  Body: { subscriptionTier }. Admin only.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const tier = body?.subscriptionTier;

  if (!TIERS.includes(tier)) {
    return NextResponse.json({ error: "Invalid subscriptionTier" }, { status: 400 });
  }

  const [updated] = await db
    .update(users)
    .set({ subscriptionTier: tier })
    .where(eq(users.id, id))
    .returning({ id: users.id, email: users.email, subscriptionTier: users.subscriptionTier });

  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user: updated }, { status: 200 });
}
