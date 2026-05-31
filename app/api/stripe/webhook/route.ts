import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { stripe, stripeEnabled, tierForPrice, type Tier } from "@/lib/stripe";

export const runtime = "nodejs";

async function setTierByCustomer(customerId: string, tier: Tier, subscriptionId: string | null) {
  await db
    .update(users)
    .set({ subscriptionTier: tier, stripeSubscriptionId: subscriptionId })
    .where(eq(users.stripeCustomerId, customerId));
}

// POST /api/stripe/webhook — Stripe event sink (raw body, signature-verified).
export async function POST(req: Request) {
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig as string, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.subscription && s.customer) {
        const sub = await stripe.subscriptions.retrieve(s.subscription as string);
        const tier = tierForPrice(sub.items.data[0]?.price.id);
        await setTierByCustomer(s.customer as string, tier, sub.id);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const active = sub.status === "active" || sub.status === "trialing";
      const tier = active ? tierForPrice(sub.items.data[0]?.price.id) : "free";
      await setTierByCustomer(sub.customer as string, tier, sub.id);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setTierByCustomer(sub.customer as string, "free", null);
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      if (inv.customer) await setTierByCustomer(inv.customer as string, "free", null);
      break;
    }
    default:
      // Unhandled event types are acknowledged without action.
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
