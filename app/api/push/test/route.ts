import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { pushEnabled, sendToUser } from "@/lib/push/server";

export const runtime = "nodejs";

// POST /api/push/test — send a test notification to the current user's devices.
export async function POST() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;
  if (!pushEnabled) {
    return NextResponse.json({ error: "Push is not configured" }, { status: 503 });
  }

  const sent = await sendToUser(guard.userId, {
    title: "Vybi",
    body: "🌸 Notifications are on. We'll remind you about your cycle, fertile window and pill.",
    url: "/",
    tag: "vybi-test",
  });

  return NextResponse.json({ ok: true, sent }, { status: 200 });
}
