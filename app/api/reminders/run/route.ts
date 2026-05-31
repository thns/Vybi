import { NextResponse } from "next/server";
import { runDueReminders } from "@/lib/push/reminders";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/reminders/run — invoked by the Netlify scheduled function (hourly).
// Guarded by the CRON_SECRET shared secret.
export async function POST(req: Request) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runDueReminders(new Date());
  return NextResponse.json(result, { status: 200 });
}
