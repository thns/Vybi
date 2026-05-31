import { useState } from "react";
import { C, AI_LAYERS, CONFIDENCE_SIGNALS, calcAccuracy } from "../vybi-data.js";
import { Card, GlowOrb, Badge } from "../vybi-ui.jsx";
import { useDashboard } from "../useVybiData.ts";

export function AIEngineScreen() {
  const [expanded, setExpanded] = useState(null);
  const { prediction } = useDashboard();
  const hasWearable = prediction?.layersUsed?.includes("Wearable Fusion") ?? false;
  const [cyclesLogged] = useState(3);
  const [hasKit] = useState(true);
  const [symptomsLogged] = useState(47);
  // Live accuracy from the most recent engine run, with mock fallback.
  const currentAccuracy = prediction?.accuracyPct ?? calcAccuracy(cyclesLogged, hasKit, hasWearable, symptomsLogged);
  const maxAccuracy = calcAccuracy(6, true, true, 50);

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0",flexShrink:0}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl,marginBottom:2}}>AI Prediction Engine</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint,marginBottom:14}}>5-layer algorithm · Accuracy grows with your data</div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={C.fuchsia} size={220} opacity={0.12} x={60} y={-30}/>

        <Card style={{background:`linear-gradient(135deg,rgba(45,17,85,0.9),rgba(74,32,128,0.7))`}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
            <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
              <svg width={90} height={90} style={{transform:"rotate(-90deg)"}}>
                <circle cx={45} cy={45} r={36} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
                <circle cx={45} cy={45} r={36} fill="none" stroke="url(#accGrad)" strokeWidth={8}
                  strokeDasharray={2*Math.PI*36}
                  strokeDashoffset={2*Math.PI*36*(1-currentAccuracy/100)}
                  strokeLinecap="round" style={{filter:`drop-shadow(0 0 8px ${C.fuchsia})`}}/>
                <defs>
                  <linearGradient id="accGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={C.aqua}/>
                    <stop offset="50%" stopColor={C.amethyst}/>
                    <stop offset="100%" stopColor={C.fuchsia}/>
                  </linearGradient>
                </defs>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:22,fontWeight:700,color:C.pearl,fontFamily:"DM Sans,sans-serif"}}>{currentAccuracy}%</span>
                <span style={{fontSize:7,color:C.lavender,fontFamily:"DM Sans,sans-serif",letterSpacing:"0.06em"}}>ACCURACY</span>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl,marginBottom:4}}>Your current accuracy</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.6)",lineHeight:1.6,marginBottom:8}}>3 layers active. Connect a wearable + log 3 more cycles to reach <span style={{color:C.gold,fontWeight:600}}>{maxAccuracy}%</span></div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <div style={{height:4,flex:1,borderRadius:2,background:"rgba(255,255,255,0.08)"}}>
                  <div style={{width:`${(currentAccuracy/maxAccuracy)*100}%`,height:"100%",borderRadius:2,background:`linear-gradient(90deg,${C.aqua},${C.fuchsia})`}}/>
                </div>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold}}>{maxAccuracy}% max</span>
              </div>
            </div>
          </div>

          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>What's powering your accuracy</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {CONFIDENCE_SIGNALS.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:s.met?`${s.color}30`:"rgba(255,255,255,0.06)",border:`1px solid ${s.met?s.color:"rgba(255,255,255,0.12)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:9,color:s.met?s.color:"rgba(255,255,255,0.3)"}}>{s.met?"✓":"○"}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:s.met?C.pearl:"rgba(245,230,255,0.4)"}}>{s.label}</span>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:s.met?s.color:"rgba(245,230,255,0.3)",fontWeight:600}}>{s.impact}</span>
                  </div>
                  <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,0.06)",marginTop:3}}>
                    <div style={{width:s.met?`${(s.value/s.max)*100}%`:"0%",height:"100%",borderRadius:2,background:s.color}}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{borderColor:`${C.gold}40`,background:`rgba(255,215,0,0.06)`}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>✦ How Vybi compares</div>
          {[
            {label:"Regular cycles accuracy",flo:"90%",vybi:`${currentAccuracy}%`,vybiMax:"90%+",note:"Matches at 6 cycles + wearable"},
            {label:"Irregular cycles accuracy",flo:"65-70%",vybi:"~72%",vybiMax:"~85%",note:"Biome layer uniquely helps here"},
            {label:"Cold start (new user)",flo:"~60%",vybi:"~72%",vybiMax:"—",note:"Biome test gives day-1 advantage"},
            {label:"Biome-hormonal signal",flo:"❌ None",vybi:"✅ Unique",vybiMax:"—",note:"No competitor has this layer"},
          ].map((row,i)=>(
            <div key={i} style={{padding:"8px 0",borderBottom:i<3?"1px solid rgba(255,255,255,0.05)":"none"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.pearl,marginBottom:4}}>{row.label}</div>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{padding:"2px 8px",borderRadius:10,background:"rgba(255,255,255,0.06)",fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.5)"}}>Flo: {row.flo}</span>
                <span style={{padding:"2px 8px",borderRadius:10,background:`${C.coral}25`,border:`1px solid ${C.coral}40`,fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.coral}}>Vybi now: {row.vybi}</span>
                {row.vybiMax!=="—"&&<span style={{padding:"2px 8px",borderRadius:10,background:`${C.mint}20`,border:`1px solid ${C.mint}40`,fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint}}>Vybi max: {row.vybiMax}</span>}
              </div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.4)",marginTop:4}}>{row.note}</div>
            </div>
          ))}
        </Card>

        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em"}}>Algorithm Layers</div>
        {AI_LAYERS.map((layer,i)=>(
          <Card key={layer.id} style={{cursor:"pointer",borderColor:expanded===i?`${layer.color}50`:`${layer.color}20`,background:expanded===i?`${layer.color}08`:"rgba(45,17,85,0.55)"}}
            onClick={()=>setExpanded(expanded===i?null:i)}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{position:"relative",width:48,height:48,flexShrink:0}}>
                <svg width={48} height={48} style={{transform:"rotate(-90deg)"}}>
                  <circle cx={24} cy={24} r={20} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4}/>
                  <circle cx={24} cy={24} r={20} fill="none" stroke={layer.color} strokeWidth={4}
                    strokeDasharray={2*Math.PI*20}
                    strokeDashoffset={2*Math.PI*20*(1-(layer.status==="active"?1:layer.status==="ready"?0.6:layer.status==="pending"?0.3:0.1))}
                    strokeLinecap="round" style={{filter:`drop-shadow(0 0 4px ${layer.color})`}}/>
                </svg>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:8,fontWeight:700,color:layer.color}}>L{layer.num}</span>
                </div>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                  <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:17,color:C.pearl}}>{layer.name}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:layer.status==="active"?C.mint:layer.status==="ready"?C.gold:layer.status==="pending"?C.amber:C.sage,boxShadow:`0 0 4px ${layer.status==="active"?C.mint:layer.status==="ready"?C.gold:C.amber}`}}/>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.4)"}}>{expanded===i?"↑":"↓"}</span>
                  </div>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <Badge text={layer.label} color={layer.color}/>
                  <Badge text={layer.accuracyLabel} color={layer.status==="active"?C.mint:layer.status==="ready"?C.gold:C.amber}/>
                </div>
              </div>
            </div>

            {expanded===i&&<>
              <div style={{height:"1px",background:"rgba(255,255,255,0.07)",margin:"12px 0"}}/>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:layer.color,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>What it does</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.75)",lineHeight:1.7,marginBottom:12}}>{layer.what}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:layer.color,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>How it works</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.65)",lineHeight:1.7,marginBottom:12}}>{layer.how}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:layer.color,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Data inputs</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>
                {layer.inputs.map(inp=>(
                  <span key={inp} style={{padding:"3px 8px",borderRadius:10,background:`${layer.color}15`,border:`1px solid ${layer.color}30`,fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.7)"}}>{inp}</span>
                ))}
              </div>
              <div style={{padding:"8px 10px",borderRadius:10,background:`${layer.color}15`,border:`1px solid ${layer.color}30`}}>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:layer.color,marginBottom:3}}>Output</div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.pearl}}>{layer.output}</div>
              </div>
              {layer.biomeSignals&&<>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:layer.color,textTransform:"uppercase",letterSpacing:"0.07em",margin:"12px 0 6px"}}>Biome → Hormone Signal Map</div>
                {layer.biomeSignals.map((sig,j)=>(
                  <div key={j} style={{padding:"8px",borderRadius:8,background:"rgba(255,255,255,0.04)",marginBottom:5}}>
                    <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.pearl,fontWeight:600,marginBottom:2}}>If {sig.signal}</div>
                    <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:layer.color,marginBottom:4}}>→ {sig.inference}</div>
                    <div style={{height:4,borderRadius:2,background:"rgba(255,255,255,0.06)"}}>
                      <div style={{width:`${sig.confidence}%`,height:"100%",borderRadius:2,background:layer.color}}/>
                    </div>
                    <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.35)",marginTop:2}}>{sig.confidence}% confidence</div>
                  </div>
                ))}
              </>}
              {layer.patterns&&<>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:layer.color,textTransform:"uppercase",letterSpacing:"0.07em",margin:"12px 0 6px"}}>Your Detected Symptom Patterns</div>
                {layer.patterns.map((p,j)=>(
                  <div key={j} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:j<layer.patterns.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
                    <div>
                      <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.pearl}}>{p.symptom}</div>
                      <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.45)"}}>{p.day} · {p.phase}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:700,color:layer.color}}>{p.confidence}%</div>
                      <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.3)"}}>confidence</div>
                    </div>
                  </div>
                ))}
              </>}
              {layer.devices&&<>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:layer.color,textTransform:"uppercase",letterSpacing:"0.07em",margin:"12px 0 6px"}}>Compatible Devices</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {layer.devices.map(d=>(
                    <button key={d} style={{padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(245,230,255,0.6)",fontFamily:"DM Sans,sans-serif",fontSize:11,cursor:"pointer"}}>{d}</button>
                  ))}
                </div>
                <button style={{width:"100%",marginTop:10,padding:"10px",borderRadius:10,background:`${layer.color}20`,border:`1px solid ${layer.color}40`,color:layer.color,fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                  Connect a device → +9% accuracy
                </button>
              </>}
              <div style={{marginTop:12,padding:"8px 10px",borderRadius:8,background:layer.status==="active"?`${C.mint}12`:layer.status==="ready"?`${C.gold}12`:`rgba(255,255,255,0.04)`,border:`1px solid ${layer.status==="active"?C.mint:layer.status==="ready"?C.gold:"rgba(255,255,255,0.08)"}`}}>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:layer.status==="active"?C.mint:layer.status==="ready"?C.gold:"rgba(245,230,255,0.4)"}}>
                  {layer.status==="active"&&"✓ Active — contributing to your predictions now"}
                  {layer.status==="ready"&&"◎ Ready — order your first test kit to activate"}
                  {layer.status==="pending"&&"○ Pending — connect a wearable device to activate"}
                  {layer.status==="building"&&"◌ Building — improves automatically as community grows"}
                </div>
              </div>
            </>}
          </Card>
        ))}

        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Your accuracy roadmap</div>
          {[
            {milestone:"Today",accuracy:currentAccuracy,layers:"L1 + L2 + L3 active",color:C.mint,done:true},
            {milestone:"Connect wearable",accuracy:90,layers:"L4 activates",color:C.purple,done:false},
            {milestone:"6 cycles logged",accuracy:91,layers:"L2 fully trained",color:C.gold,done:false},
            {milestone:"Vybi community grows",accuracy:93,layers:"L5 population model",color:C.saliva,done:false},
          ].map((step,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<3?12:0,paddingBottom:i<3?12:0,borderBottom:i<3?"1px solid rgba(255,255,255,0.05)":"none"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:step.done?`${step.color}30`:"rgba(255,255,255,0.05)",border:`2px solid ${step.done?step.color:"rgba(255,255,255,0.15)"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:11,fontWeight:700,color:step.done?step.color:"rgba(245,230,255,0.3)",fontFamily:"DM Sans,sans-serif"}}>{step.done?"✓":i+1}</span>
                </div>
                {i<3&&<div style={{width:2,height:20,background:"rgba(255,255,255,0.06)",margin:"3px 0"}}/>}
              </div>
              <div style={{flex:1,paddingTop:4}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:step.done?C.cream:"rgba(245,230,255,0.5)"}}>{step.milestone}</span>
                  <span style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:18,color:step.color}}>{step.accuracy}%</span>
                </div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.4)"}}>{step.layers}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
