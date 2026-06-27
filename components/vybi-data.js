export const C = {
  deep:       "#1a0a2e",
  velvet:     "#2d1155",
  royal:      "#4a2080",
  amethyst:   "#9b59b6",
  lavender:   "#c39bd3",
  lilac:      "#e8d5f5",
  pearl:      "var(--text)",   // themed primary text (see components/theme.js)
  fuchsia:    "#e91e8c",
  bubblegum:  "#ff6eb4",
  blush:      "#ff9dc6",
  aqua:       "#b8f0e6",
  gold:       "#ffd700",
  amber:      "#ff8c42",
  rose:       "#ff9dc6",
  vaginal:    "#e91e8c",
  gut:        "#ffd700",
  skin:       "#b8f0e6",
  oral:       "#c39bd3",
  cream:      "var(--text)",  // themed primary text
  mint:       "#b8f0e6",
  coral:      "#e91e8c",
  sage:       "#9b59b6",
  saliva:     "#c39bd3",
  forest:     "#2d1155",
  moss:       "#4a2080",
  purple:     "#9b59b6",
};

export const AI_LAYERS = [
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

export const CONFIDENCE_SIGNALS = [
  {label:"Cycles logged",value:3,max:6,unit:"cycles",impact:"+20%",color:C.mint,met:true},
  {label:"Symptoms logged",value:47,max:50,unit:"entries",impact:"+8%",color:C.gold,met:true},
  {label:"Test kit completed",value:1,max:1,unit:"kit",impact:"+10%",color:C.vaginal,met:true},
  {label:"Wearable connected",value:0,max:1,unit:"device",impact:"+9%",color:C.purple,met:false},
  {label:"6+ cycles logged",value:3,max:6,unit:"cycles",impact:"+4%",color:C.saliva,met:false},
];

export const calcAccuracy = (cycles, hasKit, hasWearable, symptoms) => {
  let b=62;
  if(cycles>=1)b+=10; if(cycles>=3)b+=6; if(cycles>=6)b+=4;
  if(symptoms>=10)b+=5; if(symptoms>=30)b+=3;
  if(hasKit)b+=10; if(hasWearable)b+=9;
  return Math.min(b,93);
};

export const BIOMES = [
  {id:"vaginal",name:"Vaginal Biome",icon:"◈",color:C.vaginal,score:72,status:"Needs Attention",bacteria:"L. crispatus",trend:"↓",tags:["BV Risk: Low","pH: 4.2","Diversity: Mod"]},
  {id:"gut",name:"Gut Biome",icon:"◉",color:C.gut,score:85,status:"Healthy",bacteria:"B. longum",trend:"↑",tags:["Diversity: High","Inflam: Low","Transit: OK"]},
  {id:"skin",name:"Skin Biome",icon:"◌",color:C.skin,score:68,status:"Moderate",bacteria:"C. acnes",trend:"→",tags:["pH: 5.5","Hydration: 62%","Barrier: Mod"]},
  {id:"saliva",name:"Oral Biome",icon:"◎",color:C.oral,score:91,status:"Excellent",bacteria:"S. salivarius",trend:"↑",tags:["pH: 7.1","Cavity Risk: Low","Inflam: None"]},
];

export const CYCLE_DAYS = Array.from({length:35},(_,i)=>({
  day:i+1,
  phase:i<5?"menstrual":i<13?"follicular":i<17?"ovulation":i<28?"luteal":"late",
  biomeScore:[65,68,70,72,70,74,76,78,80,82,84,86,85,84,83,82,80,78,76,74,72,70,68,72,70,68,72,74][i]||72,
  estrogen:i<12?20+i*5:i<14?80:i<28?40:20,
  progesterone:i<14?1:i<21?1+(i-14)*2:i<25?15:5,
  lhSurge:i===13||i===14,
}));

export const SYMPTOMS_LIST = [
  {id:"cramps",label:"Cramps",icon:"⚡"},{id:"bloating",label:"Bloating",icon:"○"},
  {id:"headache",label:"Headache",icon:"◎"},{id:"fatigue",label:"Fatigue",icon:"◌"},
  {id:"mood",label:"Mood Swings",icon:"◇"},{id:"anxiety",label:"Anxiety",icon:"△"},
  {id:"acne",label:"Acne",icon:"◈"},{id:"discharge",label:"Discharge",icon:"◉"},
  {id:"dryness",label:"Dryness",icon:"○"},{id:"libido",label:"Low Libido",icon:"♡"},
  {id:"sleep",label:"Poor Sleep",icon:"◌"},{id:"backpain",label:"Back Pain",icon:"⚡"},
];

// Expanded, categorised symptom & mood taxonomy. Original ids (cramps, bloating,
// acne, discharge…) are preserved so the Layer-2 pattern engine still matches.
export const SYMPTOM_GROUPS = [
  { category:"Physical", color:"#e91e8c", items:[
    {id:"cramps",label:"Cramps",icon:"⚡"},
    {id:"headache",label:"Headache",icon:"🤕"},
    {id:"backpain",label:"Back Pain",icon:"🔙"},
    {id:"breast_tenderness",label:"Breast Tenderness",icon:"💗"},
    {id:"nausea",label:"Nausea",icon:"🤢"},
    {id:"dizziness",label:"Dizziness",icon:"💫"},
    {id:"joint_pain",label:"Joint Pain",icon:"🦴"},
    {id:"hot_flashes",label:"Hot Flashes",icon:"🔥"},
  ]},
  { category:"Mood", color:"#9b59b6", items:[
    {id:"happy",label:"Happy",icon:"😊"},
    {id:"calm",label:"Calm",icon:"😌"},
    {id:"mood",label:"Mood Swings",icon:"🎭"},
    {id:"anxiety",label:"Anxious",icon:"😰"},
    {id:"irritable",label:"Irritable",icon:"😤"},
    {id:"sad",label:"Sad / Low",icon:"😢"},
    {id:"sensitive",label:"Sensitive",icon:"🥺"},
    {id:"unmotivated",label:"Unmotivated",icon:"😶"},
  ]},
  { category:"Energy & Sleep", color:"#ffd700", items:[
    {id:"fatigue",label:"Fatigue",icon:"🪫"},
    {id:"energetic",label:"Energetic",icon:"⚡️"},
    {id:"sleep",label:"Poor Sleep",icon:"🌙"},
    {id:"insomnia",label:"Insomnia",icon:"👁"},
    {id:"restless",label:"Restless",icon:"😣"},
  ]},
  { category:"Flow & Discharge", color:"#ff6eb4", items:[
    {id:"spotting",label:"Spotting",icon:"🩸"},
    {id:"heavy_flow",label:"Heavy Flow",icon:"🌊"},
    {id:"light_flow",label:"Light Flow",icon:"💧"},
    {id:"discharge",label:"Egg-white Discharge",icon:"🥚"},
    {id:"sticky_discharge",label:"Sticky Discharge",icon:"◉"},
    {id:"dryness",label:"Dryness",icon:"🏜"},
  ]},
  { category:"Digestion", color:"#b8f0e6", items:[
    {id:"bloating",label:"Bloating",icon:"🎈"},
    {id:"constipation",label:"Constipation",icon:"🚧"},
    {id:"diarrhea",label:"Diarrhea",icon:"💦"},
    {id:"cravings",label:"Cravings",icon:"🍫"},
    {id:"appetite",label:"Increased Appetite",icon:"🍽"},
  ]},
  { category:"Skin & Hair", color:"#c39bd3", items:[
    {id:"acne",label:"Acne",icon:"🔴"},
    {id:"oily_skin",label:"Oily Skin",icon:"✨"},
    {id:"dry_skin",label:"Dry Skin",icon:"🍂"},
    {id:"breakouts",label:"Breakouts",icon:"😬"},
  ]},
  { category:"Sexual", color:"#ff8c42", items:[
    {id:"high_libido",label:"High Libido",icon:"💞"},
    {id:"libido",label:"Low Libido",icon:"💤"},
    {id:"pain_sex",label:"Pain During Sex",icon:"⚠️"},
  ]},
];

export const PREVENTION_RISKS = [
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

export const MICROBE_REPORT = {
  vaginal:{dominant:"Lactobacillus crispatus",dominance:61,secondary:["L. iners (18%)","Gardnerella vaginalis (12%)","Prevotella (6%)","Other (3%)"],cstType:"CST I",bvRisk:"Low",phValue:4.2,diversity:"Moderate",fungi:"Candida albicans <1%",trend:"L. crispatus -18% vs Mar 2026",interpretation:"Lactobacillus-dominant (healthy) but crispatus declining post-menstruation. L. iners rising — transitional state. Action recommended.",alert:true},
  gut:{dominant:"Bifidobacterium longum",dominance:24,secondary:["F. prausnitzii (18%)","A. muciniphila (12%)","Lactobacillus (8%)","Other (38%)"],diversity:"High (Shannon: 4.2)",firmicutesBacteroidetes:"1.8:1 — optimal",inflammation:"Calprotectin: Low",interpretation:"Excellent gut diversity. F. prausnitzii and Akkermansia indicate strong anti-inflammatory activity. No action required.",alert:false},
  skin:{dominant:"Cutibacterium acnes",dominance:31,secondary:["S. epidermidis (28%)","Malassezia (15%)","Corynebacterium (14%)","Other (12%)"],barrier:"62% — slightly reduced",phValue:5.5,interpretation:"Mild C. acnes elevation correlating with luteal phase. Barrier slightly compromised — linked to logged stress Days 18-22.",alert:true},
  saliva:{dominant:"Streptococcus salivarius",dominance:34,secondary:["S. mitis (22%)","Veillonella (16%)","Rothia (13%)","Other (15%)"],diversity:"High",cavityRisk:"Low",gumHealth:"Good",interpretation:"Excellent oral microbiome. S. mutans <2%. No action required.",alert:false},
};

export const HEALTH_METRICS = [
  {label:"Sleep",value:"6.8h",status:"Fair",color:C.purple,icon:"◌",trend:"↓",tip:"Aim 7-9h. Luteal phase reduces sleep quality."},
  {label:"Stress",value:"Moderate",status:"Watch",color:C.amber,icon:"△",trend:"↑",tip:"Elevated stress lowers L. crispatus. Try breathwork."},
  {label:"Hydration",value:"1.6L",status:"Low",color:C.coral,icon:"○",trend:"→",tip:"Below 2L target. UTI risk increases."},
  {label:"Exercise",value:"3x/wk",status:"Good",color:C.mint,icon:"◉",trend:"↑",tip:"Great. Moderate exercise supports gut diversity."},
  {label:"Nutrition",value:"Varied",status:"Good",color:C.mint,icon:"◈",trend:"→",tip:"Add fermented foods to support vaginal biome."},
  {label:"Weight",value:"BMI 23.1",status:"Healthy",color:C.mint,icon:"◎",trend:"→",tip:"Optimal BMI supports hormonal balance."},
];

export const NAV = [
  {id:"Home",icon:"⌂",label:"Home"},
  {id:"Cycle",icon:"◎",label:"Cycle"},
  {id:"Biomes",icon:"◈",label:"Biomes"},
  {id:"AI Engine",icon:"◉",label:"AI"},
  {id:"Chat",icon:"◇",label:"Chat"},
];

export const phaseColor = p => ({menstrual:C.rose,follicular:C.lavender,ovulation:C.aqua,luteal:C.amethyst,late:C.fuchsia}[p]||C.lavender);
export const phaseLabel = p => ({menstrual:"Menstrual",follicular:"Follicular",ovulation:"Ovulation",luteal:"Luteal",late:"Late Luteal"}[p]||p);
