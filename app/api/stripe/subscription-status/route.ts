import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { stripe, stripeEnabled } from "@/lib/stripe";

export const runtime = "nodejs";

// GET /api/stripe/subscription-status — current tier + live Stripe status.
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const [user] = await db.select().from(users).where(eq(users.id, guard.userId)).limit(1);
  const tier = user?.subscriptionTier ?? "free";

  let status: string | null = null;
  let currentPeriodEnd: number | null = null;
  let cancelAtPeriodEnd = false;

  if (stripeEnabled && stripe && user?.stripeSubscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      status = sub.status;
      // current_period_end lives on the subscription (older API) or its item
      // (newer API); read it defensively to stay version-agnostic.
      const subAny = sub as unknown as {
        current_period_end?: number;
        items: { data: { current_period_end?: number }[] };
      };
      currentPeriodEnd = subAny.current_period_end ?? subAny.items.data[0]?.current_period_end ?? null;
      cancelAtPeriodEnd = sub.cancel_at_period_end;
    } catch {
      // Subscription not found / Stripe error — fall back to the stored tier.
    }
  }

  return NextResponse.json(
    { tier, status, current_period_end: currentPeriodEnd, cancel_at_period_end: cancelAtPeriodEnd },
    { status: 200 },
  );
}
