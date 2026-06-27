import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { C } from "../vybi-data.js";
import { Card, GlowOrb } from "../vybi-ui.jsx";
import { api } from "../../lib/client-api.ts";

export function PartnerScreen() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState(null);
  const { data: session } = useSession();

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = token ? `${origin}/shared/${token}` : "";

  useEffect(() => { api.partnerShare().then((r) => { setToken(r?.token ?? null); setLoading(false); }); }, []);

  const create = async () => { setBusy(true); setMsg(null); const r = await api.createPartnerShare(); setBusy(false); if (r?.token) setToken(r.token); else setMsg(session?.user ? "Couldn't create link — please try again." : "Sign in to create a partner share link."); };
  const revoke = async () => { setBusy(true); await api.revokePartnerShare(); setBusy(false); setToken(null); };
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {} };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: "My Vybi cycle", url: link }); } catch {} }
    else copy();
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontFamily: "Cormorant Garamond,Georgia,serif", fontSize: 26, color: C.pearl }}>Partner Sharing</div>
        <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: C.mint, marginBottom: 8 }}>Read-only cycle view · No health details</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <GlowOrb color={C.fuchsia} size={220} opacity={0.12} x={70} y={-20} />

        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 44 }}>💞</div>
          <div style={{ fontFamily: "Cormorant Garamond,Georgia,serif", fontSize: 22, color: C.pearl, marginTop: 6 }}>Share your cycle with a partner</div>
          <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 12, color: "rgba(245,230,255,0.6)", lineHeight: 1.6, marginTop: 4 }}>They'll see your current phase, days to next period and ovulation — nothing else. Revoke anytime.</div>
        </Card>

        {loading ? (
          <div style={{ color: "rgba(245,230,255,0.4)", fontFamily: "DM Sans,sans-serif", fontSize: 12 }}>Loading…</div>
        ) : token ? (
          <>
            <Card style={{ borderColor: `${C.mint}40` }}>
              <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: C.mint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Your share link · Active</div>
              <div style={{ background: "rgba(26,10,46,0.6)", border: "1px solid rgba(195,155,211,0.25)", borderRadius: 10, padding: "10px 12px", fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "rgba(245,230,255,0.8)", wordBreak: "break-all", marginBottom: 10 }}>{link}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={share} style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.fuchsia},${C.amethyst})`, color: "#fff", fontFamily: "DM Sans,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Share</button>
                <button onClick={copy} style={{ flex: 1, padding: 11, borderRadius: 10, border: "1px solid rgba(195,155,211,0.3)", background: "transparent", color: C.lavender, fontFamily: "DM Sans,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{copied ? "Copied ✓" : "Copy link"}</button>
              </div>
            </Card>
            <button onClick={revoke} disabled={busy} style={{ background: "none", border: "1px solid rgba(255,120,120,0.3)", borderRadius: 10, padding: "11px", color: "#ff9d9d", fontFamily: "DM Sans,sans-serif", fontSize: 13, cursor: "pointer" }}>Revoke link</button>
          </>
        ) : (
          <>
            <button onClick={create} disabled={busy} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.fuchsia},${C.amethyst})`, boxShadow: `0 8px 24px rgba(233,30,140,0.4)`, color: "#fff", fontFamily: "DM Sans,sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: busy ? 0.6 : 1 }}>{busy ? "Creating…" : "Create share link"}</button>
            {msg && <div style={{ marginTop: 10, fontFamily: "DM Sans,sans-serif", fontSize: 12, color: C.gold, textAlign: "center", lineHeight: 1.5 }}>{msg}</div>}
          </>
        )}
      </div>
    </div>
  );
}
