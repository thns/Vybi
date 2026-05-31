import { useState } from "react";
import { C } from "../vybi-data.js";
import { GlowOrb } from "../vybi-ui.jsx";

const STEPS = [
  {icon:"◎",title:"Meet Vybi",sub:"Your whole-body biome companion",body:"Vybi is the world's first app combining menstrual cycle intelligence with all four of your microbiomes — vaginal, gut, skin and oral.",color:C.coral},
  {icon:"◉",title:"5-Layer AI Engine",sub:"Gets smarter with your data",body:"Vybi uses a 5-layer algorithm stack. 3 layers activate from day one — including the biome-hormonal inference layer no competitor has.",color:C.gold},
  {icon:"◈",title:"Biome tells the truth",sub:"Your hormones written in bacteria",body:"Your vaginal biome tracks your oestrogen levels. L. crispatus rises at ovulation. This biological signal gives Vybi a 3-5 day early warning that calendar apps cannot see.",color:C.vaginal},
  {icon:"○",title:"Private by design",sub:"Anonymous Mode. ISO 27001.",body:"Your biome data is your most personal health data. No one — not even Vybi — can identify you in Anonymous Mode.",color:C.mint},
];

export function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <GlowOrb color={s.color} size={300} opacity={0.15} x={-50} y={-50}/>
      <div style={{textAlign:"center",zIndex:1,flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:16}}>
        <div style={{fontSize:60,color:s.color,filter:`drop-shadow(0 0 20px ${s.color})`}}>{s.icon}</div>
        <div>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:32,color:C.pearl,lineHeight:1.1,marginBottom:6}}>{s.title}</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.mint,letterSpacing:"0.08em",textTransform:"uppercase"}}>{s.sub}</div>
        </div>
        <p style={{fontFamily:"DM Sans,sans-serif",fontSize:14,color:"rgba(245,230,255,0.75)",lineHeight:1.7,maxWidth:280,margin:"0 auto"}}>{s.body}</p>
        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
          {STEPS.map((_,i)=><div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?s.color:"rgba(255,255,255,0.2)",transition:"all 0.3s"}}/>)}
        </div>
      </div>
      <div style={{width:"100%",zIndex:1,display:"flex",flexDirection:"column",gap:10}}>
        {step<STEPS.length-1
          ?<button onClick={()=>setStep(step+1)} style={{width:"100%",padding:14,borderRadius:12,background:s.color,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:"pointer"}}>Continue</button>
          :<button onClick={onComplete} style={{width:"100%",padding:14,borderRadius:12,background:`linear-gradient(135deg,${C.fuchsia},${C.amethyst})`,boxShadow:`0 8px 24px rgba(233,30,140,0.4)`,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:"pointer"}}>Begin My Biome Journey</button>}
        {step<STEPS.length-1&&<button onClick={onComplete} style={{background:"none",border:"none",color:"rgba(245,230,255,0.4)",fontFamily:"DM Sans,sans-serif",fontSize:13,cursor:"pointer"}}>Skip</button>}
      </div>
    </div>
  );
}
