import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { C } from "../vybi-data.js";
import { Card, GlowOrb } from "../vybi-ui.jsx";
import { api, formatShort } from "../../lib/client-api.ts";

const TRI = { 1: "First Trimester", 2: "Second Trimester", 3: "Third Trimester" };

export function PregnancyScreen() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [mode, setMode] = useState("due"); // "due" | "lmp"
  const [dueDate, setDueDate] = useState("");
  const [lmp, setLmp] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const { data: session } = useSession();

  const load = async () => {
    const res = await api.pregnancy();
    setStatus(res?.status ?? null);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const start = async () => {
    setBusy(true);
    setMsg(null);
    const body = mode === "due" ? { due_date: dueDate } : { last_period_date: lmp };
    const res = await api.startPregnancy(body);
    setBusy(false);
    if (res?.status) setStatus(res.status);
    else setMsg(session?.user ? "Couldn't start tracking — please try again." : "Sign in to track your pregnancy and save it to your account.");
  };

  const end = async () => {
    setBusy(true);
    await api.endPregnancy();
    setBusy(false);
    setStatus(null);
  };

  const Header = (
    <div style={{padding:"16px 16px 0"}}>
      <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>Pregnancy</div>
      <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.blush||C.rose,marginBottom:8}}>Week-by-week · Baby size · Countdown</div>
    </div>
  );

  if (loading) {
    return (<div style={{height:"100%",display:"flex",flexDirection:"column"}}>{Header}<div style={{padding:16,color:"rgba(var(--ink-rgb),0.4)",fontFamily:"DM Sans,sans-serif",fontSize:12}}>Loading…</div></div>);
  }

  // ─── Setup (no active pregnancy) ───────────────────────────────────────────
  if (!status) {
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {Header}
        <div style={{flex:1,overflowY:"auto",padding:"8px 16px 28px",display:"flex",flexDirection:"column",gap:12}}>
          <GlowOrb color={C.fuchsia} size={220} opacity={0.13} x={70} y={-20}/>
          <Card style={{textAlign:"center"}}>
            <div style={{fontSize:46,filter:`drop-shadow(0 0 18px ${C.fuchsia})`}}>🤰</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl,marginTop:6}}>Track your pregnancy</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.6)",lineHeight:1.6,marginTop:4}}>Enter your due date, or your last period and we'll calculate it.</div>
          </Card>

          <Card>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              {[{k:"due",l:"I know my due date"},{k:"lmp",l:"Use my last period"}].map(t=>(
                <button key={t.k} onClick={()=>setMode(t.k)} style={{flex:1,padding:"8px",borderRadius:10,border:`1px solid ${mode===t.k?C.fuchsia:"rgba(var(--surface-rgb),0.12)"}`,background:mode===t.k?`${C.fuchsia}20`:"transparent",color:mode===t.k?C.fuchsia:"rgba(var(--ink-rgb),0.5)",fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>{t.l}</button>
              ))}
            </div>
            {mode==="due"?(
              <>
                <label style={{display:"block",fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.7)",marginBottom:6}}>Estimated due date</label>
                <input type="date" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} style={inputStyle}/>
              </>
            ):(
              <>
                <label style={{display:"block",fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.7)",marginBottom:6}}>First day of last period</label>
                <input type="date" value={lmp} max={new Date().toISOString().slice(0,10)} onChange={(e)=>setLmp(e.target.value)} style={inputStyle}/>
              </>
            )}
            <button onClick={start} disabled={busy||(mode==="due"?!dueDate:!lmp)} style={{width:"100%",marginTop:6,padding:13,borderRadius:12,border:"none",background:`var(--brand-grad)`,color:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:"pointer",opacity:busy||(mode==="due"?!dueDate:!lmp)?0.6:1}}>{busy?"Starting…":"Start pregnancy tracking"}</button>
            {msg&&<div style={{marginTop:10,fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.gold,textAlign:"center",lineHeight:1.5}}>{msg}</div>}
          </Card>
        </div>
      </div>
    );
  }

  // ─── Active pregnancy ──────────────────────────────────────────────────────
  const circ = 2 * Math.PI * 52;
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {Header}
      <div style={{flex:1,overflowY:"auto",padding:"8px 16px 28px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={C.fuchsia} size={240} opacity={0.14} x={60} y={-30}/>

        <Card style={{background:`linear-gradient(135deg,rgba(74,32,128,0.7),rgba(var(--velvet-rgb),0.9))`,textAlign:"center"}}>
          <div style={{position:"relative",width:140,height:140,margin:"4px auto 8px"}}>
            <svg width={140} height={140} style={{transform:"rotate(-90deg)"}}>
              <circle cx={70} cy={70} r={52} fill="none" style={{stroke:"rgba(var(--surface-rgb),0.18)"}} strokeWidth={9}/>
              <circle cx={70} cy={70} r={52} fill="none" stroke={C.fuchsia} strokeWidth={9} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ*(1-status.progressPct/100)} style={{filter:`drop-shadow(0 0 8px ${C.fuchsia})`,transition:"stroke-dashoffset 1s"}}/>
            </svg>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:40,color:C.pearl,lineHeight:1}}>{status.week}</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.lavender,letterSpacing:"0.08em"}}>WEEKS{status.dayOfWeek?` +${status.dayOfWeek}d`:""}</span>
            </div>
          </div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em"}}>{TRI[status.trimester]}</div>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl,marginTop:4}}>
            {status.overdue?`${-status.daysRemaining} days overdue`:`${status.daysRemaining} days to go`}
          </div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.55)",marginTop:2}}>Due {formatShort(status.dueDate)} · {status.progressPct}% complete</div>
        </Card>

        <Card>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:40}}>🍼</div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em"}}>Baby is about the size of a</div>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl}}>{status.babySize}</div>
              {status.babyLengthCm!=null&&<div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.5)"}}>≈ {status.babyLengthCm} cm</div>}
            </div>
          </div>
        </Card>

        <Card style={{borderColor:`${C.fuchsia}30`,background:`rgba(233,30,140,0.05)`}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.fuchsia,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>This week</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,color:"rgba(var(--ink-rgb),0.8)",lineHeight:1.7}}>{status.weeklyNote}</div>
        </Card>

        <button onClick={end} disabled={busy} style={{background:"none",border:"1px solid rgba(var(--surface-rgb),0.12)",borderRadius:10,padding:"10px",color:"rgba(var(--ink-rgb),0.45)",fontFamily:"DM Sans,sans-serif",fontSize:12,cursor:"pointer"}}>End pregnancy tracking</button>
      </div>
    </div>
  );
}

const inputStyle = {width:"100%",background:"rgba(var(--deep-rgb),0.6)",border:"1px solid rgba(var(--lav-rgb),0.3)",borderRadius:12,padding:"11px 14px",color:C.pearl,fontFamily:"DM Sans,sans-serif",fontSize:14,outline:"none",colorScheme:"var(--scheme)",marginBottom:6};
