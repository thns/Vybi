import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { communityPosts, communityReplies } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/community/[postId] — a post and its replies.
export async function GET(_req: Request, { params }: { params: { postId: string } }) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const [post] = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, params.postId))
    .limit(1);
  if (!post || post.hidden) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const replies = await db
    .select()
    .from(communityReplies)
    .where(and(eq(communityReplies.postId, params.postId), eq(communityReplies.hidden, false)))
    .orderBy(asc(communityReplies.createdAt));

  return NextResponse.json(
    {
      post: { ...post, mine: post.userId === guard.userId },
      replies: replies.map((r) => ({
        id: r.id,
        body: r.body,
        anonName: r.anonName,
        createdAt: r.createdAt,
        mine: r.userId === guard.userId,
      })),
    },
    { status: 200 },
  );
}
