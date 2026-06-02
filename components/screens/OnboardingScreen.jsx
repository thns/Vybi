import { useState } from "react";
import { C } from "../vybi-data.js";
import { GlowOrb } from "../vybi-ui.jsx";
import { api } from "../../lib/client-api.ts";

const STEPS = [
  {icon:"◎",title:"Meet Vybi",sub:"Your whole-body biome companion",body:"Vybi is the world's first app combining menstrual cycle intelligence with all four of your microbiomes — vaginal, gut, skin and oral.",color:C.coral},
  {icon:"◉",title:"5-Layer AI Engine",sub:"Gets smarter with your data",body:"Vybi uses a 5-layer algorithm stack. 3 layers activate from day one — including the biome-hormonal inference layer no competitor has.",color:C.gold},
  {icon:"◈",title:"Biome tells the truth",sub:"Your hormones written in bacteria",body:"Your vaginal biome tracks your oestrogen levels. L. crispatus rises at ovulation. This biological signal gives Vybi a 3-5 day early warning that calendar apps cannot see.",color:C.vaginal},
  {icon:"○",title:"Private by design",sub:"Anonymous Mode. ISO 27001.",body:"Your biome data is your most personal health data. No one — not even Vybi — can identify you in Anonymous Mode.",color:C.mint},
];

export function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [periodDate, setPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [goal, setGoal] = useState("track");
  const [busy, setBusy] = useState(false);

  const finish = async (withData) => {
    setBusy(true);
    await api.onboard(
      withData && periodDate
        ? { last_period_date: periodDate, cycle_length: Number(cycleLength) || 28, goal }
        : { goal },
    );
    setBusy(false);
    onComplete();
  };

  // ─── Final step: capture the user's last period so predictions can start ───
  if (capturing) {
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column",padding:"16px 24px",position:"relative",overflowY:"auto"}}>
        <GlowOrb color={C.fuchsia} size={300} opacity={0.15} x={-50} y={-40}/>
        <div style={{zIndex:1,flex:"1 0 auto",display:"flex",flexDirection:"column",justifyContent:"center",gap:16}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:52,color:C.fuchsia,filter:`drop-shadow(0 0 20px ${C.fuchsia})`}}>◎</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:28,color:C.pearl,marginTop:8}}>Let's start your cycle</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.6)",marginTop:4,lineHeight:1.6}}>This activates Layer 1 of the AI engine right away.</div>
          </div>

          <div>
            <label style={{display:"block",fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.7)",marginBottom:8}}>What's your goal?</label>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {[{k:"track",l:"Track my cycle",icon:"🌙"},{k:"conceive",l:"Trying to conceive",icon:"🤍"},{k:"avoid",l:"Avoiding pregnancy",icon:"🛡"}].map(g=>(
                <button key={g.k} onClick={()=>setGoal(g.k)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,border:`1px solid ${goal===g.k?C.fuchsia:"rgba(255,255,255,0.12)"}`,background:goal===g.k?`${C.fuchsia}18`:"rgba(255,255,255,0.03)",color:goal===g.k?C.pearl:"rgba(245,230,255,0.6)",fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:goal===g.k?600:400,cursor:"pointer",textAlign:"left"}}>
                  <span style={{fontSize:18}}>{g.icon}</span>{g.l}
                  {goal===g.k&&<span style={{marginLeft:"auto",color:C.fuchsia}}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{display:"block",fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.7)",marginBottom:6}}>When did your last period start?</label>
            <input type="date" value={periodDate} max={new Date().toISOString().slice(0,10)} onChange={(e)=>setPeriodDate(e.target.value)}
              style={{width:"100%",background:"rgba(26,10,46,0.6)",border:"1px solid rgba(195,155,211,0.3)",borderRadius:12,padding:"12px 14px",color:C.pearl,fontFamily:"DM Sans,sans-serif",fontSize:14,outline:"none",colorScheme:"dark"}}/>
          </div>

          <div>
            <label style={{display:"block",fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.7)",marginBottom:6}}>Typical cycle length: <span style={{color:C.fuchsia,fontWeight:600}}>{cycleLength} days</span></label>
            <input type="range" min={21} max={40} value={cycleLength} onChange={(e)=>setCycleLength(e.target.value)}
              style={{width:"100%",accentColor:C.fuchsia}}/>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.35)"}}><span>21</span><span>40</span></div>
          </div>
        </div>

        <div style={{width:"100%",zIndex:1,flexShrink:0,display:"flex",flexDirection:"column",gap:10,paddingTop:16,paddingBottom:"max(8px,env(safe-area-inset-bottom))"}}>
          <button onClick={()=>finish(true)} disabled={busy||!periodDate}
            style={{width:"100%",padding:14,borderRadius:12,background:`linear-gradient(135deg,${C.fuchsia},${C.amethyst})`,boxShadow:`0 8px 24px rgba(233,30,140,0.4)`,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:busy||!periodDate?"default":"pointer",opacity:busy||!periodDate?0.6:1}}>
            {busy?"Setting up…":"Start tracking"}
          </button>
          <button onClick={()=>finish(false)} disabled={busy} style={{background:"none",border:"none",color:"rgba(245,230,255,0.4)",fontFamily:"DM Sans,sans-serif",fontSize:13,cursor:"pointer"}}>I'll add this later</button>
        </div>
      </div>
    );
  }

  const s = STEPS[step];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <GlowOrb color={s.color} size={300} opacity={0.15} x={-50} y={-50}/>
      <div style={{textAlign:"center",zIndex:1,flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:16}}>
        {step===0
          ? <img src="/logo-mark.png" alt="Vybi" width={96} height={96} style={{margin:"0 auto",filter:`drop-shadow(0 0 24px ${s.color})`}}/>
          : <div style={{fontSize:60,color:s.color,filter:`drop-shadow(0 0 20px ${s.color})`}}>{s.icon}</div>}
        <div>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:32,color:C.pearl,lineHeight:1.1,marginBottom:6}}>{s.title}</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.mint,letterSpacing:"0.08em",textTransform:"uppercase"}}>{s.sub}</div>
        </div>
        <p style={{fontFamily:"DM Sans,sans-serif",fontSize:14,color:"rgba(245,230,255,0.75)",lineHeight:1.7,maxWidth:280,margin:"0 auto"}}>{s.body}</p>
        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
          {STEPS.map((_,i)=><div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?s.color:"rgba(255,255,255,0.2)",transition:"all 0.3s"}}/>)}
        </div>
      </div>
      <div style={{width:"100%",zIndex:1,flexShrink:0,display:"flex",flexDirection:"column",gap:10,paddingBottom:"max(8px,env(safe-area-inset-bottom))"}}>
        {step<STEPS.length-1
          ?<button onClick={()=>setStep(step+1)} style={{width:"100%",padding:14,borderRadius:12,background:s.color,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:"pointer"}}>Continue</button>
          :<button onClick={()=>setCapturing(true)} style={{width:"100%",padding:14,borderRadius:12,background:`linear-gradient(135deg,${C.fuchsia},${C.amethyst})`,boxShadow:`0 8px 24px rgba(233,30,140,0.4)`,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:"pointer"}}>Begin My Biome Journey</button>}
        {step<STEPS.length-1&&<button onClick={()=>setCapturing(true)} style={{background:"none",border:"none",color:"rgba(245,230,255,0.4)",fontFamily:"DM Sans,sans-serif",fontSize:13,cursor:"pointer"}}>Skip</button>}
      </div>
    </div>
  );
}
