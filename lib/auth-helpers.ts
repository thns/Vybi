import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Resolves the authenticated user id for an API route, or returns a 401
 * response to throw back to the client. Usage:
 *
 *   const session = await requireUser();
 *   if (session instanceof NextResponse) return session;
 *   const userId = session.userId;
 */
export async function requireUser(): Promise<{ userId: string } | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId: session.user.id };
}
