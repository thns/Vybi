import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { C, calcAccuracy } from "../vybi-data.js";
import { sendChat } from "../../lib/client-api.ts";
import { useDashboard } from "../useVybiData.ts";

export function ChatScreen() {
  const { data: session } = useSession();
  // Demo screenplay only for guests/preview. Signed-in users start clean so
  // they never see fabricated personal data.
  const demoScript = [
    {role:"vybi",text:"Hello! I'm Vybi. I can see your cycle data, biome scores, symptom logs and AI layer status. What would you like to explore?"},
    {role:"user",text:"Why did my vaginal score drop?"},
    {role:"vybi",text:"Layer 3 flagged this. Your L. crispatus fell from 75% (March test) to 61% (May test) — an 18% decline.\n\nCross-referencing with Layer 1 and Layer 2: you're on Day 22 (luteal phase), which is the most common time for this. Rising progesterone reduces vaginal glycogen, starving Lactobacillus.\n\nYour logged stress on Days 18-20 compounded this. pH is still 4.2 (safe range), so no infection — but the trend needs reversing.\n\nShall I build your restore plan?"},
    {role:"user",text:"How accurate is your period prediction?"},
    {role:"vybi",text:"Currently 82% for your next period (3 layers active).\n\nBreakdown:\n• Layer 1 (Kalman): ±2.1 days baseline\n• Layer 2 (Symptom pattern): refined to ±1.4 days\n• Layer 3 (Biome inference): L. crispatus trend confirms late luteal\n\nTo reach 90%: connect a wearable. BBT data activates Layer 4, cutting error to ±0.8 days. Flo's 90% took 8 cycles + wearable. You're on track for cycle 6."},
  ];
  const init = session?.user
    ? [{role:"vybi",text:"Hi, I'm Vybi — your cycle & biome assistant. I can read the data you've logged (cycles, symptoms, biome tests, wearables) and explain your predictions. What would you like to know?"}]
    : demoScript;
  const { prediction } = useDashboard();
  const accuracy = prediction?.accuracyPct ?? calcAccuracy(3,true,false,47);
  const layers = prediction?.layersUsed?.length ?? 3;
  const [messages, setMessages] = useState(init);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[messages]);

  const send = async () => {
    if(!input.trim())return;
    const next=[...messages,{role:"user",text:input}];
    setMessages(next);
    setInput("");setTyping(true);
    // Send only the real conversation (skip the seeded demo exchange).
    const res = await sendChat(next.map(m=>({role:m.role,text:m.text})));
    setTyping(false);
    setMessages(m=>[...m,{role:"vybi",text:res.reply ?? res.error ?? "Sorry, I couldn't respond just now."}]);
  };

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 16px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>Vybi AI</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint}}>Biome + Cycle aware · {accuracy}% accuracy · {layers} layers active</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="vybi"&&<div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.coral},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0,marginRight:8,alignSelf:"flex-end"}}>◈</div>}
            <div style={{maxWidth:"78%",padding:"10px 13px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.role==="user"?`linear-gradient(135deg,${C.coral}dd,${C.coral}aa)`:"rgba(45,17,85,0.7)",border:m.role==="user"?"none":"1px solid rgba(195,155,211,0.2)",fontFamily:"DM Sans,sans-serif",fontSize:13,color:C.pearl,lineHeight:1.6,whiteSpace:"pre-line"}}>{m.text}</div>
          </div>
        ))}
        {typing&&<div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.coral},${C.gold})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>◈</div>
          <div style={{padding:"10px 14px",borderRadius:"16px 16px 16px 4px",background:"rgba(45,17,85,0.7)",border:"1px solid rgba(195,155,211,0.2)",display:"flex",gap:4}}>
            {[0,0.3,0.6].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.mint,animation:"pulse 1s infinite",animationDelay:`${d}s`}}/>)}
          </div>
        </div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"10px 16px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{display:"flex",gap:5,marginBottom:8,overflowX:"auto"}}>
          {["How accurate am I?","Explain Layer 3","My biome report","Restore plan"].map(q=>(
            <button key={q} onClick={()=>setInput(q)} style={{padding:"5px 10px",borderRadius:16,border:`1px solid ${C.sage}50`,background:"transparent",color:C.mint,fontFamily:"DM Sans,sans-serif",fontSize:10,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>{q}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask Vybi anything..." style={{flex:1,padding:"11px 14px",borderRadius:12,background:"rgba(45,17,85,0.55)",border:"1px solid rgba(155,89,182,0.4)",color:C.pearl,fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none"}}/>
          <button onClick={send} style={{padding:"11px 16px",borderRadius:12,background:`linear-gradient(135deg,${C.fuchsia},${C.amethyst})`,boxShadow:`0 8px 24px rgba(233,30,140,0.4)`,border:"none",color:"white",fontSize:16,cursor:"pointer"}}>→</button>
        </div>
      </div>
    </div>
  );
}
