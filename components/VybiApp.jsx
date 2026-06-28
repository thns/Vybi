"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ThemeProvider } from "./theme.js";
import { C, NAV } from "./vybi-data.js";
import { AIEngineScreen } from "./screens/AIEngineScreen.jsx";
import { HomeScreen } from "./screens/HomeScreen.jsx";
import { CycleScreen } from "./screens/CycleScreen.jsx";
import { BiomesScreen } from "./screens/BiomesScreen.jsx";
import { MicrobeReportScreen } from "./screens/MicrobeReportScreen.jsx";
import { PreventionScreen } from "./screens/PreventionScreen.jsx";
import { GeneralHealthScreen } from "./screens/GeneralHealthScreen.jsx";
import { ChatScreen } from "./screens/ChatScreen.jsx";
import { SubscriptionScreen } from "./screens/SubscriptionScreen.jsx";
import { SettingsScreen } from "./screens/SettingsScreen.jsx";
import { OnboardingScreen } from "./screens/OnboardingScreen.jsx";
import { PregnancyScreen } from "./screens/PregnancyScreen.jsx";
import { BirthControlScreen } from "./screens/BirthControlScreen.jsx";
import { WearableScreen } from "./screens/WearableScreen.jsx";
import { ContentScreen } from "./screens/ContentScreen.jsx";
import { PartnerScreen } from "./screens/PartnerScreen.jsx";
import { CommunityScreen } from "./screens/CommunityScreen.jsx";
import { AccountMenu } from "./AccountMenu.tsx";

// Theme tokens. `:root` defaults to the light (white) palette so first paint
// matches the default; the data-attribute blocks override per selected theme.
// Surface/text colours are exposed as rgb channels so existing inline rgba()
// alpha values keep working across every theme.
const THEME_CSS = `
  :root,[data-vybi-theme="light"]{
    --app-bg:radial-gradient(125% 85% at 50% -10%, #fbf9fe 0%, #f3edfb 55%, #ebe3f6 100%);
    --text:#19112e; --ink-rgb:26,18,46; --surface-rgb:60,36,92;
    --lav-rgb:150,110,190; --deep-rgb:248,243,254; --velvet-rgb:255,255,255;
    --scheme:light;
    --card-bg:#ffffff;
    --card-hero:#ffffff;
    --card-border:rgba(150,110,190,0.16);
    --card-shadow:0 6px 16px rgba(110,70,160,0.10), inset 0 1px 0 rgba(255,255,255,0.7);
    --ey-mint:#0f7a5a; --ey-aqua:#0f7a5a; --ey-gold:#9a6b00; --ey-amber:#b5560b; --ey-rose:#b81e5e; --ey-blush:#b81e5e; --ey-bubblegum:#c01f8f; --ey-coral:#c41f7a; --ey-fuchsia:#c41f7a; --ey-lavender:#7a3fb0; --ey-saliva:#7a3fb0; --ey-amethyst:#6b3a9e; --ey-purple:#6b3a9e;
  }
  [data-vybi-theme="pink"]{
    --app-bg:radial-gradient(125% 85% at 50% -10%, #fff9fc 0%, #ffeef5 55%, #ffe2ec 100%);
    --text:#2c0a1f; --ink-rgb:60,14,40; --surface-rgb:120,40,80;
    --lav-rgb:210,120,160; --deep-rgb:255,243,248; --velvet-rgb:255,255,255;
    --scheme:light;
    --card-bg:#ffffff;
    --card-hero:#ffffff;
    --card-border:rgba(220,130,170,0.22);
    --card-shadow:0 6px 16px rgba(190,60,120,0.12), inset 0 1px 0 rgba(255,255,255,0.7);
  }
  [data-vybi-theme="dark"]{
    --app-bg:linear-gradient(180deg,#1a0a2e 0%,#2d1155 100%);
    --text:#f5e6ff; --ink-rgb:245,230,255; --surface-rgb:255,255,255;
    --lav-rgb:195,155,211; --deep-rgb:26,10,46; --velvet-rgb:45,17,85;
    --scheme:dark;
    --card-bg:rgba(45,17,85,0.55);
    --card-hero:linear-gradient(135deg,rgba(45,17,85,0.92),rgba(74,32,128,0.72));
    --card-border:rgba(195,155,211,0.20);
    --card-shadow:0 6px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05);
    --ey-mint:#b8f0e6; --ey-aqua:#b8f0e6; --ey-gold:#ffd700; --ey-amber:#ff8c42; --ey-rose:#ff9dc6; --ey-blush:#ff9dc6; --ey-bubblegum:#ff6eb4; --ey-coral:#e91e8c; --ey-fuchsia:#e91e8c; --ey-lavender:#c39bd3; --ey-saliva:#c39bd3; --ey-amethyst:#9b59b6; --ey-purple:#9b59b6;
  }
  :root{
    --brand-grad:linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0) 52%),linear-gradient(135deg,#9c1fc9,#e6199b);
    --brand-glow:0 5px 14px rgba(180,40,140,0.24), inset 0 1px 0 rgba(255,255,255,0.25);
  }
`;

function VybiAppInner() {
  const [screen, _setScreen] = useState("Onboarding");
  const [history, setHistory] = useState([]);
  const [onboarded, setOnboarded] = useState(false);

  // History-aware navigation so the top bar can offer a Back action.
  const setScreen = (next) => {
    const target = typeof next === "function" ? next(screen) : next;
    if (target !== screen) setHistory((h) => [...h, screen]);
    _setScreen(target);
  };
  const goBack = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    _setScreen(prev);
  };
  const handleComplete = () => { setOnboarded(true); setHistory([]); _setScreen("Home"); };

  // Returning users who already onboarded skip straight to the app.
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.onboarded) {
      setOnboarded(true);
      _setScreen((s) => (s === "Onboarding" ? "Home" : s));
      setHistory([]);
    }
  }, [session]);

  // On phone-width viewports, render the app full-screen (no desktop mockup).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 560);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const SIDE = [
    {screen:"Home",icon:"⌂",desc:"Vybi Score · Cycle phase · AI accuracy badge · Prevention alert",color:C.mint},
    {screen:"Cycle",icon:"◎",desc:"Period & ovulation predictions with confidence % · Phase tracker · Symptom logger (feeds L2) · Hormone estimates · Calendar",color:C.rose},
    {screen:"Biomes",icon:"◈",desc:"All 4 biomes · Score history · Layer 3 live signal · Cycle correlation · Recommendations",color:C.vaginal},
    {screen:"AI Engine",icon:"◉",desc:"5-layer algorithm stack · Live accuracy gauge · Confidence signals · Layer detail · Accuracy roadmap · Flo comparison",color:C.purple},
    {screen:"Microbe Report",icon:"🧬",desc:"Full sequencing results · Bacteria composition · Trend → Layer 3 input · Interpretation",color:C.mint},
    {screen:"Prevention",icon:"△",desc:"5 risk conditions · AI drivers · Action plans · Doctor report",color:C.amber},
    {screen:"General Health",icon:"◈",desc:"Sleep, stress, hydration, exercise · Biome impact · Wearable sync → Layer 4",color:C.gold},
    {screen:"Chat",icon:"◇",desc:"Vybi AI · Explains algorithm layers · Biome + cycle aware · Personalised plans",color:C.saliva},
    {screen:"Pregnancy",icon:"🤰",desc:"Week-by-week tracking · Trimester · Baby size · Countdown to due date",color:C.fuchsia},
    {screen:"Birth Control",icon:"💊",desc:"Method tracking · Pill reminders · Weekly adherence",color:C.amethyst},
    {screen:"Wearable",icon:"⌚",desc:"BBT · Resting HR · HRV → activates Layer 4 fusion",color:C.aqua},
    {screen:"Learn",icon:"📖",desc:"Content library · Articles on cycle, biome, fertility · Daily insight",color:C.gold},
    {screen:"Partner",icon:"💞",desc:"Share a read-only cycle view with a partner · Revoke anytime",color:C.blush},
    {screen:"Community",icon:"💬",desc:"Anonymous rooms · Cycle, TTC, biome, PCOS, mood · Be kind",color:C.bubblegum},
    {screen:"Subscription",icon:"◌",desc:"Free / Core £9.99 / Premium £24.99 · Layer access per plan",color:C.coral},
    {screen:"Settings",icon:"⚙",desc:"Anonymous mode · Privacy · Data export",color:"rgba(var(--ink-rgb),0.5)"},
  ];

  const renderScreen = () => {
    switch(screen) {
      case "Onboarding": return <OnboardingScreen onComplete={handleComplete}/>;
      case "Home": return <HomeScreen setScreen={setScreen}/>;
      case "Cycle": return <CycleScreen/>;
      case "Biomes": return <BiomesScreen/>;
      case "AI Engine": return <AIEngineScreen/>;
      case "Microbe Report": return <MicrobeReportScreen/>;
      case "Prevention": return <PreventionScreen/>;
      case "General Health": return <GeneralHealthScreen/>;
      case "Chat": return <ChatScreen/>;
      case "Pregnancy": return <PregnancyScreen/>;
      case "Birth Control": return <BirthControlScreen/>;
      case "Wearable": return <WearableScreen/>;
      case "Learn": return <ContentScreen/>;
      case "Partner": return <PartnerScreen/>;
      case "Community": return <CommunityScreen/>;
      case "Subscription": return <SubscriptionScreen/>;
      case "Settings": return <SettingsScreen setScreen={setScreen}/>;
      default: return <HomeScreen setScreen={setScreen}/>;
    }
  };

  // Persistent brand bar — top-left logo on every screen; click returns Home.
  const TopBar = ({ inset = false }) => (
    <div style={{display:"flex",alignItems:"center",gap:8,height:46,padding:"0 12px",paddingTop:inset?"env(safe-area-inset-top)":undefined,flexShrink:0,zIndex:40}}>
      {onboarded && history.length>0 && (
        <button onClick={goBack} aria-label="Back"
          style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:"rgba(var(--surface-rgb),0.07)",border:"1px solid rgba(var(--lav-rgb),0.25)",color:C.pearl,fontSize:18,lineHeight:1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
      )}
      <button onClick={()=>{ if(onboarded) setScreen("Home"); }} aria-label="Vybi — home"
        style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",padding:0,cursor:onboarded?"pointer":"default"}}>
        <img src="/logo-mark.png" alt="Vybi" width={30} height={30} style={{display:"block",filter:"drop-shadow(0 2px 8px rgba(233,30,140,0.35))"}}/>
        <span style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,lineHeight:1,color:"var(--text)",letterSpacing:"0.02em"}}>VYBI</span>
      </button>
    </div>
  );

  const GLOBAL_STYLE = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      ${THEME_CSS}
      *{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(var(--lav-rgb),0.3);border-radius:2px;}
      @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1.1);}}
      input::placeholder{color:rgba(var(--ink-rgb),0.3);}
    `}</style>
  );

  // ─── Mobile: full-screen app (no desktop mockup frame / side panel) ─────────
  if (isMobile) {
    return (
      <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:"var(--app-bg)",fontFamily:"DM Sans,sans-serif",overflow:"hidden"}}>
        {GLOBAL_STYLE}
        <div style={{flex:1,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column"}}>
          {onboarded&&<AccountMenu setScreen={setScreen}/>}
          <TopBar inset />
          <div style={{flex:1,overflow:"hidden",position:"relative"}}>{renderScreen()}</div>
        </div>
        {onboarded&&(
          <div style={{background:"rgba(var(--deep-rgb),0.95)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(var(--lav-rgb),0.15)",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"8px 8px calc(8px + env(safe-area-inset-bottom))",flexShrink:0,zIndex:10}}>
            {NAV.map(item=>(
              <button key={item.id} onClick={()=>setScreen(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",borderRadius:10,flex:1}}>
                <span style={{fontSize:20,color:screen===item.id?"#9b30d4":"rgba(var(--ink-rgb),0.3)",filter:screen===item.id?`drop-shadow(0 0 6px #9b30d4)`:"none"}}>{item.icon}</span>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:screen===item.id?"#9b30d4":"rgba(var(--ink-rgb),0.3)",fontWeight:screen===item.id?600:400}}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"var(--app-bg)",fontFamily:"DM Sans,sans-serif",padding:"20px 10px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        ${THEME_CSS}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(var(--lav-rgb),0.3);border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1.1);}}
        input::placeholder{color:rgba(var(--ink-rgb),0.3);}
      `}</style>

      <div style={{display:"flex",gap:40,alignItems:"flex-start",flexWrap:"wrap",justifyContent:"center"}}>
        {/* Phone frame */}
        <div style={{width:340,height:700,borderRadius:44,background:"#1a0a2e",border:"2px solid rgba(155,89,182,0.4)",boxShadow:"0 40px 80px rgba(0,0,0,0.6)",overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{height:44,background:"#1a0a2e",display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"0 20px 8px",flexShrink:0,zIndex:10}}>
            <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.5)"}}>9:41</span>
            <div style={{width:90,height:20,borderRadius:10,background:"rgba(0,0,0,0.6)",border:"1px solid rgba(var(--surface-rgb),0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:8,color:"rgba(var(--ink-rgb),0.4)",fontFamily:"DM Sans,sans-serif",letterSpacing:"0.1em"}}>VYBI</span>
            </div>
            <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.5)"}}>●●●</span>
          </div>
          <div style={{flex:1,overflow:"hidden",position:"relative",background:`var(--app-bg)`,display:"flex",flexDirection:"column"}}>
            {onboarded&&<AccountMenu setScreen={setScreen}/>}
            <TopBar />
            <div style={{flex:1,overflow:"hidden",position:"relative"}}>{renderScreen()}</div>
          </div>
          {onboarded&&(
            <div style={{height:64,background:"rgba(var(--deep-rgb),0.95)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(var(--lav-rgb),0.15)",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 8px",flexShrink:0,zIndex:10}}>
              {NAV.map(item=>(
                <button key={item.id} onClick={()=>setScreen(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",borderRadius:10,flex:1}}>
                  <span style={{fontSize:18,color:screen===item.id?"#9b30d4":"rgba(var(--ink-rgb),0.3)",filter:screen===item.id?`drop-shadow(0 0 6px #9b30d4)`:"none"}}>{item.icon}</span>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:screen===item.id?"#9b30d4":"rgba(var(--ink-rgb),0.3)",fontWeight:screen===item.id?600:400}}>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{width:300,color:C.pearl}}>
          <img src="/logo-mark.png" alt="Vybi" width={72} height={72} style={{display:"block",marginBottom:6,filter:"drop-shadow(0 6px 18px rgba(233,30,140,0.3))"}}/>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:48,lineHeight:1,marginBottom:4}}>
            <span style={{color:"var(--text)",letterSpacing:"0.02em"}}>VYBI</span>
          </div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.lavender,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>View Your Biome Intelligence</div>
          <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:13,fontStyle:"italic",color:"rgba(var(--ink-rgb),0.5)",marginBottom:20}}>Know your body. Before it speaks.</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {SIDE.map(item=>(
              <div key={item.screen} onClick={()=>{if(onboarded||item.screen==="Onboarding")setScreen(item.screen);}} style={{padding:"9px 12px",borderRadius:12,background:screen===item.screen?`${item.color}15`:"rgba(var(--velvet-rgb),0.3)",border:`1px solid ${screen===item.screen?item.color+"50":"rgba(var(--surface-rgb),0.06)"}`,cursor:"pointer",transition:"all 0.2s"}}>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:2}}>
                  <span style={{color:item.color,fontSize:14}}>{item.icon}</span>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:12,fontWeight:600,color:screen===item.screen?item.color:C.pearl}}>{item.screen}</span>
                </div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(var(--ink-rgb),0.4)",lineHeight:1.5,paddingLeft:22}}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,padding:"10px 12px",borderRadius:12,background:"rgba(233,30,140,0.08)",border:`1px solid ${C.coral}30`}}>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-coral)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>VYBI · Interactive App Concept</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.5)",lineHeight:1.6}}>Click screens in this panel to navigate. The AI Engine screen shows the full algorithm stack. Chat explains how each layer works.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VybiApp() {
  return (
    <ThemeProvider>
      <VybiAppInner />
    </ThemeProvider>
  );
}
