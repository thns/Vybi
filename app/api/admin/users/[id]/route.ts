import { NextResponse } from "next/server";
import { eq, count, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { isAdminEmail } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  users, cycleLogs, symptomLogs, biomeScores, predictions, preventionScores,
  communityPosts, communityReplies, wearableReadings, pregnancies,
  birthControl, birthControlLogs, healthMetrics,
} from "@/lib/db/schema";

export const runtime = "nodejs";

const TIERS = ["free", "core", "premium"] as const;
const cnt = async (tbl: any, userId: string) =>
  (await db.select({ n: count() }).from(tbl).where(eq(tbl.userId, userId)))[0]?.n ?? 0;

// GET /api/admin/users/[id] — full read-only record of one user's account + data.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const { passwordHash, ...safe } = u as Record<string, unknown>;

  const [counts, recentCycles, latestBiome, latestPrediction, latestPrevention, recentSymptoms] = await Promise.all([
    (async () => ({
      cycles: await cnt(cycleLogs, id),
      symptoms: await cnt(symptomLogs, id),
      biomeTests: await cnt(biomeScores, id),
      predictions: await cnt(predictions, id),
      prevention: await cnt(preventionScores, id),
      communityPosts: await cnt(communityPosts, id),
      communityReplies: await cnt(communityReplies, id),
      wearableReadings: await cnt(wearableReadings, id),
      pregnancies: await cnt(pregnancies, id),
      birthControl: await cnt(birthControl, id),
      birthControlLogs: await cnt(birthControlLogs, id),
      healthMetrics: await cnt(healthMetrics, id),
    }))(),
    db.select().from(cycleLogs).where(eq(cycleLogs.userId, id)).orderBy(desc(cycleLogs.periodStartDate)).limit(6),
    db.select().from(biomeScores).where(eq(biomeScores.userId, id)).orderBy(desc(biomeScores.loggedAt)).limit(1),
    db.select().from(predictions).where(eq(predictions.userId, id)).orderBy(desc(predictions.createdAt)).limit(1),
    db.select().from(preventionScores).where(eq(preventionScores.userId, id)).orderBy(desc(preventionScores.calculatedAt)).limit(1),
    db.select().from(symptomLogs).where(eq(symptomLogs.userId, id)).orderBy(desc(symptomLogs.loggedAt)).limit(8),
  ]);

  return NextResponse.json(
    {
      user: { ...safe, isAdmin: isAdminEmail(u.email) || u.isAdmin, isEnvAdmin: isAdminEmail(u.email) },
      counts, recentCycles,
      latestBiome: latestBiome[0] ?? null,
      latestPrediction: latestPrediction[0] ?? null,
      latestPrevention: latestPrevention[0] ?? null,
      recentSymptoms,
    },
    { status: 200 },
  );
}

// PATCH /api/admin/users/[id] — update tier, admin flag, or suspended state.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const set: Record<string, unknown> = {};
  if ("subscriptionTier" in body) {
    if (!TIERS.includes(body.subscriptionTier)) return NextResponse.json({ error: "Invalid subscriptionTier" }, { status: 400 });
    set.subscriptionTier = body.subscriptionTier;
  }
  if ("isAdmin" in body) set.isAdmin = !!body.isAdmin;
  if ("suspended" in body) {
    if (id === guard.userId) return NextResponse.json({ error: "You can't suspend your own account" }, { status: 400 });
    set.suspended = !!body.suspended;
  }
  if (Object.keys(set).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const [updated] = await db.update(users).set(set).where(eq(users.id, id))
    .returning({ id: users.id, email: users.email, subscriptionTier: users.subscriptionTier, isAdmin: users.isAdmin, suspended: users.suspended });
  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user: { ...updated, isAdmin: isAdminEmail(updated.email) || updated.isAdmin } }, { status: 200 });
}

// DELETE /api/admin/users/[id] — permanently delete a user (cascades all data).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  if (id === guard.userId) return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });

  const [target] = await db.select({ email: users.email }).from(users).where(eq(users.id, id)).limit(1);
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (isAdminEmail(target.email)) return NextResponse.json({ error: "Can't delete an allowlisted admin" }, { status: 400 });

  await db.delete(users).where(eq(users.id, id)); // FK cascade removes all their data
  return NextResponse.json({ ok: true, deleted: target.email }, { status: 200 });
}
