import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { stripe, stripeEnabled } from "@/lib/stripe";

export const runtime = "nodejs";

// POST /api/stripe/cancel-subscription — cancel at period end.
export async function POST() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, guard.userId)).limit(1);
  if (!user?.stripeSubscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  const sub = await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  return NextResponse.json(
    { ok: true, cancel_at_period_end: sub.cancel_at_period_end },
    { status: 200 },
  );
}
