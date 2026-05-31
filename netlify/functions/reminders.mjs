// Netlify Scheduled Function — fires hourly and asks the app to send any due
// cycle / pill / fertile reminders. The heavy lifting lives in the Next.js
// /api/reminders/run route (so the logic is shared and testable).
export default async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  try {
    const res = await fetch(`${base}/api/reminders/run`, {
      method: "POST",
      headers: { "x-cron-secret": process.env.CRON_SECRET || "" },
    });
    const body = await res.text();
    return new Response(body, { status: res.status });
  } catch (err) {
    return new Response("reminder run failed: " + (err && err.message), { status: 500 });
  }
};

export const config = { schedule: "@hourly" };
