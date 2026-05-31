import { C, BIOMES, calcAccuracy, phaseColor, phaseLabel } from "../vybi-data.js";
import { Card, GlowOrb, BiomeRing } from "../vybi-ui.jsx";
import { useDashboard } from "../useVybiData.ts";
import { daysUntil } from "../../lib/client-api.ts";
import { getDailyTip } from "../content-data.js";

export function HomeScreen({ setScreen }) {
  const { prediction, biome, prevention } = useDashboard();

  // Live biome rings (fall back to mock scores when no test kit on file).
  const liveScores = biome
    ? { vaginal: biome.vaginalScore, gut: biome.gutScore, skin: biome.skinScore, oral: biome.oralScore }
    : {};
  const biomes = BIOMES.map((b) => ({ ...b, score: liveScores[b.id] ?? b.score }));
  const overall = Math.round(biomes.reduce((a, b) => a + b.score, 0) / biomes.length);

  const accuracy = prediction?.accuracyPct ?? calcAccuracy(3, true, false, 47);
  const layersActive = prediction?.layersUsed?.length ?? 3;
  const periodDays = daysUntil(prediction?.predictedPeriodStart ?? null);
  const ovulationDays = daysUntil(prediction?.predictedOvulation ?? null);
  const confidence = prediction?.confidencePct ?? 82;
  const bvRisk = prevention?.bv_risk_score ?? null;

  const periodText = periodDays != null && periodDays >= 0 ? `Period in ${periodDays} days` : "Log a period to predict";
  return (
    <div style={{padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12,overflowY:"auto",height:"100%"}}>
      <GlowOrb color={C.fuchsia} size={200} opacity={0.15} x={100} y={-30}/>
      <div style={{paddingTop:16}}>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint,letterSpacing:"0.1em",textTransform:"uppercase"}}>Day 22 · Luteal Phase</div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:28,color:C.pearl}}>Your Vybi Today</div>
      </div>

      <Card style={{background:`linear-gradient(135deg,rgba(45,17,85,0.9),rgba(74,32,128,0.7))`}}>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:phaseColor("luteal"),boxShadow:`0 0 8px ${phaseColor("luteal")}`}}/>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:phaseColor("luteal"),fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Luteal Phase</span>
            </div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl,marginBottom:2}}>{periodText}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.55)"}}>AI confidence: <span style={{color:C.mint,fontWeight:600}}>{accuracy}%</span> · {layersActive} layers active</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:32,color:C.gold}}>{overall}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:8,color:C.mint,letterSpacing:"0.1em"}}>VYBI SCORE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[
            {label: periodDays != null && periodDays >= 0 ? `Period in ${periodDays}d` : "Period —", color:C.rose},
            {label: ovulationDays != null && ovulationDays >= 0 ? `Ovulation in ${ovulationDays}d` : "Ovulation —", color:C.gold},
            {label: `AI: ${confidence}% confident`, color:C.mint},
          ].map(item=>(
            <div key={item.label} style={{flex:1,padding:"6px 8px",borderRadius:8,background:`${item.color}15`,border:`1px solid ${item.color}30`,textAlign:"center"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:item.color,fontWeight:600}}>{item.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>All Biomes</div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          {biomes.map(b=><BiomeRing key={b.id} biome={b} size={68}/>)}
        </div>
      </Card>

      <Card style={{borderColor:`${C.purple}40`,background:`rgba(155,89,182,0.07)`,cursor:"pointer"}} onClick={()=>setScreen("AI Engine")}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${C.purple}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>◉</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.purple,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>AI Accuracy: {accuracy}%</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:17,color:C.pearl,marginBottom:4}}>Connect wearable → unlock 90%</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.6)"}}>{layersActive} of 5 algorithm layers active. View your AI engine →</div>
          </div>
        </div>
      </Card>

      <Card style={{borderColor:`${C.amber}50`,background:`rgba(255,140,66,0.07)`,cursor:"pointer"}} onClick={()=>setScreen("Prevention")}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${C.amber}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>△</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.amber,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>Prevention Alert{bvRisk!=null?` · BV ${bvRisk}/100`:""}</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:17,color:C.pearl,marginBottom:4}}>{bvRisk!=null?(bvRisk>=40?"BV risk elevated this week":"BV risk currently low"):"BV risk elevated this week"}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.6)"}}>L. crispatus -18% post-period. Biome layer flagged. Take action →</div>
          </div>
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {label:"Pregnancy",icon:"🤰",color:C.fuchsia,screen:"Pregnancy"},
          {label:"Birth Control",icon:"💊",color:C.purple,screen:"Birth Control"},
          {label:"Wearable",icon:"⌚",color:C.mint,screen:"Wearable"},
          {label:"Learn",icon:"📖",color:C.gold,screen:"Learn"},
          {label:"Partner",icon:"💞",color:C.blush,screen:"Partner"},
          {label:"AI Engine",icon:"◉",color:C.purple,screen:"AI Engine"},
          {label:"Microbe Report",icon:"🧬",color:C.mint,screen:"Microbe Report"},
          {label:"Prevention",icon:"△",color:C.amber,screen:"Prevention"},
          {label:"General Health",icon:"◈",color:C.gold,screen:"General Health"},
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
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>✦ Insight of the day</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.75)",lineHeight:1.7}}>{getDailyTip()}</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,marginTop:6}}>Open the library →</div>
      </Card>

      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✦ Biome-Cycle Insight</div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:18,color:C.pearl,marginBottom:6}}>Your biome predicted this dip</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.65)",lineHeight:1.7}}>Layer 3 detected L. crispatus declining 4 days before your symptoms appeared. Biome data gives Vybi a 3-5 day early warning that calendar-only apps cannot see.</div>
      </Card>
    </div>
  );
}
