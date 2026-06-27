import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { C } from "../vybi-data.js";
import { Card, GlowOrb } from "../vybi-ui.jsx";
import { api } from "../../lib/client-api.ts";

const METHODS = [
  {k:"pill",l:"Pill",icon:"💊"},
  {k:"patch",l:"Patch",icon:"🩹"},
  {k:"ring",l:"Ring",icon:"⭕"},
  {k:"iud_hormonal",l:"Hormonal IUD",icon:"⚕"},
  {k:"iud_copper",l:"Copper IUD",icon:"🔶"},
  {k:"implant",l:"Implant",icon:"➖"},
  {k:"injection",l:"Injection",icon:"💉"},
  {k:"condom",l:"Condom",icon:"🛡"},
  {k:"none",l:"None",icon:"○"},
];

const iso = (d) => d.toISOString().slice(0, 10);

export function BirthControlScreen() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pillTime, setPillTime] = useState("21:00");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const { data: session } = useSession();

  const load = async () => {
    const res = await api.birthControl();
    setConfig(res?.config ?? null);
    setLogs(res?.logs ?? []);
    if (res?.config) {
      setSelected(res.config.method);
      if (res.config.pillTime) setPillTime(res.config.pillTime);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    setMsg(null);
    const res = await api.setBirthControl({ method: selected, pill_time: selected === "pill" ? pillTime : undefined });
    setBusy(false);
    if (res?.config) { setConfig(res.config); setMsg("Saved · reminders updated"); }
    else setMsg(session?.user ? "Couldn't save — please try again." : "Sign in to save your birth control method.");
  };

  const takeToday = async () => {
    setBusy(true);
    setMsg(null);
    const res = await api.logPill({ taken: true });
    if (res) await load();
    else setMsg(session?.user ? "Couldn't log — please try again." : "Sign in to track your pill.");
    setBusy(false);
  };

  // last 7 days adherence
  const today = new Date();
  const takenSet = new Set(logs.filter((l) => l.taken).map((l) => l.date));
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return { date: iso(d), label: d.toLocaleDateString("en-GB", { weekday: "narrow" }), taken: takenSet.has(iso(d)) };
  });
  const tookToday = takenSet.has(iso(today));

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>Birth Control</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint,marginBottom:8}}>Method · Pill tracking · Adherence</div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"8px 16px 28px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={C.amethyst} size={220} opacity={0.12} x={70} y={-20}/>

        {loading ? (
          <div style={{color:"rgba(var(--ink-rgb),0.4)",fontFamily:"DM Sans,sans-serif",fontSize:12}}>Loading…</div>
        ) : (
          <>
            <Card>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Your method</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {METHODS.map(m=>(
                  <button key={m.k} onClick={()=>setSelected(m.k)} style={{padding:"10px 4px",borderRadius:12,border:`1px solid ${selected===m.k?C.fuchsia:"rgba(var(--surface-rgb),0.1)"}`,background:selected===m.k?`${C.fuchsia}18`:"rgba(var(--surface-rgb),0.03)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <span style={{fontSize:18}}>{m.icon}</span>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:selected===m.k?C.fuchsia:"rgba(var(--ink-rgb),0.6)",textAlign:"center"}}>{m.l}</span>
                  </button>
                ))}
              </div>
              {selected==="pill"&&(
                <div style={{marginTop:12}}>
                  <label style={{display:"block",fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.6)",marginBottom:6}}>Daily reminder time</label>
                  <input type="time" value={pillTime} onChange={(e)=>setPillTime(e.target.value)} style={{background:"rgba(var(--deep-rgb),0.6)",border:"1px solid rgba(var(--lav-rgb),0.3)",borderRadius:10,padding:"8px 12px",color:C.pearl,fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none",colorScheme:"var(--scheme)"}}/>
                </div>
              )}
              <button onClick={save} disabled={busy||!selected||selected===config?.method&&selected!=="pill"} style={{width:"100%",marginTop:12,padding:12,borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.fuchsia},${C.amethyst})`,color:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",opacity:busy||!selected?0.6:1}}>{busy?"Saving…":config?"Update method":"Save method"}</button>
              {msg&&<div style={{marginTop:10,fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.gold,textAlign:"center",lineHeight:1.5}}>{msg}</div>}
            </Card>

            {config?.method==="pill"&&(
              <Card style={{borderColor:`${C.fuchsia}30`}}>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.fuchsia,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>This week's pills</div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  {week.map((d,i)=>(
                    <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:d.taken?`${C.mint}25`:"rgba(var(--surface-rgb),0.05)",border:`1px solid ${d.taken?C.mint:"rgba(var(--surface-rgb),0.12)"}`,color:d.taken?C.mint:"rgba(var(--ink-rgb),0.3)",fontSize:13}}>{d.taken?"✓":"○"}</div>
                      <span style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(var(--ink-rgb),0.4)"}}>{d.label}</span>
                    </div>
                  ))}
                </div>
                <button onClick={takeToday} disabled={busy||tookToday} style={{width:"100%",padding:12,borderRadius:12,border:"none",background:tookToday?"rgba(184,240,230,0.15)":`linear-gradient(135deg,${C.fuchsia},${C.coral})`,color:tookToday?C.mint:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:600,cursor:tookToday?"default":"pointer",opacity:busy?0.6:1}}>{tookToday?"✓ Taken today":"Take today's pill"}</button>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(var(--ink-rgb),0.4)",textAlign:"center",marginTop:8}}>Reminder set for {config.pillTime||pillTime} daily</div>
              </Card>
            )}

            {config&&config.method!=="pill"&&config.method!=="none"&&(
              <Card style={{textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:6}}>{METHODS.find(m=>m.k===config.method)?.icon}</div>
                <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl}}>{METHODS.find(m=>m.k===config.method)?.l}</div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.55)",marginTop:4,lineHeight:1.6}}>Tracked as your active method. We'll factor this into your cycle predictions and reminders.</div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
