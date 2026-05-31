import { useState, useEffect, useRef } from "react";

// ─── VYBI APP ─────────────────────────────────────────────────────────────────
// App: VYBI — Vaginal · And · Body Intelligence
// v3: AI Engine with 5-layer algorithm stack built in

const C = {
  // Backgrounds
  deep:       "#1a0a2e",
  velvet:     "#2d1155",
  royal:      "#4a2080",
  // Purple scale
  amethyst:   "#9b59b6",
  lavender:   "#c39bd3",
  lilac:      "#e8d5f5",
  pearl:      "#f5e6ff",
  // Pinks / CTAs
  fuchsia:    "#e91e8c",
  bubblegum:  "#ff6eb4",
  blush:      "#ff9dc6",
  // Phase / accent colours
  aqua:       "#b8f0e6",
  gold:       "#ffd700",
  amber:      "#ff8c42",
  rose:       "#ff9dc6",
  // Biome colours
  vaginal:    "#e91e8c",
  gut:        "#ffd700",
  skin:       "#b8f0e6",
  oral:       "#c39bd3",
  // Aliases for compatibility
  cream:      "#f5e6ff",
  mint:       "#b8f0e6",
  coral:      "#e91e8c",
  sage:       "#9b59b6",
  saliva:     "#c39bd3",
  forest:     "#2d1155",
  moss:       "#4a2080",
  purple:     "#9b59b6",
};

// ─── AI ENGINE ────────────────────────────────────────────────────────────────
const AI_LAYERS = [
  {
    id:"kalman", num:1, name:"Kalman Filter",
    label:"Live from Day 1", color:C.mint, status:"active",
    accuracy:72, accuracyLabel:"72% accuracy",
    what:"Statistical smoothing of your cycle history. No data required beyond your first period log. Handles irregular early cycles automatically.",
    how:"Combines prior predictions with new observations on each cycle — the same mathematics used in GPS navigation, applied to your cycle length variance.",
    inputs:["Period start dates","Cycle length history","Period duration log"],
    output:"Baseline period prediction ±2.1 days",
    icon:"◉",
  },
  {
    id:"symptom", num:2, name:"Symptom Pattern Engine",
    label:"Activates after Cycle 2", color:C.gold, status:"active",
    accuracy:79, accuracyLabel:"79% accuracy",
    what:"Maps your logged symptoms to validated phase signatures. Your personal symptom fingerprint — cramps on Day 2, bloating Days 19-23, discharge change Day 13 — refines predictions uniquely to you.",
    how:"Rule-based expert system built on peer-reviewed symptom-phase correlations, personalised by your logged data over time. No other app has your specific pattern.",
    inputs:["Logged symptoms","Symptom timing","Severity patterns","Repeat cycles"],
    output:"Phase confirmation + ±1.4 day refinement",
    icon:"◈",
    patterns:[
      {symptom:"Cramps",day:"Days 1-3",confidence:94,phase:"Menstrual"},
      {symptom:"Bloating",day:"Days 19-23",confidence:87,phase:"Luteal"},
      {symptom:"Acne",day:"Days 18-24",confidence:82,phase:"Luteal"},
      {symptom:"Discharge change",day:"Days 12-15",confidence:78,phase:"Ovulation"},
    ],
  },
  {
    id:"biome", num:3, name:"Biome-Hormonal Inference",
    label:"Activates after first test kit", color:C.vaginal, status:"ready",
    accuracy:88, accuracyLabel:"88% accuracy",
    what:"Vybi's unique advantage. Your vaginal biome is a direct biological proxy for your hormonal state — something no other app can read. L. crispatus levels track oestrogen. Diversity shifts signal approaching menstruation.",
    how:"Peer-reviewed science confirms vaginal microbiota correlates with oestradiol levels (r=0.11, p<0.001). L. crispatus dominance = follicular/ovulation. Rising L. iners + diversity = late luteal. pH elevation = menstrual or dysbiotic state.",
    inputs:["L. crispatus %","L. iners %","Gardnerella level","pH value","Diversity index","CST type"],
    output:"Hormonal phase inference — especially powerful for irregular cycles",
    icon:"◈",
    biomeSignals:[
      {signal:"L. crispatus >70%",inference:"Follicular/Ovulation — oestrogen dominant",confidence:85},
      {signal:"L. iners rising + diversity ↑",inference:"Late luteal — period within 3-5 days",confidence:78},
      {signal:"pH >4.5 + Gardnerella present",inference:"Menstrual or dysbiotic state",confidence:82},
      {signal:"L. crispatus falling trend",inference:"Luteal — progesterone rising",confidence:74},
    ],
  },
  {
    id:"wearable", num:4, name:"BBT + Wearable Fusion",
    label:"Connect wearable to activate", color:C.purple, status:"pending",
    accuracy:90, accuracyLabel:"Up to 90% accuracy",
    what:"Wrist skin temperature rises ~0.3°C post-ovulation. Heart rate variability shifts measurably across cycle phases. Combined with your biome data, this is the most accurate non-invasive cycle intelligence outside a clinical setting.",
    how:"Published research (Nature Women's Health, 2025): wearable ML achieves 90% fertile window detection. BBT + HR: 89.6% menses accuracy. Oura's updated algorithm (2025): 45% more accurate ovulation detection for irregular cycles.",
    inputs:["Basal body temperature","Resting heart rate","HRV","Wrist skin temp","Respiratory rate"],
    output:"Ovulation detection ±1 day · Period ±0.8 days",
    icon:"◌",
    devices:["Apple Watch","Oura Ring","Garmin","Whoop","Samsung Galaxy Watch"],
  },
  {
    id:"population", num:5, name:"Population Learning",
    label:"Grows with Vybi community", color:C.saliva, status:"building",
    accuracy:93, accuracyLabel:"Up to 93% accuracy",
    what:"As the Vybi community grows, your predictions benefit from anonymised patterns across women with the same biome profile, cycle type and symptom fingerprint. Your accuracy improves even between your own logging sessions.",
    how:"Federated learning — models train on your device, only encrypted parameter updates are shared. Your raw health data never leaves your phone. Biome profile clustering means Vybi needs fewer users than Flo to achieve the same population accuracy boost.",
    inputs:["Anonymised biome clusters","Cycle type cohorts","Symptom pattern matching","Seasonal signals"],
    output:"Cold-start lift · Irregular cycle breakthrough",
    icon:"◎",
  },
];

const CONFIDENCE_SIGNALS = [
  {label:"Cycles logged",value:3,max:6,unit:"cycles",impact:"+20%",color:C.mint,met:true},
  {label:"Symptoms logged",value:47,max:50,unit:"entries",impact:"+8%",color:C.gold,met:true},
  {label:"Test kit completed",value:1,max:1,unit:"kit",impact:"+10%",color:C.vaginal,met:true},
  {label:"Wearable connected",value:0,max:1,unit:"device",impact:"+9%",color:C.purple,met:false},
  {label:"6+ cycles logged",value:3,max:6,unit:"cycles",impact:"+4%",color:C.saliva,met:false},
];

const calcAccuracy = (cycles,hasKit,hasWearable,symptoms) => {
  let b=62;
  if(cycles>=1)b+=10; if(cycles>=3)b+=6; if(cycles>=6)b+=4;
  if(symptoms>=10)b+=5; if(symptoms>=30)b+=3;
  if(hasKit)b+=10; if(hasWearable)b+=9;
  return Math.min(b,93);
};

// ─── APP DATA ─────────────────────────────────────────────────────────────────
const BIOMES = [
  {id:"vaginal",name:"Vaginal Biome",icon:"◈",color:C.vaginal,score:72,status:"Needs Attention",bacteria:"L. crispatus",trend:"↓",tags:["BV Risk: Low","pH: 4.2","Diversity: Mod"]},
  {id:"gut",name:"Gut Biome",icon:"◉",color:C.gut,score:85,status:"Healthy",bacteria:"B. longum",trend:"↑",tags:["Diversity: High","Inflam: Low","Transit: OK"]},
  {id:"skin",name:"Skin Biome",icon:"◌",color:C.skin,score:68,status:"Moderate",bacteria:"C. acnes",trend:"→",tags:["pH: 5.5","Hydration: 62%","Barrier: Mod"]},
  {id:"saliva",name:"Oral Biome",icon:"◎",color:C.oral,score:91,status:"Excellent",bacteria:"S. salivarius",trend:"↑",tags:["pH: 7.1","Cavity Risk: Low","Inflam: None"]},
];

const CYCLE_DAYS = Array.from({length:35},(_,i)=>({
  day:i+1,
  phase:i<5?"menstrual":i<13?"follicular":i<17?"ovulation":i<28?"luteal":"late",
  biomeScore:[65,68,70,72,70,74,76,78,80,82,84,86,85,84,83,82,80,78,76,74,72,70,68,72,70,68,72,74][i]||72,
  estrogen:i<12?20+i*5:i<14?80:i<28?40:20,
  progesterone:i<14?1:i<21?1+(i-14)*2:i<25?15:5,
  lhSurge:i===13||i===14,
}));

const SYMPTOMS_LIST = [
  {id:"cramps",label:"Cramps",icon:"⚡"},{id:"bloating",label:"Bloating",icon:"○"},
  {id:"headache",label:"Headache",icon:"◎"},{id:"fatigue",label:"Fatigue",icon:"◌"},
  {id:"mood",label:"Mood Swings",icon:"◇"},{id:"anxiety",label:"Anxiety",icon:"△"},
  {id:"acne",label:"Acne",icon:"◈"},{id:"discharge",label:"Discharge",icon:"◉"},
  {id:"dryness",label:"Dryness",icon:"○"},{id:"libido",label:"Low Libido",icon:"♡"},
  {id:"sleep",label:"Poor Sleep",icon:"◌"},{id:"backpain",label:"Back Pain",icon:"⚡"},
];

const PREVENTION_RISKS = [
  {condition:"Bacterial Vaginosis",risk:"Moderate",score:42,color:C.amber,icon:"◈",
   drivers:["Vaginal biome diversity elevated","pH trending up (4.2)","Post-menstrual window"],
   actions:["Take L. crispatus probiotic","Avoid scented products","Log discharge daily"]},
  {condition:"UTI Risk",risk:"Low",score:18,color:C.mint,icon:"◉",
   drivers:["Strong vaginal Lactobacillus","Good hydration logged","No recent antibiotics"],
   actions:["Maintain 2L water/day","Urinate post-intercourse","Monitor pH"]},
  {condition:"Gut Dysbiosis",risk:"Low",score:22,color:C.mint,icon:"◉",
   drivers:["Excellent Firmicutes ratio","High diversity score","Regular movement logged"],
   actions:["Continue fermented foods","Maintain fibre intake","Retest in 3 months"]},
  {condition:"Skin Imbalance",risk:"Moderate",score:38,color:C.amber,icon:"◌",
   drivers:["C. acnes elevated in luteal","Low hydration Days 18-22","Stress logged"],
   actions:["Microbiome-friendly cleanser","Avoid over-washing","Probiotic skincare"]},
  {condition:"PCOS Indicators",risk:"Low",score:14,color:C.mint,icon:"◇",
   drivers:["Regular 28-day cycles","Ovulation confirmed","Testosterone normal"],
   actions:["Monitor cycle length","Log androgen symptoms","Annual bloods advised"]},
];

const MICROBE_REPORT = {
  vaginal:{dominant:"Lactobacillus crispatus",dominance:61,secondary:["L. iners (18%)","Gardnerella vaginalis (12%)","Prevotella (6%)","Other (3%)"],cstType:"CST I",bvRisk:"Low",phValue:4.2,diversity:"Moderate",fungi:"Candida albicans <1%",trend:"L. crispatus -18% vs Mar 2026",interpretation:"Lactobacillus-dominant (healthy) but crispatus declining post-menstruation. L. iners rising — transitional state. Action recommended.",alert:true},
  gut:{dominant:"Bifidobacterium longum",dominance:24,secondary:["F. prausnitzii (18%)","A. muciniphila (12%)","Lactobacillus (8%)","Other (38%)"],diversity:"High (Shannon: 4.2)",firmicutesBacteroidetes:"1.8:1 — optimal",inflammation:"Calprotectin: Low",interpretation:"Excellent gut diversity. F. prausnitzii and Akkermansia indicate strong anti-inflammatory activity. No action required.",alert:false},
  skin:{dominant:"Cutibacterium acnes",dominance:31,secondary:["S. epidermidis (28%)","Malassezia (15%)","Corynebacterium (14%)","Other (12%)"],barrier:"62% — slightly reduced",phValue:5.5,interpretation:"Mild C. acnes elevation correlating with luteal phase. Barrier slightly compromised — linked to logged stress Days 18-22.",alert:true},
  saliva:{dominant:"Streptococcus salivarius",dominance:34,secondary:["S. mitis (22%)","Veillonella (16%)","Rothia (13%)","Other (15%)"],diversity:"High",cavityRisk:"Low",gumHealth:"Good",interpretation:"Excellent oral microbiome. S. mutans <2%. No action required.",alert:false},
};

const HEALTH_METRICS = [
  {label:"Sleep",value:"6.8h",status:"Fair",color:C.purple,icon:"◌",trend:"↓",tip:"Aim 7-9h. Luteal phase reduces sleep quality."},
  {label:"Stress",value:"Moderate",status:"Watch",color:C.amber,icon:"△",trend:"↑",tip:"Elevated stress lowers L. crispatus. Try breathwork."},
  {label:"Hydration",value:"1.6L",status:"Low",color:C.coral,icon:"○",trend:"→",tip:"Below 2L target. UTI risk increases."},
  {label:"Exercise",value:"3x/wk",status:"Good",color:C.mint,icon:"◉",trend:"↑",tip:"Great. Moderate exercise supports gut diversity."},
  {label:"Nutrition",value:"Varied",status:"Good",color:C.mint,icon:"◈",trend:"→",tip:"Add fermented foods to support vaginal biome."},
  {label:"Weight",value:"BMI 23.1",status:"Healthy",color:C.mint,icon:"◎",trend:"→",tip:"Optimal BMI supports hormonal balance."},
];

const NAV = [
  {id:"Home",icon:"⌂",label:"Home"},
  {id:"Cycle",icon:"◎",label:"Cycle"},
  {id:"Biomes",icon:"◈",label:"Biomes"},
  {id:"AI Engine",icon:"◉",label:"AI"},
  {id:"Chat",icon:"◇",label:"Chat"},
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const phaseColor=p=>({menstrual:C.rose,follicular:C.lavender,ovulation:C.aqua,luteal:C.amethyst,late:C.fuchsia}[p]||C.lavender);
const phaseLabel=p=>({menstrual:"Menstrual",follicular:"Follicular",ovulation:"Ovulation",luteal:"Luteal",late:"Late Luteal"}[p]||p);

function Card({children,style={}}) {
  return <div style={{background:"rgba(45,17,85,0.55)",borderRadius:18,border:"1px solid rgba(195,155,211,0.2)",padding:16,backdropFilter:"blur(12px)",position:"relative",overflow:"hidden",...style}}>{children}</div>;
}
function GlowOrb({color,size=200,opacity=0.15,x=0,y=0}) {
  return <div style={{position:"absolute",width:size,height:size,borderRadius:"50%",background:color,opacity,filter:"blur(60px)",left:x,top:y,pointerEvents:"none",zIndex:0}}/>;
}
function Badge({text,color}) {
  return <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:20,background:`${color}25`,color,border:`1px solid ${color}50`,fontFamily:"DM Sans,sans-serif",letterSpacing:"0.05em"}}>{text}</span>;
}
function BiomeRing({biome,size=80,showLabel=true}) {
  const circ=2*Math.PI*30, offset=circ-(biome.score/100)*circ;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={30} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6}/>
          <circle cx={size/2} cy={size/2} r={30} fill="none" stroke={biome.color} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{filter:`drop-shadow(0 0 8px ${biome.color})`,transition:"stroke-dashoffset 1s ease"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:16,color:biome.color}}>{biome.icon}</span>
          <span style={{fontSize:11,fontWeight:700,color:C.pearl,fontFamily:"DM Sans,sans-serif"}}>{biome.score}</span>
        </div>
      </div>
      {showLabel&&<span style={{fontSize:9,color:"rgba(245,230,255,0.6)",textAlign:"center",fontFamily:"DM Sans,sans-serif",maxWidth:60,lineHeight:1.2}}>{biome.name.split(" ")[0]}</span>}
    </div>
  );
}

// ─── AI ENGINE SCREEN ─────────────────────────────────────────────────────────
function AIEngineScreen() {
  const [expanded,setExpanded]=useState(null);
  const [cyclesLogged]=useState(3);
  const [hasKit]=useState(true);
  const [hasWearable]=useState(false);
  const [symptomsLogged]=useState(47);
  const currentAccuracy=calcAccuracy(cyclesLogged,hasKit,hasWearable,symptomsLogged);
  const maxAccuracy=calcAccuracy(6,true,true,50);

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0",flexShrink:0}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl,marginBottom:2}}>AI Prediction Engine</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint,marginBottom:14}}>5-layer algorithm · Accuracy grows with your data</div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={C.fuchsia} size={220} opacity={0.12} x={60} y={-30}/>

        {/* Live accuracy gauge */}
        <Card style={{background:`linear-gradient(135deg,rgba(45,17,85,0.9),rgba(74,32,128,0.7))`}}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:14}}>
            <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
              <svg width={90} height={90} style={{transform:"rotate(-90deg)"}}>
                <circle cx={45} cy={45} r={36} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
                <circle cx={45} cy={45} r={36} fill="none"
                  stroke={`url(#accGrad)`} strokeWidth={8}
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

          {/* Confidence signals */}
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

        {/* Comparison to Flo */}
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

        {/* Layer cards */}
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em"}}>Algorithm Layers</div>
        {AI_LAYERS.map((layer,i)=>(
          <div key={layer.id}>
            <Card style={{cursor:"pointer",borderColor:expanded===i?`${layer.color}50`:`${layer.color}20`,background:expanded===i?`${layer.color}08`:"rgba(45,17,85,0.55)"}}
              onClick={()=>setExpanded(expanded===i?null:i)}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                {/* Layer number ring */}
                <div style={{position:"relative",width:48,height:48,flexShrink:0}}>
                  <svg width={48} height={48} style={{transform:"rotate(-90deg)"}}>
                    <circle cx={24} cy={24} r={20} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4}/>
                    <circle cx={24} cy={24} r={20} fill="none" stroke={layer.color} strokeWidth={4}
                      strokeDasharray={2*Math.PI*20}
                      strokeDashoffset={2*Math.PI*20*(1-(layer.status==="active"?1:layer.status==="ready"?0.6:layer.status==="pending"?0.3:0.1))}
                      strokeLinecap="round" style={{filter:`drop-shadow(0 0 4px ${layer.color})`}}/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
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

                {/* Biome signals table */}
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

                {/* Symptom patterns table */}
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

                {/* Wearable devices */}
                {layer.devices&&<>
                  <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:layer.color,textTransform:"uppercase",letterSpacing:"0.07em",margin:"12px 0 6px"}}>Compatible Devices</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {layer.devices.map(d=>(
                      <button key={d} style={{padding:"5px 10px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(245,230,255,0.6)",fontFamily:"DM Sans,sans-serif",fontSize:11,cursor:"pointer"}}>
                        {d}
                      </button>
                    ))}
                  </div>
                  <button style={{width:"100%",marginTop:10,padding:"10px",borderRadius:10,background:`${layer.color}20`,border:`1px solid ${layer.color}40`,color:layer.color,fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>
                    Connect a device → +9% accuracy
                  </button>
                </>}

                {/* Status indicator */}
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
          </div>
        ))}

        {/* Roadmap */}
        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Your accuracy roadmap</div>
          {[
            {milestone:"Today",accuracy:currentAccuracy,layers:"L1 + L2 + L3 active",color:C.mint,done:true},
            {milestone:"Connect wearable",accuracy:90,layers:"L4 activates",color:C.purple,done:false},
            {milestone:"6 cycles logged",accuracy:91,layers:"L2 fully trained",color:C.gold,done:false},
            {milestone:"Vybi community grows",accuracy:93,layers:"L5 population model",color:C.saliva,done:false},
          ].map((step,i)=>(
            <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:i<3?12:0,paddingBottom:i<3?12:0,borderBottom:i<3?"1px solid rgba(255,255,255,0.05)":"none"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
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

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
function HomeScreen({setScreen}) {
  const today=CYCLE_DAYS[21];
  const overall=Math.round(BIOMES.reduce((a,b)=>a+b.score,0)/BIOMES.length);
  const accuracy=calcAccuracy(3,true,false,47);
  return (
    <div style={{padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12,overflowY:"auto",height:"100%"}}>
      <GlowOrb color={C.fuchsia} size={200} opacity={0.15} x={100} y={-30}/>
      <div style={{paddingTop:16}}>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint,letterSpacing:"0.1em",textTransform:"uppercase"}}>Day 22 · Luteal Phase</div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:28,color:C.pearl}}>Your Vybi Today</div>
      </div>

      <Card style={{background:`linear-gradient(135deg,rgba(45,17,85,0.9),rgba(74,32,128,0.7))`}}>
        <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:phaseColor("luteal"),boxShadow:`0 0 8px ${phaseColor("luteal")}`}}/>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:phaseColor("luteal"),fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>Luteal Phase</span>
            </div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl,marginBottom:2}}>Period in 7 days</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.55)"}}>AI confidence: <span style={{color:C.mint,fontWeight:600}}>{accuracy}%</span> · 3 layers active</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:32,color:C.gold}}>{overall}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:8,color:C.mint,letterSpacing:"0.1em"}}>VYBI SCORE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[{label:"Period in 7d",color:C.rose},{label:"Ovulation in 14d",color:C.gold},{label:"AI: 82% confident",color:C.mint}].map(item=>(
            <div key={item.label} style={{flex:1,padding:"6px 8px",borderRadius:8,background:`${item.color}15`,border:`1px solid ${item.color}30`,textAlign:"center"}}>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:item.color,fontWeight:600}}>{item.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>All Biomes</div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          {BIOMES.map(b=><BiomeRing key={b.id} biome={b} size={68}/>)}
        </div>
      </Card>

      {/* AI accuracy nudge */}
      <Card style={{borderColor:`${C.purple}40`,background:`rgba(155,89,182,0.07)`,cursor:"pointer"}} onClick={()=>setScreen("AI Engine")}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${C.purple}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>◉</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.purple,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>AI Accuracy: {accuracy}%</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:17,color:C.pearl,marginBottom:4}}>Connect wearable → unlock 90%</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.6)"}}>3 of 5 algorithm layers active. View your AI engine →</div>
          </div>
        </div>
      </Card>

      <Card style={{borderColor:`${C.amber}50`,background:`rgba(255,140,66,0.07)`,cursor:"pointer"}} onClick={()=>setScreen("Prevention")}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:8,background:`${C.amber}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>△</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.amber,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>Prevention Alert</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:17,color:C.pearl,marginBottom:4}}>BV risk elevated this week</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.6)"}}>L. crispatus -18% post-period. Biome layer flagged. Take action →</div>
          </div>
        </div>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {label:"AI Engine",icon:"◉",color:C.purple,screen:"AI Engine"},
          {label:"Microbe Report",icon:"🧬",color:C.mint,screen:"Microbe Report"},
          {label:"Prevention",icon:"△",color:C.amber,screen:"Prevention"},
          {label:"General Health",icon:"◈",color:C.gold,screen:"General Health"},
        ].map(item=>(
          <Card key={item.label} style={{padding:12,cursor:"pointer"}} onClick={()=>setScreen(item.screen)}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:18,color:item.color}}>{item.icon}</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:C.pearl}}>{item.label}</span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✦ Biome-Cycle Insight</div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:18,color:C.pearl,marginBottom:6}}>Your biome predicted this dip</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.65)",lineHeight:1.7}}>Layer 3 detected L. crispatus declining 4 days before your symptoms appeared. Biome data gives Vybi a 3-5 day early warning that calendar-only apps cannot see.</div>
      </Card>
    </div>
  );
}

// ─── CYCLE SCREEN ──────────────────────────────────────────────────────────────
function CycleScreen() {
  const [currentDay,setCurrentDay]=useState(22);
  const [loggedSymptoms,setLoggedSymptoms]=useState(["cramps","bloating","acne"]);
  const [activeTab,setActiveTab]=useState("tracker");
  const today=CYCLE_DAYS[currentDay-1];
  const accuracy=calcAccuracy(3,true,false,47);
  const toggleSymptom=(id)=>setLoggedSymptoms(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

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

      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={phaseColor(today.phase)} size={200} opacity={0.1} x={80} y={-20}/>

        {activeTab==="tracker"&&<>
          <Card>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Cycle Day</div>
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
            {/* AI confidence for this day */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.5)"}}>AI prediction confidence</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:700,color:C.mint}}>{accuracy}% · L1+L2+L3</span>
            </div>
          </Card>

          <Card>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Predictions</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"Next Period",value:"Jun 2",days:"7 days",color:C.rose,icon:"◎",conf:82},
                {label:"Ovulation",value:"Jun 9",days:"14 days",color:C.gold,icon:"○",conf:74},
                {label:"Fertile Window",value:"Jun 7–12",days:"Opens in 12d",color:C.mint,icon:"◈",conf:70},
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
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Log Symptoms · Feeds Layer 2</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {SYMPTOMS_LIST.map(s=>(
                <button key={s.id} onClick={()=>toggleSymptom(s.id)} style={{padding:"6px 11px",borderRadius:16,border:`1px solid ${loggedSymptoms.includes(s.id)?C.coral:"rgba(255,255,255,0.12)"}`,background:loggedSymptoms.includes(s.id)?`${C.coral}20`:"transparent",color:loggedSymptoms.includes(s.id)?C.coral:"rgba(245,230,255,0.5)",fontFamily:"DM Sans,sans-serif",fontSize:10,cursor:"pointer",display:"flex",gap:4,alignItems:"center"}}>
                  <span>{s.icon}</span>{s.label}
                </button>
              ))}
            </div>
            {loggedSymptoms.length>0&&<div style={{marginTop:10,padding:"8px 10px",borderRadius:8,background:"rgba(233,30,140,0.1)",border:`1px solid ${C.coral}30`}}>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.coral}}>{loggedSymptoms.length} symptoms logged → improving Layer 2 pattern recognition</div>
            </div>}
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
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>June 2026</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>
              {["M","T","W","T","F","S","S"].map((d,i)=><div key={i} style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.3)",textAlign:"center"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
              {Array.from({length:30},(_,i)=>{
                const day=i+1, cycleDay=((day+21)%35)+1;
                const isToday=day===26, isPeriod=cycleDay<=5;
                const isOvulation=cycleDay>=14&&cycleDay<=16;
                const isFertile=cycleDay>=12&&cycleDay<=18;
                return (
                  <div key={day} style={{aspectRatio:"1",borderRadius:8,background:isToday?C.coral:isPeriod?`${C.rose}40`:isOvulation?`${C.gold}40`:isFertile?`${C.mint}25`:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",border:isToday?`2px solid ${C.coral}`:isPeriod?`1px solid ${C.rose}50`:"none",cursor:"pointer"}}>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,fontWeight:isToday?700:400,color:isToday?"white":isPeriod?C.rose:isOvulation?C.gold:"rgba(245,230,255,0.7)"}}>{day}</span>
                  </div>
                );
              })}
            </div>
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

// ─── BIOMES SCREEN ────────────────────────────────────────────────────────────
function BiomesScreen() {
  const [selected,setSelected]=useState(0);
  const b=BIOMES[selected];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl,marginBottom:10}}>My Biomes</div>
        <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {BIOMES.map((biome,i)=>(
            <button key={biome.id} onClick={()=>setSelected(i)} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${selected===i?biome.color:"rgba(255,255,255,0.1)"}`,background:selected===i?`${biome.color}20`:"transparent",color:selected===i?biome.color:"rgba(245,230,255,0.5)",fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
              {biome.icon} {biome.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={b.color} size={220} opacity={0.15} x={80} y={-20}/>
        <Card style={{borderColor:`${b.color}40`}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <BiomeRing biome={b} size={88} showLabel={false}/>
            <div style={{flex:1}}>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl,marginBottom:4}}>{b.name}</div>
              <Badge text={b.status} color={b.color}/>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.55)",marginTop:6}}>Dominant: <em style={{color:b.color}}>{b.bacteria}</em></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
                {b.tags.map(t=><span key={t} style={{fontSize:9,padding:"2px 7px",borderRadius:10,background:"rgba(255,255,255,0.06)",color:"rgba(245,230,255,0.6)",fontFamily:"DM Sans,sans-serif"}}>{t}</span>)}
              </div>
            </div>
          </div>
        </Card>
        {b.id==="vaginal"&&<Card style={{borderColor:`${C.coral}40`,background:`rgba(233,30,140,0.07)`}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.coral,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Layer 3 · Live signal</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.75)",lineHeight:1.7}}>L. crispatus at 61% — declining from 75% (March test). This biome shift predicted your luteal phase transition 3 days before your symptoms appeared. Current signal: late luteal, period in ~7 days.</div>
        </Card>}
        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Score History</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60}}>
            {[65,70,78,72,68,b.score].map((v,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:"100%",borderRadius:4,background:i===5?b.color:`${b.color}40`,height:`${(v/100)*56}px`,filter:i===5?`drop-shadow(0 0 4px ${b.color})`:"none"}}/>
                <span style={{fontSize:8,color:"rgba(245,230,255,0.3)",fontFamily:"DM Sans,sans-serif"}}>W{i+1}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Recommendations</div>
          {[
            {icon:"💊",text:b.id==="vaginal"?"L. crispatus probiotic daily":b.id==="gut"?"Continue fermented foods":b.id==="skin"?"Microbiome-friendly cleanser":"Xylitol mints daily",type:"Supplement"},
            {icon:"🥗",text:b.id==="vaginal"?"Reduce sugar — feeds Gardnerella":b.id==="gut"?"30 plant types per week":b.id==="skin"?"Anti-inflammatory diet":"Limit mouthwash — disrupts oral microbiome",type:"Diet"},
            {icon:"🧬",text:"Retest in 18 days",type:"Test"},
          ].map((r,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<2?10:0,paddingBottom:i<2?10:0,borderBottom:i<2?"1px solid rgba(255,255,255,0.06)":"none"}}>
              <span style={{fontSize:18}}>{r.icon}</span>
              <div>
                <span style={{fontSize:9,padding:"2px 6px",borderRadius:8,background:`${b.color}20`,color:b.color,fontFamily:"DM Sans,sans-serif",marginBottom:3,display:"inline-block"}}>{r.type}</span>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.8)",lineHeight:1.5}}>{r.text}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ─── MICROBE REPORT ───────────────────────────────────────────────────────────
function MicrobeReportScreen() {
  const [selected,setSelected]=useState("vaginal");
  const r=MICROBE_REPORT[selected];
  const biome=BIOMES.find(b=>b.id===selected);
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl,marginBottom:4}}>Microbe Report</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint,marginBottom:12}}>May 2026 · Test Kit #3 · Powers Layer 3</div>
        <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4}}>
          {BIOMES.map(b=>(
            <button key={b.id} onClick={()=>setSelected(b.id)} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${selected===b.id?b.color:"rgba(255,255,255,0.1)"}`,background:selected===b.id?`${b.color}20`:"transparent",color:selected===b.id?b.color:"rgba(245,230,255,0.5)",fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5}}>
              {b.icon} {b.name.split(" ")[0]}
              {MICROBE_REPORT[b.id].alert&&<span style={{width:6,height:6,borderRadius:"50%",background:C.amber}}/>}
            </button>
          ))}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:12}}>
        <GlowOrb color={biome?.color||C.mint} size={180} opacity={0.1} x={100} y={0}/>

        {r.alert&&<Card style={{borderColor:`${C.amber}50`,background:`rgba(255,140,66,0.08)`}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:18}}>⚠️</span>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.amber,lineHeight:1.6}}>Action recommended · This data is powering Layer 3 predictions</div>
          </div>
        </Card>}

        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Dominant Microorganism</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${biome?.color||C.mint}20`,border:`1px solid ${biome?.color||C.mint}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🦠</div>
            <div>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:20,color:C.pearl,fontStyle:"italic"}}>{r.dominant}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.5)"}}>Dominance: {r.dominance}%</div>
            </div>
          </div>
          <div style={{height:10,borderRadius:5,background:"rgba(255,255,255,0.06)",overflow:"hidden",marginBottom:10}}>
            <div style={{width:`${r.dominance}%`,height:"100%",borderRadius:5,background:`linear-gradient(90deg,${biome?.color||C.mint},${biome?.color||C.mint}80)`}}/>
          </div>
          {r.secondary.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<r.secondary.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.55)",fontStyle:"italic"}}>{s.split(" (")[0]}</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.35)"}}>{s.match(/\(.*\)/)?.[0]||""}</span>
            </div>
          ))}
        </Card>

        {r.trend&&<Card style={{borderColor:`${C.amber}40`}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.amber,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>Trend → Layer 3 input</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.75)"}}>{r.trend}</div>
        </Card>}

        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✦ Vybi Interpretation</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,color:"rgba(245,230,255,0.8)",lineHeight:1.75}}>{r.interpretation}</div>
        </Card>
      </div>
    </div>
  );
}

// ─── PREVENTION SCREEN ────────────────────────────────────────────────────────
function PreventionScreen() {
  const [sel,setSel]=useState(null);
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

// ─── GENERAL HEALTH ───────────────────────────────────────────────────────────
function GeneralHealthScreen() {
  return (
    <div style={{padding:"16px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>General Health</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint}}>Lifestyle factors · Biome impact · Wearable sync</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {HEALTH_METRICS.map(m=>(
          <Card key={m.label} style={{padding:10,textAlign:"center"}}>
            <div style={{fontSize:18,marginBottom:4}}>{m.icon}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:"rgba(245,230,255,0.4)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{m.label}</div>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:14,color:m.color,marginBottom:2}}>{m.value}</div>
            <Badge text={m.status} color={m.color}/>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Biome Impact · Lifestyle</div>
        {HEALTH_METRICS.map((m,i)=>(
          <div key={m.label} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:i<HEALTH_METRICS.length-1?12:0,paddingBottom:i<HEALTH_METRICS.length-1?12:0,borderBottom:i<HEALTH_METRICS.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
            <span style={{fontSize:16,color:m.color}}>{m.icon}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:C.pearl}}>{m.label}</span>
                <span style={{fontSize:12,color:m.trend==="↑"?C.mint:m.trend==="↓"?C.coral:C.gold}}>{m.trend}</span>
              </div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.6)",lineHeight:1.6}}>{m.tip}</div>
            </div>
          </div>
        ))}
      </Card>
      <Card style={{borderColor:`${C.gold}40`,background:`rgba(255,215,0,0.06)`}}>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>✦ Connect Wearable → Unlock Layer 4</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.7)",lineHeight:1.6,marginBottom:10}}>BBT + HRV data from your wearable activates Layer 4 of the AI engine, pushing prediction accuracy from {calcAccuracy(3,true,false,47)}% to ~90%.</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Apple Health","Oura Ring","Garmin"].map(w=>(
            <button key={w} style={{padding:"6px 12px",borderRadius:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"rgba(245,230,255,0.7)",fontFamily:"DM Sans,sans-serif",fontSize:11,cursor:"pointer"}}>{w}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── CHAT SCREEN ─────────────────────────────────────────────────────────────
function ChatScreen() {
  const init=[
    {role:"vybi",text:"Hello! I'm Vybi. I can see your cycle data, biome scores, symptom logs and AI layer status. What would you like to explore?"},
    {role:"user",text:"Why did my vaginal score drop?"},
    {role:"vybi",text:"Layer 3 flagged this. Your L. crispatus fell from 75% (March test) to 61% (May test) — an 18% decline.\n\nCross-referencing with Layer 1 and Layer 2: you're on Day 22 (luteal phase), which is the most common time for this. Rising progesterone reduces vaginal glycogen, starving Lactobacillus.\n\nYour logged stress on Days 18-20 compounded this. pH is still 4.2 (safe range), so no infection — but the trend needs reversing.\n\nShall I build your restore plan?"},
    {role:"user",text:"How accurate is your period prediction?"},
    {role:"vybi",text:"Currently 82% for your next period (3 layers active).\n\nBreakdown:\n• Layer 1 (Kalman): ±2.1 days baseline\n• Layer 2 (Symptom pattern): refined to ±1.4 days\n• Layer 3 (Biome inference): L. crispatus trend confirms late luteal\n\nTo reach 90%: connect a wearable. BBT data activates Layer 4, cutting error to ±0.8 days. Flo's 90% took 8 cycles + wearable. You're on track for cycle 6."},
  ];
  const [messages,setMessages]=useState(init);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[messages]);
  const send=()=>{
    if(!input.trim())return;
    setMessages(m=>[...m,{role:"user",text:input}]);
    setInput("");setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMessages(m=>[...m,{role:"vybi",text:"Based on your current data: Day 22, biome Layer 3 active, 3 cycles logged. Your gut score is excellent (85) — this is actually supporting your vaginal recovery through the gut-vaginal axis. Keep up fermented foods. Want me to cross-reference this with your May symptom logs?"}]);
    },2000);
  };
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 16px 10px",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>Vybi AI</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint}}>Biome + Cycle aware · {calcAccuracy(3,true,false,47)}% accuracy · 3 layers active</div>
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

// ─── SUBSCRIPTION SCREEN ──────────────────────────────────────────────────────
function SubscriptionScreen() {
  const [sel,setSel]=useState("core");
  const plans=[
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

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsScreen() {
  const toggles=[
    {label:"Anonymous Mode",desc:"No identity linked to health data",on:false,color:C.coral},
    {label:"Partner Sharing",desc:"Share cycle & biome with partner",on:true,color:C.mint},
    {label:"Push Notifications",desc:"Reminders, results & insights",on:true,color:C.gold},
    {label:"Biometric Lock",desc:"Face ID / Fingerprint",on:true,color:C.saliva},
    {label:"Research Opt-in",desc:"Contribute anonymised data",on:false,color:C.sage},
  ];
  const [states,setStates]=useState(toggles.map(t=>t.on));
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
        {toggles.map((t,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i<toggles.length-1?14:0,paddingBottom:i<toggles.length-1?14:0,borderBottom:i<toggles.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
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

function OnboardingScreen({onComplete}) {
  const [step,setStep]=useState(0);
  const steps=[
    {icon:"◎",title:"Meet Vybi",sub:"Your whole-body biome companion",body:"Vybi is the world's first app combining menstrual cycle intelligence with all four of your microbiomes — vaginal, gut, skin and oral.",color:C.coral},
    {icon:"◉",title:"5-Layer AI Engine",sub:"Gets smarter with your data",body:"Vybi uses a 5-layer algorithm stack. 3 layers activate from day one — including the biome-hormonal inference layer no competitor has.",color:C.gold},
    {icon:"◈",title:"Biome tells the truth",sub:"Your hormones written in bacteria",body:"Your vaginal biome tracks your oestrogen levels. L. crispatus rises at ovulation. This biological signal gives Vybi a 3-5 day early warning that calendar apps cannot see.",color:C.vaginal},
    {icon:"○",title:"Private by design",sub:"Anonymous Mode. ISO 27001.",body:"Your biome data is your most personal health data. No one — not even Vybi — can identify you in Anonymous Mode.",color:C.mint},
  ];
  const s=steps[step];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <GlowOrb color={s.color} size={300} opacity={0.15} x={-50} y={-50}/>
      <div style={{textAlign:"center",zIndex:1,flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:16}}>
        <div style={{fontSize:60,color:s.color,filter:`drop-shadow(0 0 20px ${s.color})`}}>{s.icon}</div>
        <div>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:32,color:C.pearl,lineHeight:1.1,marginBottom:6}}>{s.title}</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.mint,letterSpacing:"0.08em",textTransform:"uppercase"}}>{s.sub}</div>
        </div>
        <p style={{fontFamily:"DM Sans,sans-serif",fontSize:14,color:"rgba(245,230,255,0.75)",lineHeight:1.7,maxWidth:280,margin:"0 auto"}}>{s.body}</p>
        <div style={{display:"flex",gap:6,justifyContent:"center"}}>
          {steps.map((_,i)=><div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?s.color:"rgba(255,255,255,0.2)",transition:"all 0.3s"}}/>)}
        </div>
      </div>
      <div style={{width:"100%",zIndex:1,display:"flex",flexDirection:"column",gap:10}}>
        {step<steps.length-1
          ?<button onClick={()=>setStep(step+1)} style={{width:"100%",padding:14,borderRadius:12,background:s.color,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:"pointer"}}>Continue</button>
          :<button onClick={onComplete} style={{width:"100%",padding:14,borderRadius:12,background:`linear-gradient(135deg,${C.fuchsia},${C.amethyst})`,boxShadow:`0 8px 24px rgba(233,30,140,0.4)`,border:"none",color:"white",fontFamily:"DM Sans,sans-serif",fontSize:15,fontWeight:600,cursor:"pointer"}}>Begin My Biome Journey</button>}
        {step<steps.length-1&&<button onClick={onComplete} style={{background:"none",border:"none",color:"rgba(245,230,255,0.4)",fontFamily:"DM Sans,sans-serif",fontSize:13,cursor:"pointer"}}>Skip</button>}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function VybiApp() {
  const [screen,setScreen]=useState("Onboarding");
  const [onboarded,setOnboarded]=useState(false);
  const handleComplete=()=>{setOnboarded(true);setScreen("Home");};

  const SIDE=[
    {screen:"Home",icon:"⌂",desc:"Vybi Score · Cycle phase · AI accuracy badge · Prevention alert",color:C.mint},
    {screen:"Cycle",icon:"◎",desc:"Period & ovulation predictions with confidence % · Phase tracker · Symptom logger (feeds L2) · Hormone estimates · Calendar",color:C.rose},
    {screen:"Biomes",icon:"◈",desc:"All 4 biomes · Score history · Layer 3 live signal · Cycle correlation · Recommendations",color:C.vaginal},
    {screen:"AI Engine",icon:"◉",desc:"5-layer algorithm stack · Live accuracy gauge · Confidence signals · Layer detail · Accuracy roadmap · Flo comparison",color:C.purple},
    {screen:"Microbe Report",icon:"🧬",desc:"Full sequencing results · Bacteria composition · Trend → Layer 3 input · Interpretation",color:C.mint},
    {screen:"Prevention",icon:"△",desc:"5 risk conditions · AI drivers · Action plans · Doctor report",color:C.amber},
    {screen:"General Health",icon:"◈",desc:"Sleep, stress, hydration, exercise · Biome impact · Wearable sync → Layer 4",color:C.gold},
    {screen:"Chat",icon:"◇",desc:"Vybi AI · Explains algorithm layers · Biome + cycle aware · Personalised plans",color:C.saliva},
    {screen:"Subscription",icon:"◌",desc:"Free / Core £9.99 / Premium £24.99 · Layer access per plan",color:C.coral},
    {screen:"Settings",icon:"⚙",desc:"Anonymous mode · Privacy · Data export",color:"rgba(245,230,255,0.5)"},
  ];

  const renderScreen=()=>{
    switch(screen){
      case "Onboarding":return <OnboardingScreen onComplete={handleComplete}/>;
      case "Home":return <HomeScreen setScreen={setScreen}/>;
      case "Cycle":return <CycleScreen/>;
      case "Biomes":return <BiomesScreen/>;
      case "AI Engine":return <AIEngineScreen/>;
      case "Microbe Report":return <MicrobeReportScreen/>;
      case "Prevention":return <PreventionScreen/>;
      case "General Health":return <GeneralHealthScreen/>;
      case "Chat":return <ChatScreen/>;
      case "Subscription":return <SubscriptionScreen/>;
      case "Settings":return <SettingsScreen/>;
      default:return <HomeScreen setScreen={setScreen}/>;
    }
  };

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#100520",fontFamily:"DM Sans,sans-serif",padding:"20px 10px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(195,155,211,0.3);border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1.1);}}
        input::placeholder{color:rgba(245,230,255,0.3);}
      `}</style>

      <div style={{display:"flex",gap:40,alignItems:"flex-start",flexWrap:"wrap",justifyContent:"center"}}>
        {/* Phone */}
        <div style={{width:340,height:700,borderRadius:44,background:"#1a0a2e",border:"2px solid rgba(155,89,182,0.4)",boxShadow:"0 40px 80px rgba(0,0,0,0.6)",overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{height:44,background:"#1a0a2e",display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"0 20px 8px",flexShrink:0,zIndex:10}}>
            <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.5)"}}>9:41</span>
            <div style={{width:90,height:20,borderRadius:10,background:"rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:8,color:"rgba(245,230,255,0.4)",fontFamily:"DM Sans,sans-serif",letterSpacing:"0.1em"}}>VYBI</span>
            </div>
            <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.5)"}}>●●●</span>
          </div>
          <div style={{flex:1,overflow:"hidden",position:"relative",background:`linear-gradient(180deg,#1a0a2e 0%,#2d1155 100%)`}}>
            {renderScreen()}
          </div>
          {onboarded&&(
            <div style={{height:64,background:"rgba(26,10,46,0.95)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(195,155,211,0.15)",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 8px",flexShrink:0,zIndex:10}}>
              {NAV.map(item=>(
                <button key={item.id} onClick={()=>setScreen(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",borderRadius:10,flex:1}}>
                  <span style={{fontSize:18,color:screen===item.id?C.fuchsia:"rgba(245,230,255,0.3)",filter:screen===item.id?`drop-shadow(0 0 6px ${C.fuchsia})`:"none"}}>{item.icon}</span>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:screen===item.id?C.fuchsia:"rgba(245,230,255,0.3)",fontWeight:screen===item.id?600:400}}>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{width:300,color:C.pearl}}>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:48,lineHeight:1,marginBottom:4}}>
            <span style={{background:"linear-gradient(135deg, #e91e8c, #9b59b6, #c39bd3)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>VYBI</span>
          </div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.lavender,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>Vaginal · And · Body Intelligence</div>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:13,fontStyle:"italic",color:"rgba(245,230,255,0.5)",marginBottom:20}}>Know your body. Before it speaks.</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {SIDE.map(item=>(
              <div key={item.screen} onClick={()=>{if(onboarded||item.screen==="Onboarding")setScreen(item.screen);}} style={{padding:"9px 12px",borderRadius:12,background:screen===item.screen?`${item.color}15`:"rgba(45,17,85,0.3)",border:`1px solid ${screen===item.screen?item.color+"50":"rgba(255,255,255,0.06)"}`,cursor:"pointer",transition:"all 0.2s"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:2}}>
                  <span style={{color:item.color,fontSize:14}}>{item.icon}</span>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:screen===item.screen?item.color:C.pearl}}>{item.screen}</span>
                </div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.4)",lineHeight:1.5,paddingLeft:22}}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,padding:"10px 12px",borderRadius:12,background:"rgba(233,30,140,0.08)",border:`1px solid ${C.coral}30`}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.coral,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>VYBI · Interactive App Concept</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.5)",lineHeight:1.6}}>Click screens in this panel to navigate. The AI Engine screen shows the full algorithm stack. Chat explains how each layer works.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
