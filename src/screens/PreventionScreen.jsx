import { useState } from "react";
import { C, PREVENTION_RISKS } from "../vybi-data.js";
import { Card, Badge } from "../vybi-ui.jsx";

export function PreventionScreen() {
  const [sel, setSel] = useState(null);
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl,marginBottom:4}}>Prevention</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint,marginBottom:14}}>AI risk scores · Biome + cycle + lifestyle data</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:10}}>
        <Card style={{background:`linear-gradient(135deg,rgba(45,17,85,0.9),rgba(74,32,128,0.7))`}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
              <svg width={80} height={80} style={{transform:"rotate(-90deg)"}}>
                <circle cx={40} cy={40} r={32} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7}/>
                <circle cx={40} cy={40} r={32} fill="none" stroke={C.mint} strokeWidth={7}
                  strokeDasharray={2*Math.PI*32} strokeDashoffset={2*Math.PI*32*0.28}
                  strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${C.mint})`}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:18,fontWeight:700,color:C.mint,fontFamily:"DM Sans,sans-serif"}}>72</span>
                <span style={{fontSize:7,color:"rgba(245,230,255,0.5)",fontFamily:"DM Sans,sans-serif"}}>PROTECT</span>
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl,marginBottom:4}}>Good Protection</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.6)",lineHeight:1.6}}>2 moderate risks identified using biome + cycle data. Targeted actions could raise score to 88.</div>
            </div>
          </div>
        </Card>
        {PREVENTION_RISKS.map((risk,i)=>(
          <div key={i} onClick={()=>setSel(sel===i?null:i)}>
            <Card style={{cursor:"pointer",borderColor:sel===i?`${risk.color}50`:`${risk.color}20`,background:sel===i?`${risk.color}08`:"rgba(45,17,85,0.55)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:sel===i?12:0}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`${risk.color}20`,border:`1px solid ${risk.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{risk.icon}</div>
                  <div>
                    <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:600,color:C.pearl}}>{risk.condition}</div>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                      <div style={{height:4,width:60,borderRadius:2,background:"rgba(255,255,255,0.08)"}}>
                        <div style={{width:`${risk.score}%`,height:"100%",borderRadius:2,background:risk.color}}/>
                      </div>
                      <Badge text={risk.risk} color={risk.color}/>
                    </div>
                  </div>
                </div>
                <span style={{color:"rgba(255,255,255,0.3)",fontSize:14,marginTop:4}}>{sel===i?"↑":"↓"}</span>
              </div>
              {sel===i&&<>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>Risk Drivers</div>
                {risk.drivers.map((d,j)=>(
                  <div key={j} style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}>
                    <div style={{width:4,height:4,borderRadius:"50%",background:risk.color,flexShrink:0}}/>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.65)"}}>{d}</span>
                  </div>
                ))}
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:10,marginBottom:6}}>Actions</div>
                {risk.actions.map((a,j)=>(
                  <div key={j} style={{display:"flex",gap:8,alignItems:"center",padding:"6px 8px",borderRadius:8,background:`${risk.color}10`,marginBottom:5}}>
                    <span style={{color:risk.color,fontSize:12}}>→</span>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.pearl}}>{a}</span>
                  </div>
                ))}
              </>}
            </Card>
          </div>
        ))}
        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Share with your doctor</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.7)",lineHeight:1.6,marginBottom:10}}>Generate a clinical summary of biome scores, cycle data and prevention risks for your appointment.</div>
          <button style={{width:"100%",padding:"10px",borderRadius:10,background:`${C.mint}20`,border:`1px solid ${C.mint}40`,color:C.mint,fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>📄 Generate Doctor Report</button>
        </Card>
      </div>
    </div>
  );
}
