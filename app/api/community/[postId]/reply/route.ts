import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { communityPosts, communityReplies } from "@/lib/db/schema";
import { anonName, cleanBody } from "@/lib/community";

export const runtime = "nodejs";

// POST /api/community/[postId]/reply  Body: { body }
export async function POST(req: Request, { params }: { params: { postId: string } }) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const [post] = await db
    .select({ id: communityPosts.id, hidden: communityPosts.hidden })
    .from(communityPosts)
    .where(eq(communityPosts.id, params.postId))
    .limit(1);
  if (!post || post.hidden) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  let b: { body?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const body = cleanBody(b.body || "");
  if (body.length < 2) {
    return NextResponse.json({ error: "Reply is too short" }, { status: 400 });
  }

  const [reply] = await db
    .insert(communityReplies)
    .values({ postId: params.postId, userId: guard.userId, body, anonName: anonName(guard.userId) })
    .returning();

  return NextResponse.json({ reply }, { status: 201 });
}
