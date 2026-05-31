import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { communityPosts, communityReplies } from "@/lib/db/schema";
import { HIDE_THRESHOLD } from "@/lib/community";

export const runtime = "nodejs";

// POST /api/community/report  Body: { postId?: string, replyId?: string }
// Increments the report count; auto-hides at the threshold.
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: { postId?: string; replyId?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (b.postId) {
    const [row] = await db
      .update(communityPosts)
      .set({ reportCount: sql`${communityPosts.reportCount} + 1` })
      .where(eq(communityPosts.id, b.postId))
      .returning({ reportCount: communityPosts.reportCount });
    if (row && row.reportCount >= HIDE_THRESHOLD) {
      await db.update(communityPosts).set({ hidden: true }).where(eq(communityPosts.id, b.postId));
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (b.replyId) {
    const [row] = await db
      .update(communityReplies)
      .set({ reportCount: sql`${communityReplies.reportCount} + 1` })
      .where(eq(communityReplies.id, b.replyId))
      .returning({ reportCount: communityReplies.reportCount });
    if (row && row.reportCount >= HIDE_THRESHOLD) {
      await db.update(communityReplies).set({ hidden: true }).where(eq(communityReplies.id, b.replyId));
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ error: "postId or replyId required" }, { status: 400 });
}
