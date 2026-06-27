import { useState } from "react";
import { C } from "../vybi-data.js";
import { Card, GlowOrb } from "../vybi-ui.jsx";
import { ARTICLES, getDailyTip } from "../content-data.js";

export function ContentScreen() {
  const [openId, setOpenId] = useState(null);
  const article = ARTICLES.find((a) => a.id === openId);

  // Group articles by category.
  const cats = [...new Set(ARTICLES.map((a) => a.category))];

  if (article) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 8px" }}>
          <button onClick={() => setOpenId(null)} style={{ background: "none", border: "none", color: C.lavender, fontFamily: "DM Sans,sans-serif", fontSize: 13, cursor: "pointer", padding: 0 }}>‹ Library</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 20px" }}>
          <GlowOrb color={article.color} size={220} opacity={0.13} x={70} y={-20} />
          <div style={{ fontSize: 40, marginBottom: 8 }}>{article.icon}</div>
          <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: article.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{article.category} · {article.readMins} min read</div>
          <h1 style={{ fontFamily: "Cormorant Garamond,Georgia,serif", fontSize: 26, color: C.pearl, lineHeight: 1.2, margin: "6px 0 14px" }}>{article.title}</h1>
          {article.body.map((p, i) => (
            <p key={i} style={{ fontFamily: "DM Sans,sans-serif", fontSize: 14, color: "rgba(var(--ink-rgb),0.8)", lineHeight: 1.8, marginBottom: 14 }}>{p}</p>
          ))}
          <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: "rgba(var(--ink-rgb),0.35)", marginTop: 12, lineHeight: 1.6 }}>Educational content — not a substitute for medical advice.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontFamily: "Cormorant Garamond,Georgia,serif", fontSize: 26, color: C.pearl }}>Learn</div>
        <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: C.mint, marginBottom: 8 }}>Cycle · Biome · Fertility · Prevention</div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <GlowOrb color={C.fuchsia} size={200} opacity={0.1} x={80} y={-20} />

        <Card style={{ borderColor: `${C.gold}40`, background: `rgba(255,215,0,0.06)` }}>
          <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>✦ Insight of the day</div>
          <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 13, color: "rgba(var(--ink-rgb),0.85)", lineHeight: 1.7 }}>{getDailyTip()}</div>
        </Card>

        {cats.map((cat) => (
          <div key={cat}>
            <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: "rgba(var(--ink-rgb),0.45)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "4px 0 8px" }}>{cat}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ARTICLES.filter((a) => a.category === cat).map((a) => (
                <Card key={a.id} style={{ cursor: "pointer", padding: 14 }} onClick={() => setOpenId(a.id)}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 22 }}>{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Cormorant Garamond,Georgia,serif", fontSize: 17, color: C.pearl, lineHeight: 1.2 }}>{a.title}</div>
                      <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: "rgba(var(--ink-rgb),0.55)", lineHeight: 1.5, marginTop: 4 }}>{a.excerpt}</div>
                      <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 9, color: a.color, marginTop: 6 }}>{a.readMins} min read →</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
