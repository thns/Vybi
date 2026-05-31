import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/me — the current user's profile (goal, age, tier, …).
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const [u] = await db
    .select({
      email: users.email,
      name: users.name,
      subscriptionTier: users.subscriptionTier,
      onboarded: users.onboarded,
      goal: users.goal,
      birthYear: users.birthYear,
      anonymousMode: users.anonymousMode,
    })
    .from(users)
    .where(eq(users.id, guard.userId))
    .limit(1);

  return NextResponse.json({ user: u ?? null }, { status: 200 });
}
