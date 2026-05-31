import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

export const runtime = "nodejs";

// POST /api/push/unsubscribe  Body: { endpoint }
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: { endpoint?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!b.endpoint) return NextResponse.json({ error: "endpoint required" }, { status: 400 });

  await db
    .delete(pushSubscriptions)
    .where(
      and(eq(pushSubscriptions.userId, guard.userId), eq(pushSubscriptions.endpoint, b.endpoint)),
    );

  return NextResponse.json({ ok: true }, { status: 200 });
}
