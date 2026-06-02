import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#1a0a2e 0%,#2d1155 100%)",
        fontFamily: "DM Sans,sans-serif",
        padding: 20,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        input::placeholder{color:rgba(245,230,255,0.3);}`}</style>
      <div style={{ width: 360, maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          { /* eslint-disable-next-line @next/next/no-img-element */ }
          <img
            src="/logo-mark.png"
            alt="Vybi"
            width={60}
            height={60}
            style={{ display: "block", margin: "0 auto 6px", filter: "drop-shadow(0 6px 20px rgba(233,30,140,0.35))" }}
          />
          <div
            style={{
              fontFamily: "Cormorant Garamond,Georgia,serif",
              fontSize: 40,
              lineHeight: 1,
              color: "#ffffff",
              letterSpacing: "0.02em",
            }}
          >
            VYBI
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#c39bd3",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            View Your Biome Intelligence
          </div>
        </div>

        <div
          style={{
            background: "rgba(45,17,85,0.55)",
            borderRadius: 22,
            border: "1px solid rgba(195,155,211,0.2)",
            padding: 22,
            backdropFilter: "blur(12px)",
          }}
        >
          <h1 style={{ color: "#f5e6ff", fontSize: 21, fontWeight: 600, marginBottom: 2 }}>
            {title}
          </h1>
          <p style={{ color: "rgba(245,230,255,0.5)", fontSize: 13, marginBottom: 16 }}>
            {subtitle}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}

// Shared field + button styles for the auth forms.
export const authStyles = {
  label: {
    display: "block",
    color: "rgba(245,230,255,0.7)",
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "DM Sans,sans-serif",
  } as const,
  input: {
    width: "100%",
    background: "rgba(26,10,46,0.6)",
    border: "1px solid rgba(195,155,211,0.25)",
    borderRadius: 12,
    padding: "10px 14px",
    color: "#f5e6ff",
    fontSize: 14,
    marginBottom: 12,
    fontFamily: "DM Sans,sans-serif",
    outline: "none",
  } as const,
  primary: {
    width: "100%",
    background: "linear-gradient(135deg,#e91e8c,#ff6eb4)",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "DM Sans,sans-serif",
  } as const,
  google: {
    width: "100%",
    background: "rgba(245,230,255,0.07)",
    border: "1px solid rgba(195,155,211,0.3)",
    borderRadius: 12,
    padding: "11px 14px",
    color: "#f5e6ff",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "DM Sans,sans-serif",
  } as const,
  link: { color: "#ff6eb4", textDecoration: "none", fontWeight: 500 } as const,
  error: {
    background: "rgba(255,80,80,0.12)",
    border: "1px solid rgba(255,80,80,0.3)",
    color: "#ff9d9d",
    fontSize: 12,
    borderRadius: 10,
    padding: "9px 12px",
    marginBottom: 16,
  } as const,
  note: { color: "rgba(245,230,255,0.45)", fontSize: 12, textAlign: "center" as const, marginTop: 12 },
};
