import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pushSubscriptions,
  birthControl,
  birthControlLogs,
  predictions,
} from "@/lib/db/schema";
import { sendToUser, type PushPayload } from "./server";

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const DAILY_DIGEST_HOUR_UTC = 9;

// Determine and send all reminders due at `now`. Designed to be called hourly.
// Pill reminders fire at the configured hour; cycle reminders fire once in the
// morning digest. Timezone note: pill_time / dates are treated as UTC for now
// (per-user timezones are a documented follow-up).
export async function runDueReminders(now: Date = new Date()) {
  const hour = now.getUTCHours();
  const today = isoDate(now);
  const tomorrow = isoDate(new Date(now.getTime() + 86_400_000));

  // Only users who have at least one push subscription are worth checking.
  const subUsers = await db
    .selectDistinct({ userId: pushSubscriptions.userId })
    .from(pushSubscriptions);

  let sent = 0;
  let notifiedUsers = 0;

  for (const { userId } of subUsers) {
    const payloads: PushPayload[] = [];

    // ── Pill reminder ──
    const [bc] = await db
      .select()
      .from(birthControl)
      .where(and(eq(birthControl.userId, userId), eq(birthControl.active, true)))
      .limit(1);
    if (bc?.method === "pill" && bc.pillTime) {
      const pillHour = parseInt(bc.pillTime.split(":")[0] ?? "", 10);
      if (!Number.isNaN(pillHour) && pillHour === hour) {
        const [todayLog] = await db
          .select()
          .from(birthControlLogs)
          .where(and(eq(birthControlLogs.userId, userId), eq(birthControlLogs.date, today)))
          .limit(1);
        if (!todayLog?.taken) {
          payloads.push({
            title: "Time for your pill 💊",
            body: "Tap to log today's pill in Vybi.",
            url: "/",
            tag: "pill",
          });
        }
      }
    }

    // ── Daily cycle digest ──
    if (hour === DAILY_DIGEST_HOUR_UTC) {
      const [pred] = await db
        .select()
        .from(predictions)
        .where(eq(predictions.userId, userId))
        .orderBy(desc(predictions.createdAt))
        .limit(1);
      if (pred) {
        if (pred.predictedPeriodStart === tomorrow) {
          payloads.push({ title: "Period expected tomorrow 🌹", body: "Your next period is predicted to start tomorrow.", url: "/", tag: "period" });
        } else if (pred.predictedPeriodStart === today) {
          payloads.push({ title: "Period may start today", body: "Vybi predicts your period around today.", url: "/", tag: "period" });
        }
        if (pred.fertileWindowStart === today) {
          payloads.push({ title: "Fertile window opening ✨", body: "Your fertile window is predicted to open today.", url: "/", tag: "fertile" });
        }
        if (pred.predictedOvulation === today) {
          payloads.push({ title: "Ovulation day 🌟", body: "Today is your predicted ovulation day.", url: "/", tag: "ovulation" });
        }
      }
    }

    if (payloads.length) {
      for (const p of payloads) sent += await sendToUser(userId, p);
      notifiedUsers++;
    }
  }

  return { sent, notifiedUsers, checked: subUsers.length, hour };
}
