import { C } from "./vybi-data.js";

export function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{background:"var(--card-bg)",borderRadius:18,border:"1px solid var(--card-border)",padding:16,backdropFilter:"blur(12px)",boxShadow:"var(--card-shadow)",position:"relative",overflow:"hidden",flexShrink:0,...style}}>
      {children}
    </div>
  );
}

export function GlowOrb({ color, size=200, opacity=0.15, x=0, y=0 }) {
  return <div style={{position:"absolute",width:size,height:size,borderRadius:"50%",background:color,opacity,filter:"blur(60px)",left:x,top:y,pointerEvents:"none",zIndex:0}}/>;
}

export function Badge({ text, color }) {
  return <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:20,background:`${color}25`,color,border:`1px solid ${color}50`,fontFamily:"DM Sans,sans-serif",letterSpacing:"0.05em"}}>{text}</span>;
}

export function BiomeRing({ biome, size=80, showLabel=true }) {
  const circ = 2 * Math.PI * 30;
  const hasScore = biome.score != null && !Number.isNaN(biome.score);
  const offset = circ - ((hasScore ? biome.score : 0) / 100) * circ;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={30} fill="none" style={{stroke:"rgba(var(--surface-rgb),0.18)"}} strokeWidth={6}/>
          <circle cx={size/2} cy={size/2} r={30} fill="none" stroke={biome.color} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{filter:`drop-shadow(0 0 8px ${biome.color})`,transition:"stroke-dashoffset 1s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:16,color:biome.color}}>{biome.icon}</span>
          <span style={{fontSize:11,fontWeight:700,color:C.pearl,fontFamily:"DM Sans,sans-serif"}}>{hasScore?biome.score:"—"}</span>
        </div>
      </div>
      {showLabel && <span style={{fontSize:9,color:"rgba(var(--ink-rgb),0.6)",textAlign:"center",fontFamily:"DM Sans,sans-serif",maxWidth:60,lineHeight:1.2}}>{biome.name.split(" ")[0]}</span>}
    </div>
  );
}
