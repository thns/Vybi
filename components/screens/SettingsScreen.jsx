import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { C } from "../vybi-data.js";
import { Card } from "../vybi-ui.jsx";
import { enablePush, disablePush, isPushEnabled, sendTestPush, pushSupported, isIOS, isStandalone } from "../../lib/push-client.ts";
import { api } from "../../lib/client-api.ts";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const GOAL_LABEL = { track: "🌙 Tracking my cycle", conceive: "🤍 Trying to conceive", avoid: "🛡 Avoiding pregnancy" };

const TOGGLES = [
  {label:"Anonymous Mode",desc:"No identity linked to health data",on:false,color:C.coral},
  {label:"Partner Sharing",desc:"Share cycle & biome with partner",on:true,color:C.mint},
  {label:"Push Notifications",desc:"Reminders, results & insights",on:true,color:C.gold},
  {label:"Biometric Lock",desc:"Face ID / Fingerprint",on:true,color:C.saliva},
  {label:"Research Opt-in",desc:"Contribute anonymised data",on:false,color:C.sage},
];

export function SettingsScreen({ setScreen }) {
  const [states, setStates] = useState(TOGGLES.map(t=>t.on));
  const [pushOn, setPushOn] = useState(false);
  const [pushMsg, setPushMsg] = useState(null);
  const [pushBusy, setPushBusy] = useState(false);
  const [iosTip, setIosTip] = useState(false);
  const [goal, setGoal] = useState(null);
  useEffect(() => {
    isPushEnabled().then(setPushOn);
    setIosTip(isIOS() && !isStandalone());
    api.me().then((r) => setGoal(r?.user?.goal ?? null));
  }, []);

  const togglePush = async () => {
    setPushBusy(true);
    setPushMsg(null);
    if (pushOn) {
      await disablePush();
      setPushOn(false);
      setPushMsg("Notifications turned off");
    } else {
      if (!pushSupported()) { setPushMsg("This browser doesn't support notifications"); setPushBusy(false); return; }
      const res = await enablePush();
      if (res.ok) { setPushOn(true); setPushMsg("Notifications enabled 🌸"); }
      else setPushMsg(res.reason === "denied" ? "Permission blocked — enable it in browser settings" : res.reason === "unsupported" ? "Not supported on this browser (iOS needs the app installed to Home Screen)" : "Couldn't enable notifications");
    }
    setPushBusy(false);
  };

  const test = async () => { setPushMsg(await sendTestPush() ? "Test sent — check your notifications" : "Couldn't send test"); };

  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const display = user?.name || user?.email || "Guest";
  const initial = display.trim().charAt(0).toUpperCase();
  const tier = user?.subscriptionTier ? `Vybi ${cap(user.subscriptionTier)}` : "Guest mode · not signed in";

  const logout = async () => {
    document.cookie = "vybi_guest=; path=/; max-age=0; SameSite=Lax";
    if (user) await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <div style={{padding:"16px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>Settings</div>
      <Card>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${C.fuchsia},${C.amethyst})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",fontFamily:"DM Sans,sans-serif",overflow:"hidden"}}>{user?.image?<img src={user.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initial}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:18,color:C.pearl,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{display}</div>
            <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.mint}}>{tier}</div>
            {user?.email&&user?.name&&<div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.4)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.email}</div>}
            {goal&&GOAL_LABEL[goal]&&<div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.lavender,marginTop:3}}>{GOAL_LABEL[goal]}</div>}
          </div>
        </div>
      </Card>
      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.mint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Privacy & Preferences</div>
        {TOGGLES.map((t,i)=>{
          const isPush = t.label==="Push Notifications";
          const on = isPush ? pushOn : states[i];
          const toggle = isPush ? togglePush : ()=>setStates(s=>s.map((v,j)=>j===i?!v:v));
          return (
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i<TOGGLES.length-1?14:0,paddingBottom:i<TOGGLES.length-1?14:0,borderBottom:i<TOGGLES.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:13,color:C.pearl}}>{t.label}{isPush&&pushOn&&<span onClick={test} style={{marginLeft:8,fontSize:10,color:C.mint,cursor:"pointer",textDecoration:"underline"}}>Send test</span>}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(245,230,255,0.4)"}}>{isPush&&pushMsg?pushMsg:t.desc}</div>
            </div>
            <div onClick={pushBusy&&isPush?undefined:toggle} style={{width:44,height:24,borderRadius:12,background:on?t.color:"rgba(255,255,255,0.1)",position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0,opacity:pushBusy&&isPush?0.6:1}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:on?23:3,transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
            </div>
          </div>
        );})}
      </Card>
      {iosTip&&!pushOn&&(
        <Card style={{borderColor:`${C.gold}40`,background:`rgba(255,215,0,0.06)`}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:C.gold,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>📲 Enable on iPhone</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(245,230,255,0.75)",lineHeight:1.6}}>To get notifications on iOS, add Vybi to your Home Screen: tap the <strong>Share</strong> button, then <strong>Add to Home Screen</strong>. Open it from there and turn on notifications.</div>
        </Card>
      )}
      {[
        {icon:"💳",label:"Billing & Subscription",sub:`${tier} · manage plan`,screen:"Subscription"},
        {icon:"💊",label:"Birth Control",sub:"Method & pill tracking",screen:"Birth Control"},
        {icon:"🤰",label:"Pregnancy",sub:"Week-by-week tracking",screen:"Pregnancy"},
        {icon:"💞",label:"Partner Sharing",sub:"Share a read-only cycle view",screen:"Partner"},
        {icon:"📋",label:"Export Health Data",sub:"Doctor report · JSON download",href:"/report"},
        {icon:"⚖️",label:"Privacy Policy",sub:"ISO 27001 · ISO 27701 · vybi.health"},
      ].map((item,i)=>(
        <Card key={i} style={{padding:"12px 16px",cursor:item.screen||item.href?"pointer":"default"}} onClick={item.screen?()=>setScreen?.(item.screen):item.href?()=>{window.location.href=item.href;}:undefined}>
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

      <button onClick={logout} style={{marginTop:4,width:"100%",padding:"13px",borderRadius:14,border:"1px solid rgba(255,120,120,0.35)",background:"rgba(255,80,80,0.10)",color:"#ff9d9d",fontFamily:"DM Sans,sans-serif",fontSize:14,fontWeight:600,cursor:"pointer"}}>
        {user?"Log out":"Sign in / Create account"}
      </button>
      <div style={{textAlign:"center",fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(245,230,255,0.3)",paddingBottom:8}}>VYBI · View Your Biome Intelligence</div>
    </div>
  );
}
