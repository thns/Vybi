import { useState, useEffect } from "react";
import { C } from "../vybi-data.js";
import { Card, GlowOrb } from "../vybi-ui.jsx";
import { api, formatShort } from "../../lib/client-api.ts";
import { useDashboard } from "../useVybiData.ts";

export function WearableScreen() {
  const [readings, setReadings] = useState([]);
  const [reload, setReload] = useState(0);
  const { prediction } = useDashboard(reload);
  const layer4 = prediction?.layersUsed?.includes("Wearable Fusion");

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bbt, setBbt] = useState("");
  const [hr, setHr] = useState("");
  const [hrv, setHrv] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { api.wearable().then((r) => setReadings(r?.readings ?? [])); }, [reload]);

  const log = async () => {
    if (!bbt && !hr && !hrv) { setMsg("Enter at least one reading"); return; }
    setBusy(true); setMsg(null);
    const res = await api.logWearable({
      date,
      bbt: bbt ? Number(bbt) : undefined,
      resting_hr: hr ? Number(hr) : undefined,
      hrv: hrv ? Number(hrv) : undefined,
    });
    setBusy(false);
    if (res) { setMsg("Logged · Layer 4 recalculated"); setBbt(""); setHr(""); setHrv(""); setReload((r) => r + 1); }
    else setMsg("Sign in to sync wearable data");
  };

  const field = (label, val, set, ph, step) => (
    <div style={{ flex: 1 }}>
      <label style={{ display: "block", fontFamily: "DM Sans,sans-serif", fontSize: 10, color: "rgba(var(--ink-rgb),0.6)", marginBottom: 5 }}>{label}</label>
      <input type="number" step={step} inputMode="decimal" value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        style={{ width: "100%", background: "rgba(var(--deep-rgb),0.6)", border: "1px solid rgba(var(--lav-rgb),0.3)", borderRadius: 10, padding: "9px 10px", color: C.pearl, fontFamily: "DM Sans,sans-serif", fontSize: 14, outline: "none", colorScheme:"var(--scheme)" }} />
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontFamily: "Cormorant Garamond,Georgia,serif", fontSize: 26, color: C.pearl }}>Wearable Data</div>
        <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: C.aqua, marginBottom: 8 }}>BBT · Resting HR · HRV → Layer 4</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <GlowOrb color={C.aqua} size={220} opacity={0.12} x={70} y={-20} />

        <Card style={{ borderColor: layer4 ? `${C.mint}40` : `${C.aqua}30`, background: layer4 ? `rgba(184,240,230,0.06)` : "rgba(var(--velvet-rgb),0.55)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 30 }}>{layer4 ? "✅" : "⌚"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: layer4 ? C.mint : C.aqua, textTransform: "uppercase", letterSpacing: "0.08em" }}>Layer 4 · Wearable Fusion</div>
              <div style={{ fontFamily: "Cormorant Garamond,Georgia,serif", fontSize: 18, color: C.pearl }}>{layer4 ? "Active — boosting your accuracy" : "Log readings to activate"}</div>
              <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "rgba(var(--ink-rgb),0.5)" }}>BBT rises ~0.3°C after ovulation. HRV dips in the luteal phase.</div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: C.aqua, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Log today's readings</div>
          <label style={{ display: "block", fontFamily: "DM Sans,sans-serif", fontSize: 10, color: "rgba(var(--ink-rgb),0.6)", marginBottom: 5 }}>Date</label>
          <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)}
            style={{ width: "100%", background: "rgba(var(--deep-rgb),0.6)", border: "1px solid rgba(var(--lav-rgb),0.3)", borderRadius: 10, padding: "9px 12px", color: C.pearl, fontFamily: "DM Sans,sans-serif", fontSize: 13, outline: "none", colorScheme:"var(--scheme)", marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {field("BBT (°C)", bbt, setBbt, "36.6", "0.01")}
            {field("Resting HR", hr, setHr, "62", "1")}
            {field("HRV (ms)", hrv, setHrv, "45", "1")}
          </div>
          <button onClick={log} disabled={busy} style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.aqua},${C.amethyst})`, color: "#1a0a2e", fontFamily: "DM Sans,sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Log readings"}</button>
          {msg && <div style={{ marginTop: 8, fontFamily: "DM Sans,sans-serif", fontSize: 10, color: C.mint, textAlign: "center" }}>{msg}</div>}
          <div style={{ marginTop: 8, fontFamily: "DM Sans,sans-serif", fontSize: 10, color: "rgba(var(--ink-rgb),0.35)", textAlign: "center" }}>Apple Health / Oura / Garmin auto-sync needs the native app — manual entry works today.</div>
        </Card>

        {readings.length > 0 && (
          <Card>
            <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: C.mint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Recent readings</div>
            {readings.slice(0, 10).map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < Math.min(readings.length, 10) - 1 ? "1px solid rgba(var(--surface-rgb),0.05)" : "none" }}>
                <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 12, color: C.pearl }}>{formatShort(r.date)}</span>
                <div style={{ display: "flex", gap: 12, fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "rgba(var(--ink-rgb),0.6)" }}>
                  <span>{r.bbt != null ? `${r.bbt}°C` : "—"}</span>
                  <span>{r.restingHr != null ? `${r.restingHr} bpm` : "—"}</span>
                  <span>{r.hrv != null ? `${r.hrv} ms` : "—"}</span>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
