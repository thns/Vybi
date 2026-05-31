import { useState } from "react";
import { C, BIOMES } from "../vybi-data.js";
import { Card, GlowOrb, Badge, BiomeRing } from "../vybi-ui.jsx";
import { useDashboard } from "../useVybiData.ts";

export function BiomesScreen() {
  const [selected, setSelected] = useState(0);
  const { biome } = useDashboard();
  const liveScores = biome
    ? { vaginal: biome.vaginalScore, gut: biome.gutScore, skin: biome.skinScore, oral: biome.oralScore }
    : {};
  const biomes = BIOMES.map((x) => ({ ...x, score: liveScores[x.id] ?? x.score }));
  const b = biomes[selected];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl,marginBottom:10}}>My Biomes</div>
        <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {biomes.map((biome,i)=>(
            <button key={biome.id} onClick={()=>setSelected(i)} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${selected===i?biome.color:"rgba(255,255,255,0.1)"}`,background:selected===i?`${biome.color}20`:"transparent",color:selected===i?biome.color:"rgba(245,230,255,0.5)",fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
              {biome.icon} {biome.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={b.color} size={220} opacity={0.15} x={80} y={-20}/>
        <Card style={{borderColor:`${b.color}40`}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <BiomeRing biome={b} size={88} showLabel={false}/>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl,marginBottom:4}}>{b.name}</div>
              <Badge text={b.status} color={b.color}/>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.55)",marginTop:6}}>Dominant: <em style={{color:b.color}}>{b.bacteria}</em></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
                {b.tags.map(t=><span key={t} style={{fontSize:9,padding:"2px 7px",borderRadius:10,background:"rgba(255,255,255,0.06)",color:"rgba(245,230,255,0.6)",fontFamily:"DM Sans,sans-serif"}}>{t}</span>)}
              </div>
            </div>
          </div>
        </Card>
        {b.id==="vaginal"&&<Card style={{borderColor:`${C.coral}40`,background:`rgba(233,30,140,0.07)`}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.coral,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Layer 3 · Live signal</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.75)",lineHeight:1.7}}>{biome?.lCrispatusPct!=null?`L. crispatus at ${biome.lCrispatusPct}%${biome.phValue!=null?` · pH ${biome.phValue}`:""}${biome.diversityIndex!=null?` · diversity ${biome.diversityIndex}`:""}. This biome composition feeds Layer 3's hormonal inference for your cycle predictions.`:"L. crispatus at 61% — declining from 75% (March test). This biome shift predicted your luteal phase transition 3 days before your symptoms appeared. Current signal: late luteal, period in ~7 days."}</div>
        </Card>}
        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Score History</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60}}>
            {[65,70,78,72,68,b.score].map((v,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:"100%",borderRadius:4,background:i===5?b.color:`${b.color}40`,height:`${(v/100)*56}px`,filter:i===5?`drop-shadow(0 0 4px ${b.color})`:"none"}}/>
                <span style={{fontSize:8,color:"rgba(245,230,255,0.3)",fontFamily:"DM Sans,sans-serif"}}>W{i+1}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Recommendations</div>
          {[
            {icon:"💊",text:b.id==="vaginal"?"L. crispatus probiotic daily":b.id==="gut"?"Continue fermented foods":b.id==="skin"?"Microbiome-friendly cleanser":"Xylitol mints daily",type:"Supplement"},
            {icon:"🥗",text:b.id==="vaginal"?"Reduce sugar — feeds Gardnerella":b.id==="gut"?"30 plant types per week":b.id==="skin"?"Anti-inflammatory diet":"Limit mouthwash — disrupts oral microbiome",type:"Diet"},
            {icon:"🧬",text:"Retest in 18 days",type:"Test"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<2?10:0,paddingBottom:i<2?10:0,borderBottom:i<2?"1px solid rgba(255,255,255,0.06)":"none"}}>
              <span style={{fontSize:18}}>{r.icon}</span>
              <div>
                <span style={{fontSize:9,padding:"2px 6px",borderRadius:8,background:`${b.color}20`,color:b.color,fontFamily:"DM Sans,sans-serif",marginBottom:3,display:"inline-block"}}>{r.type}</span>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.8)",lineHeight:1.5}}>{r.text}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
