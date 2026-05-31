import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { symptomLogs } from "@/lib/db/schema";
import { computeAndStorePrediction } from "@/lib/prediction/service";

export const runtime = "nodejs";

// POST /api/symptoms/log
// Body: { cycle_day: number, symptoms: string[], severity?: Record<string, number> }
// Saves the log and triggers a Layer-2 (and full) recalculation.
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let body: { cycle_day?: number; symptoms?: string[]; severity?: Record<string, number> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.symptoms)) {
    return NextResponse.json({ error: "symptoms must be an array" }, { status: 400 });
  }

  const [log] = await db
    .insert(symptomLogs)
    .values({
      userId: guard.userId,
      cycleDay: body.cycle_day ?? null,
      symptoms: body.symptoms,
      severity: body.severity ?? {},
    })
    .returning();

  // Recalculate predictions now that symptom data changed (Layer 2).
  const { result } = await computeAndStorePrediction(guard.userId);

  return NextResponse.json({ log, prediction: result }, { status: 201 });
}
