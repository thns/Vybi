import { useState } from "react";
import { C } from "../vybi-data.js";
import { Card } from "../vybi-ui.jsx";

export function SubscriptionScreen() {
  const [sel, setSel] = useState("core");
  const plans = [
    {id:"free",name:"Vybi Free",price:"£0",period:"forever",color:C.sage,features:["Basic cycle tracking","Period predictions (Layer 1)","1 biome score","Weekly tips"],locked:["AI assistant","Symptom pattern engine","Biome inference layer","Prevention scores"]},
    {id:"core",name:"Vybi Core",price:"£9.99",period:"/mo",color:C.coral,popular:true,features:["Full cycle intelligence","Layers 1 + 2 + 3 active","All 4 biome dashboards","AI assistant (50 msgs/mo)","Monthly microbe insights","Prevention risk scores","General health tracking","1 test kit/quarter add-on"],locked:["Unlimited AI","Test kits included","Expert consultations"]},
    {id:"premium",name:"Vybi Premium",price:"£24.99",period:"/mo",color:C.gold,features:["Everything in Core","Unlimited Vybi AI","2 test kits/year included","Wearable sync (Layer 4)","Monthly expert Q&A","Supplement plan","Anonymous mode","Partner sharing","Doctor report export"]},
  ];
  return (
    <div style={{padding:"16px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>Vybi Plans</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.mint}}>More layers = more accuracy</div>
      </div>
      {plans.map(plan=>(
        <div key={plan.id} onClick={()=>setSel(plan.id)} style={{borderRadius:16,border:`2px solid ${sel===plan.id?plan.color:"rgba(255,255,255,0.08)"}`,background:sel===plan.id?`${plan.color}10`:"rgba(45,17,85,0.4)",padding:16,cursor:"pointer",position:"relative"}}>
          {plan.popular&&<div style={{position:"absolute",top:-10,right:16,padding:"3px 12px",borderRadius:20,background:plan.color,fontFamily:"DM Sans,sans-serif",fontSize:10,fontWeight:700,color:"white"}}>MOST POPULAR</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl}}>{plan.name}</div>
              <div style={{display:"flex",alignItems:"baseline",gap:2}}>
                <span style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:28,color:plan.color}}>{plan.price}</span>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.5)"}}>{plan.period}</span>
              </div>
            </div>
            <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${sel===plan.id?plan.color:"rgba(255,255,255,0.2)"}`,background:sel===plan.id?plan.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {sel===plan.id&&<div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/>}
            </div>
          </div>
          {plan.features.map(f=><div key={f} style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}><span style={{color:plan.color,fontSize:12}}>✓</span><span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.75)"}}>{f}</span></div>)}
          {plan.locked?.map(f=><div key={f} style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}><span style={{color:"rgba(255,255,255,0.2)",fontSize:12}}>✗</span><span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.25)"}}>{f}</span></div>)}
        </div>
      ))}
      <button style={{width:"100%",padding:14,borderRadius:12,background:`linear-gradient(135deg,${C.fuchsia},${C.amethyst})`,boxShadow:`0 8px 24px rgba(233,30,140,0.4)`,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:"pointer"}}>
        {sel==="free"?"Continue Free":`Start ${plans.find(p=>p.id===sel)?.name} — 7 days free`}
      </button>
      <div style={{textAlign:"center",fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.35)"}}>Cancel anytime · ISO 27001 · vybi.health</div>
    </div>
  );
}
