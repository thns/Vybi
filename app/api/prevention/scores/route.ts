import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { computePreventionForUser } from "@/lib/prediction/service";

export const runtime = "nodejs";

// GET /api/prevention/scores — compute + return all 5 risk scores (read-only;
// persistence happens on biome upload via computeAndStorePrevention).
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const scores = await computePreventionForUser(guard.userId);
  return NextResponse.json(scores, { status: 200 });
}
