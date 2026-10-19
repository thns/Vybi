import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isAdminEmail } from "@/lib/admin";

const PUBLIC_PREFIXES = ["/login", "/signup", "/forgot-password", "/shared"];

// Edge-safe config (no DB adapter, no bcrypt). Used by middleware AND spread
// into the full node-runtime config in auth.ts.
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [
    // OAuth providers are edge-safe. Only enabled when credentials are present.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // API routes self-enforce auth (returning 401 JSON via requireUser),
      // so the middleware never redirects them to an HTML login page.
      if (pathname.startsWith("/api")) return true;

      const isAuthPage = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

      // Logged-in users shouldn't sit on the auth pages.
      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", request.nextUrl));
        return true;
      }

      // Anonymous/guest mode: a local guest cookie grants app access without auth.
      const isGuest = request.cookies.get("vybi_guest")?.value === "1";
      if (isGuest) return true;

      // Everything else requires a session.
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        // These fields ride along from authorize()/the adapter user row.
        const u = user as { subscriptionTier?: string; onboarded?: boolean; email?: string | null };
        token.subscriptionTier = u.subscriptionTier ?? "free";
        token.onboarded = u.onboarded ?? false;
        token.isAdmin = isAdminEmail(u.email ?? (token.email as string | undefined));
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      session.user.subscriptionTier =
        (token.subscriptionTier as "free" | "core" | "premium") ?? "free";
      session.user.onboarded = (token.onboarded as boolean) ?? false;
      // Re-evaluate from the email each time so an ADMIN_EMAILS change takes
      // effect on the next session read without needing a fresh sign-in.
      session.user.isAdmin =
        isAdminEmail(session.user.email) || (token.isAdmin as boolean) || false;
      return session;
    },
  },
} satisfies NextAuthConfig;
