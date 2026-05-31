import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      subscriptionTier: "free" | "core" | "premium";
      onboarded: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    subscriptionTier?: "free" | "core" | "premium";
    onboarded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    subscriptionTier?: "free" | "core" | "premium";
    onboarded?: boolean;
  }
}
