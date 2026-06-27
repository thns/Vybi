import { useState } from "react";
import { useSession } from "next-auth/react";
import { C, BIOMES, MICROBE_REPORT } from "../vybi-data.js";
import { Card, GlowOrb } from "../vybi-ui.jsx";
import { useDashboard } from "../useVybiData.ts";
import { formatShort } from "../../lib/client-api.ts";

export function MicrobeReportScreen() {
  const { data: session } = useSession();
  const isLive = !!session?.user; // signed-in: real data only, no demo fallbacks
  const [selected, setSelected] = useState("vaginal");
  const { biome: liveBiome } = useDashboard();
  const hasReport = selected === "vaginal" && liveBiome?.lCrispatusPct != null;
  const baseReport = MICROBE_REPORT[selected];
  // For the vaginal biome, overlay live sequencing percentages when available.
  const r = selected === "vaginal" && liveBiome?.lCrispatusPct != null
    ? {
        ...baseReport,
        dominance: Math.round(liveBiome.lCrispatusPct),
        secondary: [
          liveBiome.lInersPct != null ? `Lactobacillus iners (${liveBiome.lInersPct}%)` : null,
          liveBiome.gardnerellaPct != null ? `Gardnerella vaginalis (${liveBiome.gardnerellaPct}%)` : null,
        ].filter(Boolean),
      }
    : baseReport;
  const biome = BIOMES.find(b=>b.id===selected);
  const reportDate = selected === "vaginal" ? formatShort(liveBiome?.testDate ?? null) : null;
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl,marginBottom:4}}>Microbe Report</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint,marginBottom:12}}>{reportDate?`${reportDate} · ${liveBiome?.testKitId??"Test Kit"} · Powers Layer 3`:(isLive?"No biome test on file yet":"May 2026 · Test Kit #3 · Powers Layer 3")}</div>
        <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {BIOMES.map(b=>(
            <button key={b.id} onClick={()=>setSelected(b.id)} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${selected===b.id?b.color:"rgba(var(--surface-rgb),0.1)"}`,background:selected===b.id?`${b.color}20`:"transparent",color:selected===b.id?b.color:"rgba(var(--ink-rgb),0.5)",fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}>
              {b.icon} {b.name.split(" ")[0]}
              {!isLive&&MICROBE_REPORT[b.id].alert&&<span style={{width:6,height:6,borderRadius:"50%",background:C.amber}}/>}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 28px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={biome?.color||C.mint} size={180} opacity={0.1} x={100} y={0}/>

        {isLive && !hasReport ? (
          <Card style={{textAlign:"center"}}>
            <div style={{fontSize:38}}>🧬</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl,marginTop:6}}>No {biome?.name.split(" ")[0].toLowerCase()} test yet</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.6)",lineHeight:1.6,marginTop:4}}>{selected==="vaginal"?"Upload a vaginal biome test kit to see your full sequencing results — and activate Layer 3 of the AI engine.":"Sequencing for this biome isn't available yet. Vaginal biome test kits are supported today."}</div>
          </Card>
        ) : (<>

        {r.alert&&<Card style={{borderColor:`${C.amber}50`,background:`rgba(255,140,66,0.08)`}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:18}}>⚠️</span>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.amber,lineHeight:1.6}}>Action recommended · This data is powering Layer 3 predictions</div>
          </div>
        </Card>}

        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Dominant Microorganism</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${biome?.color||C.mint}20`,border:`1px solid ${biome?.color||C.mint}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🦠</div>
            <div>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl,fontStyle:"italic"}}>{r.dominant}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.5)"}}>Dominance: {r.dominance}%</div>
            </div>
          </div>
          <div style={{height:10,borderRadius:5,background:"rgba(var(--surface-rgb),0.06)",overflow:"hidden",marginBottom:10}}>
            <div style={{width:`${r.dominance}%`,height:"100%",borderRadius:5,background:`linear-gradient(90deg,${biome?.color||C.mint},${biome?.color||C.mint}80)`}}/>
          </div>
          {r.secondary.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<r.secondary.length-1?"1px solid rgba(var(--surface-rgb),0.04)":"none"}}>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.55)",fontStyle:"italic"}}>{s.split(" (")[0]}</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(var(--ink-rgb),0.35)"}}>{s.match(/\(.*\)/)?.[0]||""}</span>
            </div>
          ))}
        </Card>

        {r.trend&&<Card style={{borderColor:`${C.amber}40`}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.amber,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Trend → Layer 3 input</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.75)"}}>{r.trend}</div>
        </Card>}

        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✦ Vybi Interpretation</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,color:"rgba(var(--ink-rgb),0.8)",lineHeight:1.75}}>{r.interpretation}</div>
        </Card>
        </>)}
      </div>
    </div>
  );
}
