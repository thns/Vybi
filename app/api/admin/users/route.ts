import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { isAdminEmail } from "@/lib/admin";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/admin/users — all users with profile + billing fields. Admin only.
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      subscriptionTier: users.subscriptionTier,
      onboarded: users.onboarded,
      anonymousMode: users.anonymousMode,
      goal: users.goal,
      birthYear: users.birthYear,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const list = rows.map((u) => ({ ...u, isAdmin: isAdminEmail(u.email) }));
  const stats = {
    total: list.length,
    free: list.filter((u) => u.subscriptionTier === "free").length,
    core: list.filter((u) => u.subscriptionTier === "core").length,
    premium: list.filter((u) => u.subscriptionTier === "premium").length,
    onboarded: list.filter((u) => u.onboarded).length,
    admins: list.filter((u) => u.isAdmin).length,
  };

  return NextResponse.json({ users: list, stats }, { status: 200 });
}
