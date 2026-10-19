import { NextResponse } from "next/server";
import { eq, or, gt, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { communityPosts, communityReplies, users } from "@/lib/db/schema";

export const runtime = "nodejs";

// GET /api/admin/community — posts & replies that are reported or hidden.
export async function GET() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const posts = await db
    .select({
      id: communityPosts.id, room: communityPosts.room, body: communityPosts.body,
      anonName: communityPosts.anonName, reportCount: communityPosts.reportCount,
      hidden: communityPosts.hidden, createdAt: communityPosts.createdAt, authorEmail: users.email,
    })
    .from(communityPosts)
    .leftJoin(users, eq(users.id, communityPosts.userId))
    .where(or(gt(communityPosts.reportCount, 0), eq(communityPosts.hidden, true)))
    .orderBy(desc(communityPosts.reportCount), desc(communityPosts.createdAt))
    .limit(200);

  const replies = await db
    .select({
      id: communityReplies.id, postId: communityReplies.postId, body: communityReplies.body,
      anonName: communityReplies.anonName, reportCount: communityReplies.reportCount,
      hidden: communityReplies.hidden, createdAt: communityReplies.createdAt, authorEmail: users.email,
    })
    .from(communityReplies)
    .leftJoin(users, eq(users.id, communityReplies.userId))
    .where(or(gt(communityReplies.reportCount, 0), eq(communityReplies.hidden, true)))
    .orderBy(desc(communityReplies.reportCount), desc(communityReplies.createdAt))
    .limit(200);

  return NextResponse.json(
    { posts, replies, counts: { flaggedPosts: posts.length, flaggedReplies: replies.length } },
    { status: 200 },
  );
}

// POST /api/admin/community  Body: { kind:"post"|"reply", id, action }
// action ∈ hide | unhide | clearReports | delete
export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { kind, id, action } = await req.json().catch(() => ({}));
  if (!["post", "reply"].includes(kind) || !id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const tbl = kind === "post" ? communityPosts : communityReplies;

  if (action === "delete") {
    await db.delete(tbl).where(eq(tbl.id, id)); // post delete cascades its replies
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  const set =
    action === "hide" ? { hidden: true }
    : action === "unhide" ? { hidden: false }
    : action === "clearReports" ? { reportCount: 0, hidden: false }
    : null;
  if (!set) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const [row] = await db.update(tbl).set(set).where(eq(tbl.id, id)).returning({ id: tbl.id });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true }, { status: 200 });
}
