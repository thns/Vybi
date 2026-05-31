import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { gatherUserData } from "@/lib/export/gather";
import { ReportActions } from "@/components/report/ReportActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fmt = (iso: string | null | undefined) =>
  iso ? new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—";

const TRI = { 1: "First", 2: "Second", 3: "Third" } as const;

export default async function ReportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const d = await gatherUserData(session.user.id);
  const p = d.latestPrediction;
  const b = d.biomeScores[0];
  const age = d.profile?.birthYear ? new Date().getUTCFullYear() - d.profile.birthYear : null;
  const goalLabel: Record<string, string> = { track: "Cycle tracking", conceive: "Trying to conceive", avoid: "Avoiding pregnancy" };

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #eee" }}>
      <span style={{ color: "#666" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#222" }}>{value}</span>
    </div>
  );
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9b59b6", margin: "22px 0 8px" }}>{children}</h2>
  );

  return (
    <div style={{ background: "#f4f1f7", minHeight: "100vh", padding: 24, fontFamily: "system-ui, -apple-system, sans-serif", color: "#222" }}>
      <style>{`@media print { .no-print{display:none!important;} body{background:#fff;} .sheet{box-shadow:none!important;margin:0!important;} @page{margin:14mm;} }`}</style>
      <div className="sheet" style={{ maxWidth: 720, margin: "0 auto", background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
        <ReportActions />

        <div style={{ borderBottom: "2px solid #9b59b6", paddingBottom: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 30, fontWeight: 800, background: "linear-gradient(135deg,#e91e8c,#9b59b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VYBI</div>
          <div style={{ fontSize: 13, color: "#777" }}>Health Summary · for your clinician</div>
          <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>Generated {new Date(d.exportedAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC</div>
        </div>

        <H>Profile</H>
        <Row label="Name" value={d.profile?.name || "—"} />
        <Row label="Email" value={d.profile?.email || "—"} />
        {age != null && <Row label="Age" value={`${age}`} />}
        <Row label="Goal" value={d.profile?.goal ? goalLabel[d.profile.goal] ?? d.profile.goal : "—"} />
        <Row label="Plan" value={`Vybi ${d.profile?.subscriptionTier ?? "free"}`} />

        <H>Cycle</H>
        <Row label="Cycles logged" value={d.cycleStats.cyclesLogged} />
        <Row label="Average cycle length" value={`${d.cycleStats.averageLength} days`} />
        <Row label="Cycle-length variability (SD)" value={`±${d.cycleStats.variance} days`} />
        {p && (
          <>
            <Row label="Predicted next period" value={fmt(p.predictedPeriodStart)} />
            <Row label="Predicted ovulation" value={fmt(p.predictedOvulation)} />
            <Row label="Fertile window" value={`${fmt(p.fertileWindowStart)} – ${fmt(p.fertileWindowEnd)}`} />
            <Row label="Prediction confidence / accuracy" value={`${p.confidencePct}% / ${p.accuracyPct}%`} />
            <Row label="Active AI layers" value={(p.layersUsed ?? []).join(", ") || "—"} />
          </>
        )}

        {d.pregnancy && (
          <>
            <H>Pregnancy</H>
            <Row label="Due date" value={fmt(d.pregnancy.dueDate)} />
          </>
        )}

        {d.birthControl && (
          <>
            <H>Contraception</H>
            <Row label="Method" value={d.birthControl.method} />
            {d.birthControl.pillTime && <Row label="Pill reminder" value={d.birthControl.pillTime} />}
          </>
        )}

        {b && (
          <>
            <H>Vaginal Biome (latest test {fmt(b.testDate)})</H>
            <Row label="L. crispatus" value={b.lCrispatusPct != null ? `${b.lCrispatusPct}%` : "—"} />
            <Row label="L. iners" value={b.lInersPct != null ? `${b.lInersPct}%` : "—"} />
            <Row label="Gardnerella" value={b.gardnerellaPct != null ? `${b.gardnerellaPct}%` : "—"} />
            <Row label="pH" value={b.phValue != null ? b.phValue : "—"} />
            <Row label="Diversity index" value={b.diversityIndex != null ? b.diversityIndex : "—"} />
            <Row label="CST type" value={b.cstType || "—"} />
          </>
        )}

        <H>Preventive Risk Scores (0–100, higher = more risk)</H>
        <Row label="Bacterial vaginosis" value={d.prevention.bv_risk_score} />
        <Row label="UTI" value={d.prevention.uti_risk_score} />
        <Row label="Gut dysbiosis" value={d.prevention.gut_dysbiosis_score} />
        <Row label="Skin imbalance" value={d.prevention.skin_imbalance_score} />
        <Row label="PCOS indicators" value={d.prevention.pcos_indicator_score} />
        <Row label="Overall protection (higher = better)" value={d.prevention.overall_protection_score} />

        {d.symptomLogs.length > 0 && (
          <>
            <H>Recent Symptoms</H>
            {d.symptomLogs.slice(0, 12).map((s, i) => (
              <Row key={i} label={fmt(String(s.loggedAt))} value={(s.symptoms as string[]).join(", ") || "—"} />
            ))}
          </>
        )}

        {d.wearableReadings.length > 0 && (
          <>
            <H>Recent Wearable Readings</H>
            {d.wearableReadings.slice(0, 10).map((w, i) => (
              <Row key={i} label={fmt(w.date)} value={`BBT ${w.bbt ?? "—"}°C · HR ${w.restingHr ?? "—"} · HRV ${w.hrv ?? "—"}`} />
            ))}
          </>
        )}

        <div style={{ marginTop: 28, paddingTop: 12, borderTop: "1px solid #eee", fontSize: 11, color: "#999", lineHeight: 1.6 }}>
          Generated by Vybi (vybi.bio). Predictions and risk scores are algorithmic estimates for informational use and are <strong>not a medical diagnosis</strong>. Please interpret alongside clinical judgement.
        </div>
      </div>
    </div>
  );
}
