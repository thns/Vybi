"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { AuthShell, authStyles as s } from "./AuthShell";

export function ForgotPasswordForm({ magicLinkEnabled }: { magicLinkEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Passwordless recovery: send a magic sign-in link. Once signed in the user
    // can set a new password from Settings.
    await signIn("resend", { email, redirect: false });
    setLoading(false);
    setSent(true);
  }

  if (!magicLinkEnabled) {
    return (
      <AuthShell title="Reset password" subtitle="Recover access to your account">
        <div style={s.error}>
          Email-based recovery isn’t configured yet. Add a Resend API key
          (<code>AUTH_RESEND_KEY</code>) to enable magic-link recovery.
        </div>
        <div style={s.note}>
          <a href="/login" style={s.link}>
            Back to sign in
          </a>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset password" subtitle="We’ll email you a secure sign-in link">
      {sent ? (
        <>
          <div
            style={{
              background: "rgba(184,240,230,0.1)",
              border: "1px solid rgba(184,240,230,0.3)",
              color: "#b8f0e6",
              fontSize: 13,
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            If an account exists for <strong>{email}</strong>, a sign-in link is on its way.
          </div>
          <div style={s.note}>
            <a href="/login" style={s.link}>
              Back to sign in
            </a>
          </div>
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button style={{ ...s.primary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? "Sending…" : "Send sign-in link"}
          </button>
          <div style={s.note}>
            <a href="/login" style={s.link}>
              Back to sign in
            </a>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
