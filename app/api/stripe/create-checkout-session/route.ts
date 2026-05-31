import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { stripe, stripeEnabled, PRICE_IDS } from "@/lib/stripe";

export const runtime = "nodejs";

// POST /api/stripe/create-checkout-session  Body: { tier: "core" | "premium" }
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  let body: { tier?: "core" | "premium" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const tier = body.tier;
  if (tier !== "core" && tier !== "premium") {
    return NextResponse.json({ error: "tier must be 'core' or 'premium'" }, { status: 400 });
  }
  const priceId = PRICE_IDS[tier];
  if (!priceId) {
    return NextResponse.json({ error: `No price configured for ${tier}` }, { status: 503 });
  }

  const session = await auth();
  const [user] = await db.select().from(users).where(eq(users.id, guard.userId)).limit(1);

  // Reuse or create the Stripe customer.
  let customerId = user?.stripeCustomerId ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.email ?? session?.user?.email ?? undefined,
      metadata: { userId: guard.userId },
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, guard.userId));
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: guard.userId,
    metadata: { userId: guard.userId, tier },
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
  });

  return NextResponse.json({ url: checkout.url }, { status: 200 });
}
