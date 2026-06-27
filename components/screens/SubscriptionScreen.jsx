import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { C } from "../vybi-data.js";
import { Card } from "../vybi-ui.jsx";
import { api } from "../../lib/client-api.ts";

export function SubscriptionScreen() {
  const { data: sessionData } = useSession();
  const currentTier = sessionData?.user?.subscriptionTier ?? "free";
  const [sel, setSel] = useState("core");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { if (currentTier !== "free") setSel(currentTier); }, [currentTier]);

  const startCheckout = async () => {
    if (sel === "free" || sel === currentTier) return;
    setBusy(true);
    setMsg(null);
    const res = await api.checkout(sel);
    setBusy(false);
    if (res?.url) {
      window.location.href = res.url;
    } else {
      setMsg(res?.error ? `${res.error}. Payments go live once Stripe keys are added.` : "Checkout is not available yet — Stripe keys pending.");
    }
  };
  const plans = [
    {id:"free",name:"Vybi Free",price:"£0",period:"forever",color:C.sage,features:["Basic cycle tracking","Period predictions (Layer 1)","1 biome score","Weekly tips"],locked:["AI assistant","Symptom pattern engine","Biome inference layer","Prevention scores"]},
    {id:"core",name:"Vybi Core",price:"£9.99",period:"/mo",color:C.coral,popular:true,features:["Full cycle intelligence","Layers 1 + 2 + 3 active","All 4 biome dashboards","AI assistant (50 msgs/mo)","Monthly microbe insights","Prevention risk scores","General health tracking","1 test kit/quarter add-on"],locked:["Unlimited AI","Test kits included","Expert consultations"]},
    {id:"premium",name:"Vybi Premium",price:"£24.99",period:"/mo",color:C.gold,features:["Everything in Core","Unlimited Vybi AI","2 test kits/year included","Wearable sync (Layer 4)","Monthly expert Q&A","Supplement plan","Anonymous mode","Partner sharing","Doctor report export"]},
  ];
  return (
    <div style={{padding:"16px 16px 28px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>Vybi Plans</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.mint}}>More layers = more accuracy</div>
      </div>
      {plans.map(plan=>(
        <div key={plan.id} onClick={()=>setSel(plan.id)} style={{borderRadius:16,border:`2px solid ${sel===plan.id?plan.color:"rgba(var(--surface-rgb),0.08)"}`,background:sel===plan.id?`${plan.color}10`:"rgba(var(--velvet-rgb),0.4)",padding:16,cursor:"pointer",position:"relative"}}>
          {plan.popular&&<div style={{position:"absolute",top:-10,right:16,padding:"3px 12px",borderRadius:20,background:plan.color,fontFamily:"DM Sans,sans-serif",fontSize:10,fontWeight:700,color:"white"}}>MOST POPULAR</div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl}}>{plan.name}</span>
                {plan.id===currentTier&&<span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,background:`${plan.color}30`,color:plan.color,fontFamily:"DM Sans,sans-serif"}}>CURRENT</span>}
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:2}}>
                <span style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:28,color:plan.color}}>{plan.price}</span>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.5)"}}>{plan.period}</span>
              </div>
            </div>
            <div style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${sel===plan.id?plan.color:"rgba(var(--surface-rgb),0.2)"}`,background:sel===plan.id?plan.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {sel===plan.id&&<div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/>}
            </div>
          </div>
          {plan.features.map(f=><div key={f} style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}><span style={{color:plan.color,fontSize:12}}>✓</span><span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.75)"}}>{f}</span></div>)}
          {plan.locked?.map(f=><div key={f} style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}><span style={{color:"rgba(var(--surface-rgb),0.2)",fontSize:12}}>✗</span><span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.25)"}}>{f}</span></div>)}
        </div>
      ))}
      <button onClick={startCheckout} disabled={busy||sel===currentTier} style={{width:"100%",padding:14,borderRadius:12,background:`var(--brand-grad)`,boxShadow:`0 8px 24px rgba(180,40,140,0.26)`,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:busy||sel===currentTier?"default":"pointer",opacity:busy||sel===currentTier?0.6:1}}>
        {busy?"Redirecting…":sel===currentTier?`Current plan · ${plans.find(p=>p.id===sel)?.name}`:sel==="free"?"Continue Free":`Start ${plans.find(p=>p.id===sel)?.name} — 7 days free`}
      </button>
      {msg&&<div style={{textAlign:"center",fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.amber}}>{msg}</div>}
      <div style={{textAlign:"center",fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.35)"}}>Cancel anytime · ISO 27001 · vybi.health</div>
    </div>
  );
}
