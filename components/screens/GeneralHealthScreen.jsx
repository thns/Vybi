import { C, HEALTH_METRICS, calcAccuracy } from "../vybi-data.js";
import { Card } from "../vybi-ui.jsx";
import { useDashboard, useHealthSummary } from "../useVybiData.ts";

export function GeneralHealthScreen() {
  const { prediction } = useDashboard();
  const { latest } = useHealthSummary();
  const accuracy = prediction?.accuracyPct ?? calcAccuracy(3, true, false, 47);
  // Overlay live monthly averages onto the matching metric cards.
  const metrics = HEALTH_METRICS.map((m) => {
    if (!latest) return m;
    if (m.label === "Sleep" && latest.avg_sleep_hours != null)
      return { ...m, value: `${latest.avg_sleep_hours}h` };
    if (m.label === "Hydration" && latest.avg_hydration_litres != null)
      return { ...m, value: `${latest.avg_hydration_litres}L` };
    if (m.label === "Exercise" && latest.total_exercise_sessions != null)
      return { ...m, value: `${latest.total_exercise_sessions}x/mo` };
    if (m.label === "Stress" && latest.stress_levels?.length)
      return { ...m, value: latest.stress_levels[latest.stress_levels.length - 1] };
    return m;
  });
  return (
    <div style={{padding:"16px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>General Health</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint}}>Lifestyle factors · Biome impact · Wearable sync</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {metrics.map(m=>(
          <Card key={m.label} style={{padding:10,textAlign:"center"}}>
            <div style={{fontSize:18,marginBottom:4}}>{m.icon}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{m.label}</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:14,color:m.color,marginBottom:2}}>{m.value}</div>
            <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:20,background:`${m.color}25`,color:m.color,border:`1px solid ${m.color}50`,fontFamily:"DM Sans,sans-serif"}}>{m.status}</span>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Biome Impact · Lifestyle</div>
        {metrics.map((m,i)=>(
          <div key={m.label} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<metrics.length-1?12:0,paddingBottom:i<metrics.length-1?12:0,borderBottom:i<metrics.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
            <span style={{fontSize:16,color:m.color}}>{m.icon}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:C.pearl}}>{m.label}</span>
                <span style={{fontSize:12,color:m.trend==="↑"?C.mint:m.trend==="↓"?C.coral:C.gold}}>{m.trend}</span>
              </div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.6)",lineHeight:1.6}}>{m.tip}</div>
            </div>
          </div>
        ))}
      </Card>
      <Card style={{borderColor:`${C.gold}40`,background:`rgba(255,215,0,0.06)`}}>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✦ Connect Wearable → Unlock Layer 4</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.7)",lineHeight:1.6,marginBottom:10}}>BBT + HRV data from your wearable activates Layer 4 of the AI engine, pushing prediction accuracy from {accuracy}% to ~90%.</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Apple Health","Oura Ring","Garmin"].map(w=>(
            <button key={w} style={{padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(245,230,255,0.7)",fontFamily:"DM Sans,sans-serif",fontSize:11,cursor:"pointer"}}>{w}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}
