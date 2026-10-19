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

/**
 * Like requireUser, but also requires the user to be an admin (ADMIN_EMAILS).
 * Returns 401 if not signed in, 403 if signed in but not an admin.
 */
export async function requireAdmin(): Promise<{ userId: string } | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { userId: session.user.id };
}
