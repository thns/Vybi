import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { desc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { predictions } from "@/lib/db/schema";
import { loadUserSignals, computePreventionForUser } from "@/lib/prediction/service";

export const runtime = "nodejs";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";
const anthropicEnabled = !!process.env.ANTHROPIC_API_KEY;

const SYSTEM_BASE =
  "You are Vybi, a women's health AI assistant. You have access to this user's " +
  "cycle data, biome scores and symptom logs. Always reference their actual data " +
  "in responses. Be warm, clinical and precise.";

// Build a compact, factual snapshot of the user's data for grounding.
async function buildContext(userId: string): Promise<string> {
  const { cycles, symptoms, biomes } = await loadUserSignals(userId);
  const [latestPrediction] = await db
    .select()
    .from(predictions)
    .where(eq(predictions.userId, userId))
    .orderBy(desc(predictions.createdAt))
    .limit(1);
  const prevention = await computePreventionForUser(userId);
  const latestBiome = [...biomes].sort((a, b) => (a.testDate ?? "").localeCompare(b.testDate ?? ""))[
    biomes.length - 1
  ];

  return [
    "USER DATA SNAPSHOT (reference this in every answer):",
    `- Cycles logged: ${cycles.length}`,
    `- Symptom logs: ${symptoms.length} (recent: ${symptoms
      .slice(-5)
      .flatMap((s) => s.symptoms)
      .join(", ") || "none"})`,
    latestPrediction
      ? `- Latest prediction: period ${latestPrediction.predictedPeriodStart}, ovulation ${latestPrediction.predictedOvulation}, confidence ${latestPrediction.confidencePct}%, accuracy ${latestPrediction.accuracyPct}%, layers [${(latestPrediction.layersUsed ?? []).join(", ")}]`
      : "- Latest prediction: none yet",
    latestBiome
      ? `- Latest biome (${latestBiome.testDate}): L.crispatus ${latestBiome.lCrispatusPct}%, L.iners ${latestBiome.lInersPct}%, Gardnerella ${latestBiome.gardnerellaPct}%, pH ${latestBiome.phValue}, diversity ${latestBiome.diversityIndex}, CST ${latestBiome.cstType}`
      : "- Latest biome: no test kit on file",
    `- Prevention risk scores: BV ${prevention.bv_risk_score}, UTI ${prevention.uti_risk_score}, gut ${prevention.gut_dysbiosis_score}, skin ${prevention.skin_imbalance_score}, PCOS ${prevention.pcos_indicator_score}; overall protection ${prevention.overall_protection_score}`,
  ].join("\n");
}

interface IncomingMessage {
  role: "user" | "vybi" | "assistant";
  text?: string;
  content?: string;
}

// POST /api/chat  Body: { messages: {role, text}[] }
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  if (!anthropicEnabled) {
    return NextResponse.json(
      { error: "Vybi chat is not configured yet (ANTHROPIC_API_KEY pending)." },
      { status: 503 },
    );
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text ?? m.content ?? "",
    }))
    .filter((m) => m.content.trim().length > 0);

  if (history.length === 0) {
    return NextResponse.json({ error: "messages is required" }, { status: 400 });
  }

  const context = await buildContext(guard.userId);
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `${SYSTEM_BASE}\n\n${context}`,
    messages: history,
  });

  const reply = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return NextResponse.json({ reply }, { status: 200 });
}
