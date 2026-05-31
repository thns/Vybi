import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  users,
  cycleLogs,
  symptomLogs,
  biomeScores,
  predictions,
  healthMetrics,
  wearableReadings,
  pregnancies,
  birthControl,
} from "@/lib/db/schema";
import { computePreventionForUser } from "@/lib/prediction/service";
import { layer1Kalman } from "@/lib/prediction/engine";

// Collect the full dataset for a user (for JSON export and the doctor report).
export async function gatherUserData(userId: string) {
  const [profile] = await db
    .select({
      email: users.email,
      name: users.name,
      subscriptionTier: users.subscriptionTier,
      goal: users.goal,
      birthYear: users.birthYear,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const [cycles, symptoms, biomes, preds, health, wearable, pregs, bc] = await Promise.all([
    db.select().from(cycleLogs).where(eq(cycleLogs.userId, userId)).orderBy(desc(cycleLogs.periodStartDate)),
    db.select().from(symptomLogs).where(eq(symptomLogs.userId, userId)).orderBy(desc(symptomLogs.loggedAt)),
    db.select().from(biomeScores).where(eq(biomeScores.userId, userId)).orderBy(desc(biomeScores.testDate)),
    db.select().from(predictions).where(eq(predictions.userId, userId)).orderBy(desc(predictions.createdAt)).limit(1),
    db.select().from(healthMetrics).where(eq(healthMetrics.userId, userId)).orderBy(desc(healthMetrics.date)),
    db.select().from(wearableReadings).where(eq(wearableReadings.userId, userId)).orderBy(desc(wearableReadings.date)),
    db.select().from(pregnancies).where(and(eq(pregnancies.userId, userId), eq(pregnancies.active, true))).limit(1),
    db.select().from(birthControl).where(and(eq(birthControl.userId, userId), eq(birthControl.active, true))).limit(1),
  ]);

  const prevention = await computePreventionForUser(userId);

  // Cycle stats from Layer 1.
  const l1 = layer1Kalman(
    cycles.map((c) => ({ periodStartDate: c.periodStartDate, periodEndDate: c.periodEndDate, cycleLength: c.cycleLength })),
  );

  return {
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    cycleStats: { averageLength: Number(l1.predictedLength.toFixed(1)), variance: l1.variance, cyclesLogged: l1.samples },
    latestPrediction: preds[0] ?? null,
    prevention,
    cycleLogs: cycles,
    symptomLogs: symptoms,
    biomeScores: biomes,
    healthMetrics: health,
    wearableReadings: wearable,
    pregnancy: pregs[0] ?? null,
    birthControl: bc[0] ?? null,
  };
}

export type UserExport = Awaited<ReturnType<typeof gatherUserData>>;
