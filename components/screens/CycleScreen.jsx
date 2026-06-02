import { useState, useEffect } from "react";
import { C, CYCLE_DAYS, SYMPTOM_GROUPS, calcAccuracy, phaseColor, phaseLabel } from "../vybi-data.js";
import { Card, GlowOrb, Badge } from "../vybi-ui.jsx";
import { useDashboard, useCycles } from "../useVybiData.ts";
import { api, formatShort, daysUntil, cycleDayFrom } from "../../lib/client-api.ts";

const dText = (d, fallback) =>
  d == null ? fallback : d === 0 ? "Today" : d > 0 ? `In ${d} days` : `${-d} days ago`;

export function CycleScreen() {
  const [reload, setReload] = useState(0);
  const { prediction } = useDashboard(reload);
  const { cycles } = useCycles(reload);
  const latestCycle = cycles[0] ?? null;
  const cycleLen = latestCycle?.cycleLength ?? 28;
  const realDay = cycleDayFrom(latestCycle?.periodStartDate ?? null);
  const hasCycleData = realDay != null && realDay >= 1;

  const [currentDay, setCurrentDay] = useState(22);
  // Default the day view to the user's real current cycle day once it loads.
  useEffect(() => {
    if (hasCycleData) setCurrentDay(Math.min(realDay, 35));
  }, [realDay, hasCycleData]);

  const [loggedSymptoms, setLoggedSymptoms] = useState([]);
  const [activeTab, setActiveTab] = useState("tracker");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(null);
  const [periodDate, setPeriodDate] = useState("");
  const [logging, setLogging] = useState(false);
  const [logMsg, setLogMsg] = useState(null);

  const today = CYCLE_DAYS[Math.min(Math.max(currentDay,1),35)-1];
  const accuracy = prediction?.accuracyPct ?? calcAccuracy(3, true, false, 47);
  const toggleSymptom = (id) => setLoggedSymptoms(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  const saveSymptoms = async () => {
    setSaving(true);
    setSavedMsg(null);
    const res = await api.logSymptom({ cycle_day: currentDay, symptoms: loggedSymptoms });
    setSaving(false);
    setSavedMsg(res ? "Logged · Layer 2 recalculated" : "Sign in to sync your symptom logs");
  };

  const logPeriod = async () => {
    if (!periodDate) return;
    setLogging(true);
    setLogMsg(null);
    const res = await api.logCycle({ period_start_date: periodDate });
    setLogging(false);
    if (res) {
      setLogMsg("Period logged · predictions updated");
      setPeriodDate("");
      setReload((r) => r + 1); // refetch cycles + prediction
    } else {
      setLogMsg("Sign in to save your cycle");
    }
  };

  // Live prediction rows (fall back to the demo values when none on file yet).
  const predRows = [
    {label:"Next Period",   value: formatShort(prediction?.predictedPeriodStart) ?? "Jun 2",   days: dText(daysUntil(prediction?.predictedPeriodStart), "7 days"),      color:C.rose,   icon:"◎", conf: prediction?.confidencePct ?? 82},
    {label:"Ovulation",     value: formatShort(prediction?.predictedOvulation) ?? "Jun 9",      days: dText(daysUntil(prediction?.predictedOvulation), "14 days"),       color:C.gold,   icon:"○", conf: prediction?.confidencePct ?? 74},
    {label:"Fertile Window",value: (formatShort(prediction?.fertileWindowStart) && formatShort(prediction?.fertileWindowEnd)) ? `${formatShort(prediction.fertileWindowStart)}–${formatShort(prediction.fertileWindowEnd)}` : "Jun 7–12", days: dText(daysUntil(prediction?.fertileWindowStart), "Opens in 12d"), color:C.mint, icon:"◈", conf: prediction?.confidencePct ?? 70},
  ];

  // Build the current month grid, marking real period / fertile / ovulation days.
  const cal = (() => {
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    const lead = (new Date(y, m, 1).getDay() + 6) % 7; // Mon = 0
    const monthName = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const parse = (s) => (s ? new Date(`${s}T00:00:00`) : null);
    const pp = parse(prediction?.predictedPeriodStart);
    const lp = parse(latestCycle?.periodStartDate);
    const ov = parse(prediction?.predictedOvulation);
    const fs = parse(prediction?.fertileWindowStart);
    const fe = parse(prediction?.fertileWindowEnd);
    const within = (d, start, len) => start && d >= start && (d - start) / 86400000 < len;
    const days = [];
    for (let i = 0; i < lead; i++) days.push(null);
    for (let day = 1; day <= dim; day++) {
      const d = new Date(y, m, day);
      days.push({
        day,
        isToday: day === now.getDate(),
        isPeriod: within(d, pp, 5) || within(d, lp, 5),
        isOv: ov && d.toDateString() === ov.toDateString(),
        isFertile: fs && fe && d >= fs && d <= fe,
      });
    }
    return { monthName, days };
  })();

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl,marginBottom:10}}>Cycle Tracker</div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {["tracker","calendar","insights"].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${activeTab===tab?phaseColor(today.phase):"rgba(255,255,255,0.1)"}`,background:activeTab===tab?`${phaseColor(today.phase)}20`:"transparent",color:activeTab===tab?phaseColor(today.phase):"rgba(245,230,255,0.5)",fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer",textTransform:"capitalize"}}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 16px 28px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={phaseColor(today.phase)} size={200} opacity={0.1} x={80} y={-20}/>

        {activeTab==="tracker"&&<>
          <Card>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:hasCycleData?C.mint:"rgba(245,230,255,0.4)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>{hasCycleData?"Cycle Day":"Cycle Day · sample data"}</div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <button onClick={()=>setCurrentDay(Math.max(1,currentDay-1))} style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"none",color:C.pearl,fontSize:16,cursor:"pointer"}}>‹</button>
              <div style={{flex:1,textAlign:"center"}}>
                <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:40,color:phaseColor(today.phase),lineHeight:1,filter:`drop-shadow(0 0 12px ${phaseColor(today.phase)})`}}>Day {currentDay}</div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:phaseColor(today.phase),marginTop:2}}>{phaseLabel(today.phase)} Phase</div>
              </div>
              <button onClick={()=>setCurrentDay(Math.min(35,currentDay+1))} style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"none",color:C.pearl,fontSize:16,cursor:"pointer"}}>›</button>
            </div>
            <div style={{height:6,borderRadius:3,background:"rgba(255,255,255,0.08)",overflow:"hidden",marginBottom:8}}>
              <div style={{width:`${(currentDay/35)*100}%`,height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.rose},${C.mint},${C.gold},${C.purple})`,transition:"width 0.5s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.5)"}}>AI prediction confidence</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:700,color:C.mint}}>{accuracy}% · L1+L2+L3</span>
            </div>
          </Card>

          <Card style={{borderColor:`${C.rose}30`}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.rose,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{hasCycleData?"Log a new period":"Log your period · activates Layer 1"}</div>
            <div style={{display:"flex",gap:8}}>
              <input type="date" value={periodDate} max={new Date().toISOString().slice(0,10)} onChange={(e)=>setPeriodDate(e.target.value)}
                style={{flex:1,background:"rgba(26,10,46,0.6)",border:"1px solid rgba(195,155,211,0.3)",borderRadius:10,padding:"9px 12px",color:C.pearl,fontFamily:"DM Sans,sans-serif",fontSize:13,outline:"none",colorScheme:"dark"}}/>
              <button onClick={logPeriod} disabled={logging||!periodDate} style={{padding:"9px 16px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.fuchsia},${C.coral})`,color:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:600,cursor:logging||!periodDate?"default":"pointer",opacity:logging||!periodDate?0.6:1}}>{logging?"…":"Log"}</button>
            </div>
            {logMsg&&<div style={{marginTop:8,fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint}}>{logMsg}</div>}
            {hasCycleData&&<div style={{marginTop:8,fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.45)"}}>Last logged: {formatShort(latestCycle.periodStartDate)} · {cycles.length} cycle{cycles.length===1?"":"s"} on file</div>}
          </Card>

          <Card>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Predictions</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                ...predRows,
                {label:"PMS Window",value:"May 28–Jun 2",days:"Starts in 3d",color:C.purple,icon:"△",conf:88},
              ].map(item=>(
                <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:10,background:`${item.color}12`,border:`1px solid ${item.color}25`}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{color:item.color,fontSize:14}}>{item.icon}</span>
                    <div>
                      <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.pearl}}>{item.label}</div>
                      <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.4)"}}>{item.days} · AI: {item.conf}%</div>
                    </div>
                  </div>
                  <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:16,color:item.color}}>{item.value}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{borderColor:`${C.vaginal}30`,background:`rgba(233,30,140,0.05)`}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.vaginal,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Layer 3 · Biome Signal Today</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.75)",lineHeight:1.7}}>
              {today.phase==="luteal"&&"L. crispatus declining (as predicted by Layer 3). Hormonal inference confirms luteal phase. Progesterone estimated peak in 3 days. Biome-validated prediction confidence: 88%."}
              {today.phase==="follicular"&&"L. crispatus rising. Oestrogen inferred as increasing. Layer 3 confirms follicular phase. Biome signal strongly aligned with calendar prediction."}
              {today.phase==="ovulation"&&"Biome signal: peak L. crispatus dominance detected. pH most acidic (protective). Layer 3 confirms ovulation window open. Highest confidence prediction period."}
              {today.phase==="menstrual"&&"Vaginal diversity increasing. L. crispatus declining. Layer 3 confirms menstrual phase. This is normal — microbiome will restabilise in follicular phase."}
            </div>
          </Card>

          <Card>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Log Symptoms & Mood · Feeds Layer 2</div>
            {SYMPTOM_GROUPS.map(g=>(
              <div key={g.category} style={{marginBottom:12}}>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:g.color,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{g.category}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {g.items.map(s=>{
                    const on=loggedSymptoms.includes(s.id);
                    return (
                      <button key={s.id} onClick={()=>toggleSymptom(s.id)} style={{padding:"5px 10px",borderRadius:16,border:`1px solid ${on?g.color:"rgba(255,255,255,0.12)"}`,background:on?`${g.color}22`:"transparent",color:on?g.color:"rgba(245,230,255,0.55)",fontFamily:"DM Sans,sans-serif",fontSize:10,cursor:"pointer",display:"flex",gap:4,alignItems:"center"}}>
                        <span>{s.icon}</span>{s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {loggedSymptoms.length>0&&<div style={{marginTop:10,padding:"8px 10px",borderRadius:8,background:"rgba(233,30,140,0.1)",border:`1px solid ${C.coral}30`}}>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.coral}}>{loggedSymptoms.length} symptoms selected → improving Layer 2 pattern recognition</div>
            </div>}
            <button onClick={saveSymptoms} disabled={saving||loggedSymptoms.length===0} style={{marginTop:10,width:"100%",padding:"9px 12px",borderRadius:10,border:"none",background:`linear-gradient(135deg,${C.fuchsia},${C.coral})`,color:"#fff",fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,cursor:saving||loggedSymptoms.length===0?"default":"pointer",opacity:saving||loggedSymptoms.length===0?0.6:1}}>
              {saving?"Logging…":`Log Day ${currentDay} symptoms`}
            </button>
            {savedMsg&&<div style={{marginTop:8,fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textAlign:"center"}}>{savedMsg}</div>}
          </Card>

          <Card>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Estimated Hormones</div>
            {[
              {label:"Oestrogen",value:today.estrogen,max:100,color:C.rose},
              {label:"Progesterone",value:Math.min(today.progesterone*6,100),max:100,color:C.purple},
              {label:"LH Surge",value:today.lhSurge?100:5,max:100,color:C.gold},
            ].map(h=>(
              <div key={h.label} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.7)"}}>{h.label}</span>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:h.color}}>{h.value===100&&h.label==="LH Surge"?"Peak":h.label==="LH Surge"?"Low":`${h.value}%`}</span>
                </div>
                <div style={{height:5,borderRadius:3,background:"rgba(255,255,255,0.06)"}}>
                  <div style={{width:`${h.value}%`,height:"100%",borderRadius:3,background:h.color,filter:`drop-shadow(0 0 3px ${h.color})`}}/>
                </div>
              </div>
            ))}
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.35)",marginTop:4}}>Estimates from Layers 1 & 2 + biome inference. Add BBT for higher precision →</div>
          </Card>
        </>}

        {activeTab==="calendar"&&<>
          <Card>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>{cal.monthName}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
              {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.3)",textAlign:"center"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
              {cal.days.map((c,i)=>{
                if(!c) return <div key={`b${i}`}/>;
                const {day,isToday,isPeriod,isOv,isFertile}=c;
                return (
                  <div key={day} style={{aspectRatio:"1",borderRadius:8,background:isToday?C.coral:isPeriod?`${C.rose}40`:isOv?`${C.gold}40`:isFertile?`${C.mint}25`:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",border:isToday?`2px solid ${C.coral}`:isPeriod?`1px solid ${C.rose}50`:"none"}}>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,fontWeight:isToday?700:400,color:isToday?"white":isPeriod?C.rose:isOv?C.gold:"rgba(245,230,255,0.7)"}}>{day}</span>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:12,marginTop:12,flexWrap:"wrap"}}>
              {[{c:C.rose,l:"Period"},{c:C.gold,l:"Ovulation"},{c:C.mint,l:"Fertile"},{c:C.coral,l:"Today"}].map(x=>(
                <div key={x.l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:x.c}}/><span style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.5)"}}>{x.l}</span></div>
              ))}
            </div>
            {!hasCycleData&&<div style={{marginTop:10,fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.45)"}}>Log a period in the Tracker tab to see your predicted period, ovulation and fertile window here.</div>}
          </Card>
        </>}

        {activeTab==="insights"&&<>
          <Card>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✦ AI Cycle Intelligence</div>
            {[
              {label:"Regularity",value:"Very Regular",detail:"±1.2 days variance",color:C.mint},
              {label:"Avg cycle length",value:"28.1 days",detail:"Based on 3 cycles",color:C.mint},
              {label:"AI prediction error",value:"±1.4 days",detail:"Improving with each cycle",color:C.gold},
              {label:"Biome confidence",value:"Layer 3 active",detail:"Hormonal inference enabled",color:C.vaginal},
              {label:"Next upgrade",value:"Add wearable",detail:"BBT layer → ±0.8 days",color:C.purple},
            ].map((item,i)=>(
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.05)":"none"}}>
                <div>
                  <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.pearl}}>{item.label}</div>
                  <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.45)"}}>{item.detail}</div>
                </div>
                <Badge text={item.value} color={item.color}/>
              </div>
            ))}
          </Card>
        </>}
      </div>
    </div>
  );
}
