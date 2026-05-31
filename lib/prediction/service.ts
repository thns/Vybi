import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  cycleLogs,
  symptomLogs,
  biomeScores,
  predictions,
  preventionScores,
  healthMetrics,
  wearableReadings,
} from "@/lib/db/schema";
import { runPrediction, layer1Kalman, type WearableInput } from "./engine";
import { computePreventionScores } from "./prevention";

// Load all signal data for a user, in one round-trip.
export async function loadUserSignals(userId: string) {
  const [cycles, symptoms, biomes, health, wearable] = await Promise.all([
    db.select().from(cycleLogs).where(eq(cycleLogs.userId, userId)),
    db.select().from(symptomLogs).where(eq(symptomLogs.userId, userId)),
    db.select().from(biomeScores).where(eq(biomeScores.userId, userId)),
    db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId)),
    db.select().from(wearableReadings).where(eq(wearableReadings.userId, userId)),
  ]);
  return { cycles, symptoms, biomes, health, wearable };
}

// Build the engine's wearable input from stored readings (chronological arrays).
function buildWearable(
  readings: { date: string | null; bbt: number | null; restingHr: number | null; hrv: number | null }[],
): WearableInput | null {
  if (!readings.length) return null;
  const sorted = [...readings].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  const bbt = sorted.map((r) => r.bbt).filter((v): v is number => v != null);
  const restingHr = sorted.map((r) => r.restingHr).filter((v): v is number => v != null);
  const hrv = sorted.map((r) => r.hrv).filter((v): v is number => v != null);
  if (!bbt.length && !restingHr.length && !hrv.length) return null;
  return { bbt, restingHr, hrv };
}

function latestBiome<T extends { testDate?: string | null }>(rows: T[]): T | null {
  if (!rows.length) return null;
  return [...rows].sort((a, b) => (a.testDate ?? "").localeCompare(b.testDate ?? ""))[
    rows.length - 1
  ];
}

// Run the 5-layer engine for a user and persist the result.
export async function computeAndStorePrediction(userId: string, wearable?: WearableInput | null) {
  const { cycles, symptoms, biomes, wearable: wearableRows } = await loadUserSignals(userId);
  // Use an explicitly-passed wearable payload, else build from stored readings.
  const wearableInput = wearable ?? buildWearable(wearableRows);

  const result = runPrediction({
    cycleLogs: cycles.map((c) => ({
      periodStartDate: c.periodStartDate,
      periodEndDate: c.periodEndDate,
      cycleLength: c.cycleLength,
    })),
    symptomLogs: symptoms.map((s) => ({ cycleDay: s.cycleDay, symptoms: s.symptoms })),
    biomeScores: biomes.map((b) => ({
      testDate: b.testDate,
      lCrispatusPct: b.lCrispatusPct,
      lInersPct: b.lInersPct,
      gardnerellaPct: b.gardnerellaPct,
      phValue: b.phValue,
      diversityIndex: b.diversityIndex,
      cstType: b.cstType,
    })),
    wearable: wearableInput,
  });

  const [saved] = await db
    .insert(predictions)
    .values({
      userId,
      predictedPeriodStart: result.predicted_period_start,
      predictedOvulation: result.predicted_ovulation,
      fertileWindowStart: result.fertile_window_start,
      fertileWindowEnd: result.fertile_window_end,
      confidencePct: result.confidence_pct,
      accuracyPct: result.accuracy_pct,
      layersUsed: result.layers_active,
    })
    .returning();

  return { result, saved };
}

// Compute the preventive risk scores for a user (no persistence).
export async function computePreventionForUser(userId: string) {
  const { cycles, biomes, health } = await loadUserSignals(userId);

  const l1 = layer1Kalman(
    cycles.map((c) => ({
      periodStartDate: c.periodStartDate,
      periodEndDate: c.periodEndDate,
      cycleLength: c.cycleLength,
    })),
  );

  const biome = latestBiome(biomes);
  const latestHealth = [...health].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))[
    health.length - 1
  ];

  return computePreventionScores({
    biome: biome
      ? {
          lCrispatusPct: biome.lCrispatusPct,
          lInersPct: biome.lInersPct,
          gardnerellaPct: biome.gardnerellaPct,
          phValue: biome.phValue,
          diversityIndex: biome.diversityIndex,
          gutScore: biome.gutScore,
          skinScore: biome.skinScore,
        }
      : null,
    cycleVariance: l1.variance,
    cycleSamples: l1.samples,
    hydrationLitres: latestHealth?.hydrationLitres ?? null,
  });
}

// Compute the preventive risk scores for a user and persist them.
export async function computeAndStorePrevention(userId: string) {
  const { cycles, biomes, health } = await loadUserSignals(userId);

  const l1 = layer1Kalman(
    cycles.map((c) => ({
      periodStartDate: c.periodStartDate,
      periodEndDate: c.periodEndDate,
      cycleLength: c.cycleLength,
    })),
  );

  const biome = latestBiome(biomes);
  const latestHealth = [...health].sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))[
    health.length - 1
  ];

  const scores = computePreventionScores({
    biome: biome
      ? {
          lCrispatusPct: biome.lCrispatusPct,
          lInersPct: biome.lInersPct,
          gardnerellaPct: biome.gardnerellaPct,
          phValue: biome.phValue,
          diversityIndex: biome.diversityIndex,
          gutScore: biome.gutScore,
          skinScore: biome.skinScore,
        }
      : null,
    cycleVariance: l1.variance,
    cycleSamples: l1.samples,
    hydrationLitres: latestHealth?.hydrationLitres ?? null,
  });

  const [saved] = await db
    .insert(preventionScores)
    .values({
      userId,
      bvRiskScore: scores.bv_risk_score,
      utiRiskScore: scores.uti_risk_score,
      gutDysbiosisScore: scores.gut_dysbiosis_score,
      skinImbalanceScore: scores.skin_imbalance_score,
      pcosIndicatorScore: scores.pcos_indicator_score,
      overallProtectionScore: scores.overall_protection_score,
    })
    .returning();

  return { scores, saved };
}
