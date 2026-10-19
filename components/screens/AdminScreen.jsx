import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { C } from "../vybi-data.js";
import { Card } from "../vybi-ui.jsx";
import { api } from "../../lib/client-api.ts";

const TIERS = ["free", "core", "premium"];
const tierColor = { free: C.sage, core: C.coral, premium: C.gold };

export function AdminScreen() {
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;
  const [data, setData] = useState({ users: [], stats: null });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () => {
    setLoading(true);
    api.adminUsers().then((r) => {
      setData(r ?? { users: [], stats: null });
      setLoading(false);
    });
  };
  useEffect(() => { if (isAdmin) load(); else setLoading(false); }, [isAdmin]);

  const setTier = async (id, tier) => {
    setBusyId(id);
    setMsg(null);
    const r = await api.adminSetTier(id, tier);
    setBusyId(null);
    if (r?.user) {
      setData((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, subscriptionTier: tier } : u)) }));
      setMsg(`Updated ${r.user.email ?? "user"} → ${tier}`);
    } else {
      setMsg("Couldn't update that user.");
    }
  };

  if (!isAdmin) {
    return (
      <div style={{padding:"28px 20px",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
        <div style={{fontSize:34}}>🔒</div>
        <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:22,color:C.pearl,marginTop:8}}>Admins only</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.6)",marginTop:6,maxWidth:260,lineHeight:1.6}}>Your account isn't an administrator. Access is granted via the ADMIN_EMAILS allowlist.</div>
      </div>
    );
  }

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
            {label:"Users",value:s.total},
            {label:"Onboarded",value:s.onboarded},
            {label:"Admins",value:s.admins},
            {label:"Free",value:s.free},
            {label:"Core",value:s.core},
            {label:"Premium",value:s.premium},
          ].map((m)=>(
            <Card key={m.label} style={{padding:"11px 12px"}}>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontSize:24,color:C.pearl,lineHeight:1}}>{m.value}</div>
              <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(var(--ink-rgb),0.55)",marginTop:3}}>{m.label}</div>
            </Card>
          ))}
        </div>
      )}

      {msg && <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"var(--ey-mint)",padding:"0 2px"}}>{msg}</div>}

      {loading ? (
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.5)",padding:"20px 0",textAlign:"center"}}>Loading users…</div>
      ) : data.users.length === 0 ? (
        <Card style={{textAlign:"center"}}>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:12,color:"rgba(var(--ink-rgb),0.6)"}}>No users yet.</div>
        </Card>
      ) : (
        data.users.map((u) => (
          <Card key={u.id}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <div style={{minWidth:0,flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"DM Sans,sans-serif",fontSize:13,fontWeight:600,color:C.pearl,wordBreak:"break-all"}}>{u.email ?? "(no email)"}</span>
                  {u.isAdmin && <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,background:`${C.coral}22`,color:"var(--ey-coral)"}}>ADMIN</span>}
                </div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:11,color:"rgba(var(--ink-rgb),0.5)",marginTop:2}}>
                  {u.name ?? "—"} · {u.onboarded ? "onboarded" : "not onboarded"}{u.goal ? ` · ${u.goal}` : ""}
                </div>
                <div style={{fontFamily:"DM Sans,sans-serif",fontSize:10,color:"rgba(var(--ink-rgb),0.4)",marginTop:2}}>
                  joined {new Date(u.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                </div>
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              {TIERS.map((t) => {
                const active = u.subscriptionTier === t;
                return (
                  <button
                    key={t}
                    disabled={busyId === u.id || active}
                    onClick={() => setTier(u.id, t)}
                    style={{flex:1,padding:"7px 6px",borderRadius:9,cursor:active||busyId===u.id?"default":"pointer",textTransform:"capitalize",
                      fontFamily:"DM Sans,sans-serif",fontSize:11,fontWeight:active?700:500,
                      border:`1px solid ${active?tierColor[t]:"rgba(var(--surface-rgb),0.14)"}`,
                      background:active?`${tierColor[t]}18`:"rgba(var(--surface-rgb),0.03)",
                      color:active?tierColor[t]:"rgba(var(--ink-rgb),0.7)",
                      opacity:busyId===u.id?0.6:1}}
                  >{t}</button>
                );
              })}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
