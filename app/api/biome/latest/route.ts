import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { biomeScores } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/biome/latest — most recent biome_scores row for the user.
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const [latest] = await db
    .select()
    .from(biomeScores)
    .where(eq(biomeScores.userId, guard.userId))
    .orderBy(desc(biomeScores.testDate))
    .limit(1);

  return NextResponse.json({ biome: latest ?? null }, { status: 200 });
}
