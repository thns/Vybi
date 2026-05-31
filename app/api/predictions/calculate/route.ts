import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { computeAndStorePrediction } from "@/lib/prediction/service";
import type { WearableInput } from "@/lib/prediction/engine";

export const runtime = "nodejs";

// POST /api/predictions/calculate
// Runs the 5-layer engine over the user's stored signals and persists the result.
// Optional body: { wearable_data: { bbt[], restingHr[], hrv[] } }
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let wearable: WearableInput | null = null;
  try {
    const body = await req.json();
    wearable = (body?.wearable_data ?? body?.wearable) ?? null;
  } catch {
    // no body is fine
  }

  const { result } = await computeAndStorePrediction(guard.userId, wearable);
  return NextResponse.json(result, { status: 200 });
}
