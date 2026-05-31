import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { predictions } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/predictions/latest — most recent stored prediction for the user.
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const [latest] = await db
    .select()
    .from(predictions)
    .where(eq(predictions.userId, guard.userId))
    .orderBy(desc(predictions.createdAt))
    .limit(1);

  return NextResponse.json({ prediction: latest ?? null }, { status: 200 });
}
