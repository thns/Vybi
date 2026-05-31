import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, predictions, cycleLogs } from "@/lib/db/schema";
import { daysUntil, formatShort, cycleDayFrom, phaseForDay } from "@/lib/client-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHASE = {
  menstrual: { label: "Menstrual phase", emoji: "🌹", note: "On their period — extra rest and warmth help." },
  follicular: { label: "Follicular phase", emoji: "🌱", note: "Rising energy and mood — a great time for plans together." },
  ovulation: { label: "Ovulation", emoji: "✨", note: "Peak fertility window." },
  luteal: { label: "Luteal phase", emoji: "🌙", note: "Winding down — comfort, patience and good food are appreciated." },
};

export default async function SharedPage({ params }: { params: { token: string } }) {
  const [u] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.partnerShareToken, params.token))
    .limit(1);

  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#1a0a2e 0%,#2d1155 100%)", fontFamily: "DM Sans,sans-serif", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <div style={{ width: 360, maxWidth: "100%" }}>{children}</div>
    </div>
  );

  if (!u) {
    return (
      <Shell>
        <div style={{ background: "rgba(45,17,85,0.55)", border: "1px solid rgba(195,155,211,0.2)", borderRadius: 20, padding: 28, textAlign: "center", color: "#f5e6ff" }}>
          <div style={{ fontSize: 40 }}>🔗</div>
          <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 22, marginTop: 8 }}>Link not found</div>
          <div style={{ fontSize: 13, color: "rgba(245,230,255,0.5)", marginTop: 6 }}>This share link is invalid or has been revoked.</div>
        </div>
      </Shell>
    );
  }

  const [pred] = await db.select().from(predictions).where(eq(predictions.userId, u.id)).orderBy(desc(predictions.createdAt)).limit(1);
  const [cycle] = await db.select().from(cycleLogs).where(eq(cycleLogs.userId, u.id)).orderBy(desc(cycleLogs.periodStartDate)).limit(1);

  const day = cycleDayFrom(cycle?.periodStartDate ?? null);
  const phaseKey = phaseForDay(day, cycle?.cycleLength ?? 28);
  const phase = PHASE[phaseKey as keyof typeof PHASE] ?? PHASE.follicular;
  const periodDays = daysUntil(pred?.predictedPeriodStart ?? null);
  const firstName = (u.name || "Your partner").split(" ")[0];

  const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
    <div style={{ flex: 1, padding: "10px 8px", borderRadius: 12, background: `${color}12`, border: `1px solid ${color}30`, textAlign: "center" }}>
      <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 18, color }}>{value}</div>
      <div style={{ fontSize: 9, color: "rgba(245,230,255,0.5)", marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <Shell>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 40, background: "linear-gradient(135deg,#e91e8c,#9b59b6,#c39bd3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VYBI</div>
        <div style={{ fontSize: 10, color: "#c39bd3", letterSpacing: "0.15em", textTransform: "uppercase" }}>Partner View · Read-only</div>
      </div>

      <div style={{ background: "rgba(45,17,85,0.6)", border: "1px solid rgba(195,155,211,0.2)", borderRadius: 22, padding: 26, color: "#f5e6ff", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>{phase.emoji}</div>
        <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 24, marginTop: 6 }}>{firstName} is in their</div>
        <div style={{ fontFamily: "Cormorant Garamond,serif", fontSize: 22, color: "#ff6eb4" }}>{phase.label}</div>
        <div style={{ fontSize: 13, color: "rgba(245,230,255,0.7)", lineHeight: 1.6, margin: "10px 0 16px" }}>{phase.note}</div>

        <div style={{ display: "flex", gap: 8 }}>
          <Stat label="Next period" value={periodDays != null && periodDays >= 0 ? `${periodDays}d` : "—"} color="#ff9dc6" />
          <Stat label="Cycle day" value={day != null && day >= 1 ? `${day}` : "—"} color="#c39bd3" />
          <Stat label="Ovulation" value={pred?.predictedOvulation ? formatShort(pred.predictedOvulation) ?? "—" : "—"} color="#ffd700" />
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "rgba(245,230,255,0.4)", marginTop: 16, lineHeight: 1.6 }}>
        Shared with you via Vybi. Only cycle phase & predictions are shown — no personal health details.
      </div>
    </Shell>
  );
}
