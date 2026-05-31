"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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

export default function VybiApp() {
  const [screen, setScreen] = useState("Onboarding");
  const [onboarded, setOnboarded] = useState(false);
  const handleComplete = () => { setOnboarded(true); setScreen("Home"); };

  // Returning users who already onboarded skip straight to the app.
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.user?.onboarded) {
      setOnboarded(true);
      setScreen((s) => (s === "Onboarding" ? "Home" : s));
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
    {screen:"Subscription",icon:"◌",desc:"Free / Core £9.99 / Premium £24.99 · Layer access per plan",color:C.coral},
    {screen:"Settings",icon:"⚙",desc:"Anonymous mode · Privacy · Data export",color:"rgba(245,230,255,0.5)"},
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
      case "Subscription": return <SubscriptionScreen/>;
      case "Settings": return <SettingsScreen/>;
      default: return <HomeScreen setScreen={setScreen}/>;
    }
  };

  const GLOBAL_STYLE = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(195,155,211,0.3);border-radius:2px;}
      @keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8);}50%{opacity:1;transform:scale(1.1);}}
      input::placeholder{color:rgba(245,230,255,0.3);}
    `}</style>
  );

  // ─── Mobile: full-screen app (no desktop mockup frame / side panel) ─────────
  if (isMobile) {
    return (
      <div style={{height:"100dvh",display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#1a0a2e 0%,#2d1155 100%)",fontFamily:"DM Sans,sans-serif",overflow:"hidden"}}>
        {GLOBAL_STYLE}
        <div style={{flex:1,overflow:"hidden",position:"relative"}}>
          {renderScreen()}
        </div>
        {onboarded&&(
          <div style={{background:"rgba(26,10,46,0.95)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(195,155,211,0.15)",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"8px 8px calc(8px + env(safe-area-inset-bottom))",flexShrink:0,zIndex:10}}>
            {NAV.map(item=>(
              <button key={item.id} onClick={()=>setScreen(item.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",borderRadius:10,flex:1}}>
                <span style={{fontSize:20,color:screen===item.id?C.fuchsia:"rgba(245,230,255,0.3)",filter:screen===item.id?`drop-shadow(0 0 6px ${C.fuchsia})`:"none"}}>{item.icon}</span>
                <span style={{fontFamily:"DM Sans,sans-serif",fontSize:9,color:screen===item.id?C.fuchsia:"rgba(245,230,255,0.3)",fontWeight:screen===item.id?600:400}}>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

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
        {/* Phone frame */}
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
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.lavender,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:4}}>View Your Biome Intelligence</div>
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
