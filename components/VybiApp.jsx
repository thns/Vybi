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
import { AdminScreen } from "./screens/AdminScreen.jsx";
import { AccountMenu } from "./AccountMenu.tsx";

// Theme tokens. `:root` defaults to the light (white) palette so first paint
// matches the default; the data-attribute blocks override per selected theme.
// Surface/text colours are exposed as rgb channels so existing inline rgba()
// alpha values keep working across every theme.
const THEME_CSS = `
  :root,[data-vybi-theme="light"]{
    --app-bg:radial-gradient(125% 90% at 50% -10%, #f8f4fd 0%, #ece3f7 55%, #ddd0ef 100%);
    --text:#19112e; --ink-rgb:26,18,46; --surface-rgb:60,36,92;
    --lav-rgb:150,110,190; --deep-rgb:248,243,254; --velvet-rgb:255,255,255;
    --scheme:light;
    --card-bg:#ffffff;
    --card-hero:#ffffff;
    --card-border:rgba(150,110,190,0.18);
    --card-shadow:0 8px 22px rgba(95,55,150,0.16), 0 2px 6px rgba(95,55,150,0.08);
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
      case "Admin": return <AdminScreen/>;
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

  // Single responsive layout: the real app in a centered, full-height column.
  // Phones fill the width; wider screens show the app column centered on the
  // themed background (no device mockup, no demo side panel).
  return (
    <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:"var(--app-bg)",fontFamily:"DM Sans,sans-serif",overflow:"hidden"}}>
      {GLOBAL_STYLE}
      <div style={{flex:1,minHeight:0,width:"100%",display:"flex",flexDirection:"column",overflow:"hidden",position:"relative"}}>
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
