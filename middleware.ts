import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware: validates the JWT session and runs the `authorized`
// callback to gate protected routes / redirect to /login.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
