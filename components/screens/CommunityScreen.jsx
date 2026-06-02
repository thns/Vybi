import { useState, useEffect } from "react";
import { C } from "../vybi-data.js";
import { Card, GlowOrb } from "../vybi-ui.jsx";
import { api } from "../../lib/client-api.ts";

const ROOMS = [
  { id: "cycle", label: "Cycle talk", icon: "🌙" },
  { id: "ttc", label: "Conceiving", icon: "🤍" },
  { id: "biome", label: "Biome & BV", icon: "◈" },
  { id: "pcos", label: "PCOS", icon: "◇" },
  { id: "mental", label: "Mood & mind", icon: "🧠" },
  { id: "pregnancy", label: "Pregnancy", icon: "🤰" },
];

const ago = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

export function CommunityScreen() {
  const [room, setRoom] = useState("cycle");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(null); // post detail

  const loadRoom = async (r) => {
    setLoading(true);
    const res = await api.community(r);
    setPosts(res?.posts ?? []);
    setLoading(false);
  };
  useEffect(() => { loadRoom(room); }, [room]);

  const submit = async () => {
    if (draft.trim().length < 2) return;
    setBusy(true);
    await api.createPost(room, draft.trim());
    setDraft("");
    setBusy(false);
    loadRoom(room);
  };

  if (open) return <PostDetail postId={open} onBack={() => { setOpen(null); loadRoom(room); }} />;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontFamily: "Cormorant Garamond,Georgia,serif", fontSize: 26, color: C.pearl }}>Community</div>
        <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: C.mint, marginBottom: 10 }}>Anonymous · Be kind · You're “{posts[0]?.mine ? posts.find((p) => p.mine)?.anonName : "anonymous"}”</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
          {ROOMS.map((r) => (
            <button key={r.id} onClick={() => setRoom(r.id)} style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${room === r.id ? C.fuchsia : "rgba(255,255,255,0.1)"}`, background: room === r.id ? `${C.fuchsia}20` : "transparent", color: room === r.id ? C.fuchsia : "rgba(245,230,255,0.5)", fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{r.icon} {r.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        <GlowOrb color={C.fuchsia} size={200} opacity={0.1} x={80} y={-10} />

        <Card>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Share with the ${ROOMS.find((r) => r.id === room)?.label} room…`} rows={2}
            style={{ width: "100%", background: "rgba(26,10,46,0.6)", border: "1px solid rgba(195,155,211,0.25)", borderRadius: 10, padding: "10px 12px", color: C.pearl, fontFamily: "DM Sans,sans-serif", fontSize: 13, outline: "none", resize: "none" }} />
          <button onClick={submit} disabled={busy || draft.trim().length < 2} style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.fuchsia},${C.amethyst})`, color: "#fff", fontFamily: "DM Sans,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: busy || draft.trim().length < 2 ? 0.6 : 1 }}>{busy ? "Posting…" : "Post anonymously"}</button>
        </Card>

        {loading ? (
          <div style={{ color: "rgba(245,230,255,0.4)", fontFamily: "DM Sans,sans-serif", fontSize: 12 }}>Loading…</div>
        ) : posts.length === 0 ? (
          <div style={{ color: "rgba(245,230,255,0.4)", fontFamily: "DM Sans,sans-serif", fontSize: 12, textAlign: "center", padding: 20 }}>No posts yet — start the conversation 💬</div>
        ) : (
          posts.map((p) => (
            <Card key={p.id} style={{ cursor: "pointer" }} onClick={() => setOpen(p.id)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 600, color: p.mine ? C.fuchsia : C.lavender }}>{p.anonName}{p.mine ? " · you" : ""}</span>
                <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: "rgba(245,230,255,0.35)" }}>{ago(p.createdAt)}</span>
              </div>
              <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 13, color: "rgba(245,230,255,0.85)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{p.body}</div>
              <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, color: C.mint, marginTop: 8 }}>💬 {p.replyCount || 0} {p.replyCount === 1 ? "reply" : "replies"}</div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function PostDetail({ postId, onBack }) {
  const [data, setData] = useState(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => { const res = await api.communityPost(postId); setData(res); };
  useEffect(() => { load(); }, [postId]);

  const reply = async () => {
    if (draft.trim().length < 2) return;
    setBusy(true);
    await api.communityReply(postId, draft.trim());
    setDraft("");
    setBusy(false);
    load();
  };
  const report = async (b) => { await api.communityReport(b); alert("Reported. Thank you — our team will review."); };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 16px 8px" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.lavender, fontFamily: "DM Sans,sans-serif", fontSize: 13, cursor: "pointer", padding: 0 }}>‹ Community</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        {!data ? <div style={{ color: "rgba(245,230,255,0.4)", fontFamily: "DM Sans,sans-serif", fontSize: 12 }}>Loading…</div> : (
          <>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 600, color: data.post.mine ? C.fuchsia : C.lavender }}>{data.post.anonName}{data.post.mine ? " · you" : ""}</span>
                {!data.post.mine && <span onClick={() => report({ postId })} style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: "rgba(245,230,255,0.4)", cursor: "pointer" }}>Report</span>}
              </div>
              <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 14, color: "rgba(245,230,255,0.9)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{data.post.body}</div>
            </Card>

            <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 10, color: "rgba(245,230,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{data.replies.length} {data.replies.length === 1 ? "reply" : "replies"}</div>
            {data.replies.map((r) => (
              <Card key={r.id} style={{ padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "DM Sans,sans-serif", fontSize: 11, fontWeight: 600, color: r.mine ? C.fuchsia : C.lavender }}>{r.anonName}{r.mine ? " · you" : ""}</span>
                  {!r.mine && <span onClick={() => report({ replyId: r.id })} style={{ fontFamily: "DM Sans,sans-serif", fontSize: 9, color: "rgba(245,230,255,0.35)", cursor: "pointer" }}>Report</span>}
                </div>
                <div style={{ fontFamily: "DM Sans,sans-serif", fontSize: 13, color: "rgba(245,230,255,0.82)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{r.body}</div>
              </Card>
            ))}

            <Card>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a kind reply…" rows={2}
                style={{ width: "100%", background: "rgba(26,10,46,0.6)", border: "1px solid rgba(195,155,211,0.25)", borderRadius: 10, padding: "10px 12px", color: C.pearl, fontFamily: "DM Sans,sans-serif", fontSize: 13, outline: "none", resize: "none" }} />
              <button onClick={reply} disabled={busy || draft.trim().length < 2} style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.fuchsia},${C.amethyst})`, color: "#fff", fontFamily: "DM Sans,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: busy || draft.trim().length < 2 ? 0.6 : 1 }}>{busy ? "Sending…" : "Reply"}</button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
