import { C, BIOMES, calcAccuracy, phaseColor, phaseLabel } from "../vybi-data.js";
import { Card, GlowOrb, BiomeRing } from "../vybi-ui.jsx";
import { useDashboard, useCycles } from "../useVybiData.ts";
import { daysUntil, cycleDayFrom, phaseForDay } from "../../lib/client-api.ts";
import { getDailyTip } from "../content-data.js";
import { useSession } from "next-auth/react";

export function HomeScreen({ setScreen }) {
  const { data: session } = useSession();
  const isLive = !!session?.user; // signed-in: real data only, no demo fallbacks
  const { prediction, biome, prevention } = useDashboard();
  const { cycles } = useCycles();

  // Current cycle day + phase from the user's most recent logged period.
  const latestCycle = cycles[0] ?? null;
  const cycleLen = latestCycle?.cycleLength ?? 28;
  const realDay = cycleDayFrom(latestCycle?.periodStartDate ?? null);
  const hasCycleData = realDay != null && realDay >= 1;
  const cycleDay = hasCycleData ? ((realDay - 1) % cycleLen) + 1 : null;
  const phase = phaseForDay(cycleDay, cycleLen);

  // Biome rings: real scores when a test kit is on file; demo scores only for
  // preview/guest. Signed-in with no biome data → empty rings (—).
  const liveScores = biome
    ? { vaginal: biome.vaginalScore, gut: biome.gutScore, skin: biome.skinScore, oral: biome.oralScore }
    : {};
  const biomes = BIOMES.map((b) => ({ ...b, score: liveScores[b.id] ?? (isLive ? null : b.score) }));
  const validScores = biomes.map((b) => b.score).filter((s) => s != null);
  const overall = validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : null;
  const hasBiome = !!biome;

  const accuracy = prediction?.accuracyPct ?? (isLive ? null : calcAccuracy(3, true, false, 47));
  const layersActive = prediction?.layersUsed?.length ?? (isLive ? 0 : 3);
  const periodDays = daysUntil(prediction?.predictedPeriodStart ?? null);
  const ovulationDays = daysUntil(prediction?.predictedOvulation ?? null);
  const confidence = prediction?.confidencePct ?? (isLive ? null : 82);
  const bvRisk = prevention?.bv_risk_score ?? null;

  const periodText = periodDays != null && periodDays >= 0 ? `Period in ${periodDays} days` : "Log a period to predict";
  return (
    <div style={{padding:"0 16px 28px",display:"flex",flexDirection:"column",gap:12,overflowY:"auto",height:"100%"}}>
      <GlowOrb color={C.fuchsia} size={200} opacity={0.15} x={100} y={-30}/>
      <div style={{paddingTop:16}}>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"var(--ey-mint)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{hasCycleData?`Day ${cycleDay} · ${phaseLabel(phase)} Phase`:"Log a period to begin"}</div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:28,color:C.pearl}}>Your Vybi Today</div>
      </div>

      <Card style={{background:`var(--card-hero)`}}>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:phaseColor(phase),boxShadow:`0 0 8px ${phaseColor(phase)}`}}/>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:phaseColor(phase),fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{hasCycleData?`${phaseLabel(phase)} Phase`:"No cycle logged"}</span>
            </div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl,marginBottom:2}}>{periodText}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.55)"}}>AI confidence: <span style={{color:"var(--ey-mint)",fontWeight:600}}>{accuracy!=null?`${accuracy}%`:"—"}</span> · {layersActive} layer{layersActive===1?"":"s"} active</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:32,color:"var(--ey-gold)"}}>{overall!=null?overall:"—"}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:8,color:"var(--ey-mint)",letterSpacing:"0.1em"}}>VYBI SCORE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[
            {label: periodDays != null && periodDays >= 0 ? `Period in ${periodDays}d` : "Period —", color:"var(--ey-rose)"},
            {label: ovulationDays != null && ovulationDays >= 0 ? `Ovulation in ${ovulationDays}d` : "Ovulation —", color:"var(--ey-gold)"},
            {label: confidence!=null?`AI: ${confidence}% confident`:"AI: —", color:"var(--ey-mint)"},
          ].map(item=>(
            <div key={item.label} style={{flex:1,padding:"7px 8px",borderRadius:10,background:"var(--card-bg)",border:"1px solid var(--card-border)",boxShadow:"var(--card-shadow)",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:item.color,flexShrink:0}}/>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(var(--ink-rgb),0.85)",fontWeight:700}}>{item.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-mint)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>All Biomes</div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          {biomes.map(b=><BiomeRing key={b.id} biome={b} size={68}/>)}
        </div>
      </Card>

      <Card style={{borderColor:`${C.purple}40`,background:`rgba(155,89,182,0.07)`,cursor:"pointer"}} onClick={()=>setScreen("AI Engine")}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${C.purple}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>◉</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-purple)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>AI Accuracy: {accuracy!=null?`${accuracy}%`:"—"}</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:17,color:C.pearl,marginBottom:4}}>Connect wearable → unlock 90%</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.6)"}}>{layersActive} of 5 algorithm layers active. View your AI engine →</div>
          </div>
        </div>
      </Card>

      <Card style={{borderColor:`${C.amber}50`,background:`rgba(255,140,66,0.07)`,cursor:"pointer"}} onClick={()=>setScreen("Prevention")}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${C.amber}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>△</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-amber)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>Prevention{bvRisk!=null?` · BV ${bvRisk}/100`:""}</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:17,color:C.pearl,marginBottom:4}}>{bvRisk!=null?(bvRisk>=40?"BV risk elevated this week":"BV risk currently low"):(isLive?"See your prevention scores":"BV risk elevated this week")}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.6)"}}>{bvRisk!=null?"Based on your cycle, symptoms & biome signals. View details →":(isLive?"Log cycles, symptoms or a biome test to assess your risk →":"L. crispatus -18% post-period. Biome layer flagged. Take action →")}</div>
          </div>
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {label:"Pregnancy",icon:"🤰",color:"var(--ey-fuchsia)",screen:"Pregnancy"},
          {label:"Birth Control",icon:"💊",color:"var(--ey-purple)",screen:"Birth Control"},
          {label:"Wearable",icon:"⌚",color:"var(--ey-mint)",screen:"Wearable"},
          {label:"Learn",icon:"📖",color:"var(--ey-gold)",screen:"Learn"},
          {label:"Partner",icon:"💞",color:"var(--ey-blush)",screen:"Partner"},
          {label:"Community",icon:"💬",color:"var(--ey-bubblegum)",screen:"Community"},
          {label:"AI Engine",icon:"◉",color:"var(--ey-purple)",screen:"AI Engine"},
          {label:"Microbe Report",icon:"🧬",color:"var(--ey-mint)",screen:"Microbe Report"},
          {label:"Prevention",icon:"△",color:"var(--ey-amber)",screen:"Prevention"},
          {label:"General Health",icon:"◈",color:"var(--ey-gold)",screen:"General Health"},
        ].map(item=>(
          <Card key={item.label} style={{padding:12,cursor:"pointer"}} onClick={()=>setScreen(item.screen)}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:18,color:item.color}}>{item.icon}</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:C.pearl}}>{item.label}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{borderColor:`${C.gold}30`,background:`rgba(255,215,0,0.05)`,cursor:"pointer"}} onClick={()=>setScreen("Learn")}>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-gold)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>✦ Insight of the day</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.75)",lineHeight:1.7}}>{getDailyTip()}</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-gold)",marginTop:6}}>Open the library →</div>
      </Card>

      {(!isLive || hasBiome) && (
        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-gold)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✦ Biome-Cycle Insight</div>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:18,color:C.pearl,marginBottom:6}}>Your biome predicted this dip</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.65)",lineHeight:1.7}}>Layer 3 detected L. crispatus declining 4 days before your symptoms appeared. Biome data gives Vybi a 3-5 day early warning that calendar-only apps cannot see.</div>
        </Card>
      )}
    </div>
  );
}
