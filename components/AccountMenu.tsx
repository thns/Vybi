"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function AccountMenu({ setScreen }: { setScreen?: (s: string) => void }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const user = session?.user;
  const display = user?.name || user?.email || "Guest";
  const initial = display.trim().charAt(0).toUpperCase();
  const tier = user?.subscriptionTier ? `Vybi ${cap(user.subscriptionTier)}` : "Guest mode";

  const logout = async () => {
    document.cookie = "vybi_guest=; path=/; max-age=0; SameSite=Lax";
    if (user) await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  return (
    <div style={{ position: "absolute", top: 12, right: 12, zIndex: 50 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(135deg,#e91e8c,#9b59b6)",
          color: "#fff",
          fontFamily: "DM Sans,sans-serif",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
          overflow: "hidden",
          padding: 0,
        }}
      >
        {user?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initial
        )}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: "absolute",
              top: 42,
              right: 0,
              width: 210,
              zIndex: 50,
              background: "rgba(36,14,64,0.98)",
              border: "1px solid rgba(195,155,211,0.25)",
              borderRadius: 14,
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px)",
              overflow: "hidden",
              fontFamily: "DM Sans,sans-serif",
            }}
          >
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 13, color: "#f5e6ff", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {display}
              </div>
              {user?.email && user?.name && (
                <div style={{ fontSize: 11, color: "rgba(245,230,255,0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </div>
              )}
              <div style={{ fontSize: 10, color: "#ff6eb4", marginTop: 4, letterSpacing: "0.04em" }}>{tier}</div>
            </div>

            <MenuItem
              label="Settings"
              onClick={() => {
                setScreen?.("Settings");
                setOpen(false);
              }}
            />
            <MenuItem
              label="Subscription"
              onClick={() => {
                setScreen?.("Subscription");
                setOpen(false);
              }}
            />
            {user ? (
              <MenuItem label="Log out" danger onClick={logout} />
            ) : (
              <MenuItem label="Sign in / Create account" onClick={() => router.push("/login")} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "11px 14px",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontFamily: "DM Sans,sans-serif",
        fontSize: 13,
        color: danger ? "#ff9d9d" : "#f5e6ff",
      }}
    >
      {label}
    </button>
  );
}
