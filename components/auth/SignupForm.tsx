"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell, authStyles as s } from "./AuthShell";

export function SignupForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      // Auto sign-in after successful registration.
      const signin = await signIn("credentials", { email, password, redirect: false });
      setLoading(false);
      if (signin?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Start understanding your body with Vybi">
      {error && <div style={s.error}>{error}</div>}
      <form onSubmit={onSubmit}>
        <label style={s.label}>Name</label>
        <input
          style={s.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <label style={s.label}>Email</label>
        <input
          style={s.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          minLength={8}
          required
        />
        <button style={{ ...s.primary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(195,155,211,0.18)" }} />
            <span style={{ color: "rgba(245,230,255,0.35)", fontSize: 11 }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(195,155,211,0.18)" }} />
          </div>
          <button style={s.google} onClick={() => signIn("google", { callbackUrl: "/" })}>
            Continue with Google
          </button>
        </>
      )}

      <div style={s.note}>
        Already have an account?{" "}
        <a href="/login" style={s.link}>
          Sign in
        </a>
      </div>
    </AuthShell>
  );
}
