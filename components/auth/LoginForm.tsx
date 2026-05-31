"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell, authStyles as s } from "./AuthShell";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  function continueAnonymously() {
    document.cookie = "vybi_guest=1; path=/; max-age=31536000; SameSite=Lax";
    router.push("/");
    router.refresh();
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Vybi account">
      {error && <div style={s.error}>{error}</div>}
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
        <label style={s.label}>Password</label>
        <input
          style={s.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
        <button style={{ ...s.primary, opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div style={{ textAlign: "right", marginTop: 10 }}>
        <a href="/forgot-password" style={{ ...s.link, fontSize: 12 }}>
          Forgot password?
        </a>
      </div>

      {googleEnabled && (
        <>
          <Divider />
          <button style={s.google} onClick={() => signIn("google", { callbackUrl: "/" })}>
            Continue with Google
          </button>
        </>
      )}

      <Divider />
      <button style={s.google} onClick={continueAnonymously}>
        Continue anonymously
      </button>

      <div style={s.note}>
        New to Vybi?{" "}
        <a href="/signup" style={s.link}>
          Create an account
        </a>
      </div>
    </AuthShell>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(195,155,211,0.18)" }} />
      <span style={{ color: "rgba(245,230,255,0.35)", fontSize: 11 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "rgba(195,155,211,0.18)" }} />
    </div>
  );
}
