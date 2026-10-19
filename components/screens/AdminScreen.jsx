import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { C } from "../vybi-data.js";
import { Card } from "../vybi-ui.jsx";
import { api } from "../../lib/client-api.ts";

const TIERS = ["free", "core", "premium"];
const tierColor = { free: C.sage, core: C.coral, premium: C.gold };

function Toggle({ on, onClick, disabled, color }) {
  return (
    <div onClick={disabled ? undefined : onClick}
      style={{width:40,height:22,borderRadius:11,flexShrink:0,position:"relative",cursor:disabled?"default":"pointer",opacity:disabled?0.4:1,
        background:on?(color||C.coral):"rgba(var(--surface-rgb),0.15)",transition:"background 0.2s"}}>
      <div style={{width:16,height:16,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?21:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.3)"}}/>
    </div>
  );
}

function UserDetail({ id, onBack }) {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.adminUser(id).then((r) => { setD(r); setLoading(false); }); }, [id]);

  if (loading) return <div style={{padding:20,fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.5)"}}>Loading record…</div>;
  if (!d?.user) return <div style={{padding:20}}><button onClick={onBack} style={backBtn}>‹ Back</button><div style={{marginTop:12,fontSize:12,color:"rgba(var(--ink-rgb),0.6)"}}>User not found.</div></div>;

  const u = d.user;
  const field = (k, v) => (
    <div key={k} style={{display:"flex",justifyContent:"space-between",gap:10,padding:"5px 0",borderBottom:"1px solid rgba(var(--surface-rgb),0.06)"}}>
      <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.5)"}}>{k}</span>
      <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.pearl,textAlign:"right",wordBreak:"break-all"}}>{String(v ?? "—")}</span>
    </div>
  );
  return (
    <div style={{padding:"16px 16px 28px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:12}}>
      <button onClick={onBack} style={backBtn}>‹ Back to users</button>
      <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl,wordBreak:"break-all"}}>{u.email ?? "(no email)"}</div>
      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-mint)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Account</div>
        {field("Name", u.name)}
        {field("Tier", u.subscriptionTier)}
        {field("Admin", u.isAdmin ? (u.isEnvAdmin ? "yes (allowlist)" : "yes") : "no")}
        {field("Suspended", u.suspended)}
        {field("Onboarded", u.onboarded)}
        {field("Goal", u.goal)}
        {field("Birth year", u.birthYear)}
        {field("Anonymous mode", u.anonymousMode)}
        {field("Joined", u.createdAt ? new Date(u.createdAt).toLocaleString("en-GB") : "—")}
      </Card>
      <Card>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-mint)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Data on file</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px"}}>
          {Object.entries(d.counts || {}).map(([k, v]) => (
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.55)",textTransform:"capitalize"}}>{k.replace(/([A-Z])/g," $1")}</span>
              <span style={{fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:600,color:C.pearl}}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
      {d.latestBiome && (
        <Card>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-coral)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Latest biome test</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.7)",lineHeight:1.7}}>
            Vaginal {d.latestBiome.vaginalScore ?? "—"} · Gut {d.latestBiome.gutScore ?? "—"} · Skin {d.latestBiome.skinScore ?? "—"} · Oral {d.latestBiome.oralScore ?? "—"}
            {d.latestBiome.lCrispatusPct != null ? ` · L. crispatus ${d.latestBiome.lCrispatusPct}%` : ""}
          </div>
        </Card>
      )}
      <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(var(--ink-rgb),0.4)",lineHeight:1.6}}>
        Read-only view of this user's account and the volume of data they've logged. Individual health records aren't shown here.
      </div>
    </div>
  );
}

const backBtn = {alignSelf:"flex-start",background:"rgba(var(--surface-rgb),0.06)",border:"1px solid rgba(var(--surface-rgb),0.12)",borderRadius:10,padding:"6px 12px",fontFamily:"DM Sans,sans-serif",fontSize:12,color:C.pearl,cursor:"pointer"};

export function AdminScreen() {
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;
  const [data, setData] = useState({ users: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [viewId, setViewId] = useState(null);

  const load = () => {
    setLoading(true);
    api.adminUsers().then((r) => { setData(r ?? { users: [], stats: null }); setLoading(false); });
  };
  useEffect(() => { if (isAdmin) load(); else setLoading(false); }, [isAdmin]);

  const apply = async (id, patch, label) => {
    setBusyId(id); setMsg(null);
    const r = await api.adminUpdate(id, patch);
    setBusyId(null);
    if (r?.user) { setMsg(`${label} — done`); load(); }
    else setMsg(`Couldn't ${label.toLowerCase()}`);
  };
  const del = async (id) => {
    setBusyId(id); setMsg(null); setConfirmDel(null);
    const r = await api.adminDeleteUser(id);
    setBusyId(null);
    if (r?.ok) { setMsg(`Deleted ${r.deleted ?? "user"}`); load(); }
    else setMsg("Couldn't delete that user");
  };

  if (!isAdmin) {
    return (
      <div style={{padding:"28px 20px",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
        <div style={{fontSize:34}}>🔒</div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl,marginTop:8}}>Admins only</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.6)",marginTop:6,maxWidth:260,lineHeight:1.6}}>Your account isn't an administrator.</div>
      </div>
    );
  }

  if (viewId) return <UserDetail id={viewId} onBack={() => { setViewId(null); load(); }} />;

  const s = data.stats;
  return (
    <div style={{padding:"16px 16px 28px",overflowY:"auto",height:"100%",display:"flex",flexDirection:"column",gap:12}}>
      <div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-coral)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Superadmin</div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:26,color:C.pearl}}>User management</div>
      </div>

      {s && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[
            {label:"Users",value:s.total},{label:"Onboarded",value:s.onboarded},{label:"Admins",value:s.admins},
            {label:"Free",value:s.free},{label:"Core",value:s.core},{label:"Premium",value:s.premium},
          ].map((m)=>(
            <Card key={m.label} style={{padding:"11px 12px"}}>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:24,color:C.pearl,lineHeight:1}}>{m.value}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(var(--ink-rgb),0.55)",marginTop:3}}>{m.label}{m.label==="Users"&&s.suspended?` · ${s.suspended} susp.`:""}</div>
            </Card>
          ))}
        </div>
      )}

      {msg && <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"var(--ey-mint)",padding:"0 2px"}}>{msg}</div>}

      {loading ? (
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.5)",padding:"20px 0",textAlign:"center"}}>Loading users…</div>
      ) : (
        data.users.map((u) => (
          <Card key={u.id} style={u.suspended?{borderColor:`${C.amber}50`}:undefined}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <div style={{minWidth:0,flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:600,color:C.pearl,wordBreak:"break-all"}}>{u.email ?? "(no email)"}</span>
                  {u.isAdmin && <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:`${C.coral}22`,color:"var(--ey-coral)"}}>{u.isEnvAdmin?"ADMIN·ENV":"ADMIN"}</span>}
                  {u.suspended && <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:`${C.amber}22`,color:"var(--ey-amber)"}}>SUSPENDED</span>}
                </div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.5)",marginTop:2}}>
                  {u.name ?? "—"} · {u.onboarded?"onboarded":"not onboarded"} · joined {new Date(u.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                </div>
              </div>
              <button onClick={()=>setViewId(u.id)} style={{flexShrink:0,background:"rgba(var(--surface-rgb),0.06)",border:"1px solid rgba(var(--surface-rgb),0.12)",borderRadius:9,padding:"5px 10px",fontFamily:"DM Sans,sans-serif",fontSize:11,color:C.pearl,cursor:"pointer"}}>View</button>
            </div>

            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {TIERS.map((t) => {
                const active = u.subscriptionTier === t;
                return (
                  <button key={t} disabled={busyId===u.id||active} onClick={()=>apply(u.id,{subscriptionTier:t},`Set ${t}`)}
                    style={{flex:1,padding:"7px 6px",borderRadius:9,cursor:active||busyId===u.id?"default":"pointer",textTransform:"capitalize",
                      fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:active?700:500,
                      border:`1px solid ${active?tierColor[t]:"rgba(var(--surface-rgb),0.14)"}`,
                      background:active?`${tierColor[t]}18`:"rgba(var(--surface-rgb),0.03)",
                      color:active?tierColor[t]:"rgba(var(--ink-rgb),0.7)",opacity:busyId===u.id?0.6:1}}>{t}</button>
                );
              })}
            </div>

            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
              <label style={{display:"flex",alignItems:"center",gap:7,fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.7)"}}>
                <Toggle on={u.isAdmin} disabled={busyId===u.id||u.isEnvAdmin} color={C.coral} onClick={()=>apply(u.id,{isAdmin:!u.isAdmin},u.isAdmin?"Revoke admin":"Grant admin")}/>
                Admin{u.isEnvAdmin?" (env)":""}
              </label>
              <label style={{display:"flex",alignItems:"center",gap:7,fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.7)"}}>
                <Toggle on={u.suspended} disabled={busyId===u.id} color={C.amber} onClick={()=>apply(u.id,{suspended:!u.suspended},u.suspended?"Unsuspend":"Suspend")}/>
                Suspend
              </label>
              <div style={{marginLeft:"auto"}}>
                {confirmDel===u.id ? (
                  <span style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"var(--ey-amber)"}}>Sure?</span>
                    <button onClick={()=>del(u.id)} style={{background:"rgba(255,80,80,0.15)",border:"1px solid rgba(255,80,80,0.4)",color:"#ff9d9d",borderRadius:8,padding:"5px 10px",fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>Delete</button>
                    <button onClick={()=>setConfirmDel(null)} style={{background:"none",border:"none",color:"rgba(var(--ink-rgb),0.5)",fontFamily:"DM Sans,sans-serif",fontSize:11,cursor:"pointer"}}>Cancel</button>
                  </span>
                ) : (
                  <button disabled={busyId===u.id||u.isEnvAdmin} onClick={()=>setConfirmDel(u.id)}
                    style={{background:"none",border:"1px solid rgba(255,120,120,0.3)",color:u.isEnvAdmin?"rgba(var(--ink-rgb),0.3)":"#ff9d9d",borderRadius:8,padding:"5px 10px",fontFamily:"DM Sans,sans-serif",fontSize:11,cursor:u.isEnvAdmin?"default":"pointer",opacity:u.isEnvAdmin?0.5:1}}>Delete</button>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
