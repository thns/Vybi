import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware: validates the JWT session and runs the `authorized`
// callback to gate protected routes / redirect to /login.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on page routes only. Exclude /api (routes self-enforce auth via
  // requireUser) — critically, /api/auth must be handled solely by Auth.js's
  // route handler, otherwise the middleware double-sets the CSRF cookie and
  // logins fail with MissingCSRF behind HTTPS.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
