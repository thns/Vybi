import { useState } from "react";
import { C } from "../vybi-data.js";
import { Card } from "../vybi-ui.jsx";

const TOGGLES = [
  {label:"Anonymous Mode",desc:"No identity linked to health data",on:false,color:C.coral},
  {label:"Partner Sharing",desc:"Share cycle & biome with partner",on:true,color:C.mint},
  {label:"Push Notifications",desc:"Reminders, results & insights",on:true,color:C.gold},
  {label:"Biometric Lock",desc:"Face ID / Fingerprint",on:true,color:C.saliva},
  {label:"Research Opt-in",desc:"Contribute anonymised data",on:false,color:C.sage},
];

export function SettingsScreen() {
  const [states, setStates] = useState(TOGGLES.map(t=>t.on));
  return (
    <div style={{padding:"16px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>Settings</div>
      <Card>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${C.coral},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>◈</div>
          <div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:18,color:C.pearl}}>Anonymous Bloom</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint}}>Vybi Core · myvybi.com</div>
          </div>
        </div>
      </Card>
      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Privacy & Preferences</div>
        {TOGGLES.map((t,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i<TOGGLES.length-1?14:0,paddingBottom:i<TOGGLES.length-1?14:0,borderBottom:i<TOGGLES.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
            <div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,color:C.pearl}}>{t.label}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.4)"}}>{t.desc}</div>
            </div>
            <div onClick={()=>setStates(s=>s.map((v,j)=>j===i?!v:v))} style={{width:44,height:24,borderRadius:12,background:states[i]?t.color:"rgba(255,255,255,0.1)",position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:states[i]?23:3,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
            </div>
          </div>
        ))}
      </Card>
      {[
        {icon:"🧬",label:"My Test Kits",sub:"Layer 3 · 2 completed · 1 due in 18d"},
        {icon:"💳",label:"Billing & Subscription",sub:"Vybi Core · renews Jun 2026"},
        {icon:"📋",label:"Export Health Data",sub:"Full report download"},
        {icon:"⚖️",label:"Privacy Policy",sub:"ISO 27001 · ISO 27701 · vybi.health"},
      ].map((item,i)=>(
        <Card key={i} style={{padding:"12px 16px",cursor:"pointer"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontSize:20}}>{item.icon}</span>
              <div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,color:C.pearl}}>{item.label}</div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.4)"}}>{item.sub}</div>
              </div>
            </div>
            <span style={{color:"rgba(255,255,255,0.2)",fontSize:16}}>›</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
