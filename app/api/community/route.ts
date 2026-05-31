import { NextResponse } from "next/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { requireUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { communityPosts, communityReplies } from "@/lib/db/schema";
import { ROOM_IDS, anonName, cleanBody } from "@/lib/community";

export const runtime = "nodejs";

// GET /api/community?room=cycle — posts in a room, with reply counts.
export async function GET(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const room = new URL(req.url).searchParams.get("room") || "cycle";
  if (!ROOM_IDS.includes(room)) {
    return NextResponse.json({ error: "Unknown room" }, { status: 400 });
  }

  const posts = await db
    .select()
    .from(communityPosts)
    .where(and(eq(communityPosts.room, room), eq(communityPosts.hidden, false)))
    .orderBy(desc(communityPosts.createdAt))
    .limit(50);

  // Reply counts per post.
  const ids = posts.map((p) => p.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const replies = await db
      .select({ postId: communityReplies.postId })
      .from(communityReplies)
      .where(and(inArray(communityReplies.postId, ids), eq(communityReplies.hidden, false)));
    for (const r of replies) counts.set(r.postId, (counts.get(r.postId) ?? 0) + 1);
  }

  return NextResponse.json(
    {
      posts: posts.map((p) => ({
        id: p.id,
        room: p.room,
        body: p.body,
        anonName: p.anonName,
        createdAt: p.createdAt,
        replyCount: counts.get(p.id) ?? 0,
        mine: p.userId === guard.userId,
      })),
    },
    { status: 200 },
  );
}

// POST /api/community  Body: { room, body }
export async function POST(req: Request) {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  let b: { room?: string; body?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!b.room || !ROOM_IDS.includes(b.room)) {
    return NextResponse.json({ error: "Unknown room" }, { status: 400 });
  }
  const body = cleanBody(b.body || "");
  if (body.length < 2) {
    return NextResponse.json({ error: "Message is too short" }, { status: 400 });
  }

  const [post] = await db
    .insert(communityPosts)
    .values({ userId: guard.userId, room: b.room, body, anonName: anonName(guard.userId) })
    .returning();

  return NextResponse.json({ post }, { status: 201 });
}
