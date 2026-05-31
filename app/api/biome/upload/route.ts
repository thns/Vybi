import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { biomeScores } from "@/lib/db/schema";
import { computeAndStorePrediction, computeAndStorePrevention } from "@/lib/prediction/service";

export const runtime = "nodejs";

// POST /api/biome/upload
// Accepts test-kit results, stores a biome_scores row, then triggers a Layer-3
// recalculation and refreshes prevention scores.
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const num = (v: unknown) => (v == null || v === "" ? null : Number(v));

  const [row] = await db
    .insert(biomeScores)
    .values({
      userId: guard.userId,
      testKitId: (b.test_kit_id as string) ?? null,
      testDate: (b.test_date as string) ?? null,
      vaginalScore: num(b.vaginal_score) as number | null,
      gutScore: num(b.gut_score) as number | null,
      skinScore: num(b.skin_score) as number | null,
      oralScore: num(b.oral_score) as number | null,
      lCrispatusPct: num(b.l_crispatus_pct),
      lInersPct: num(b.l_iners_pct),
      gardnerellaPct: num(b.gardnerella_pct),
      phValue: num(b.ph_value),
      diversityIndex: num(b.diversity_index),
      cstType: (b.cst_type as string) ?? null,
      rawResults: (b.raw_results as object) ?? null,
    })
    .returning();

  const [{ result: prediction }, { scores: prevention }] = await Promise.all([
    computeAndStorePrediction(guard.userId),
    computeAndStorePrevention(guard.userId),
  ]);

  return NextResponse.json({ biome: row, prediction, prevention }, { status: 201 });
}
