"use client";

export function ReportActions() {
  return (
    <div className="no-print" style={{ display: "flex", gap: 10, marginBottom: 20 }}>
      <button
        onClick={() => window.print()}
        style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "#9b59b6", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
      >
        🖨 Print / Save as PDF
      </button>
      <a
        href="/api/export"
        style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #c9b6d8", background: "#fff", color: "#6b3a8a", fontWeight: 600, cursor: "pointer", fontSize: 14, textDecoration: "none" }}
      >
        ⬇ Download data (JSON)
      </a>
      <a
        href="/"
        style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#666", fontWeight: 600, cursor: "pointer", fontSize: 14, textDecoration: "none" }}
      >
        ← Back to app
      </a>
    </div>
  );
}
