import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { gatherUserData } from "@/lib/export/gather";

export const runtime = "nodejs";

// GET /api/export — full JSON download of the user's data.
export async function GET() {
  const guard = await requireUser();
  if (guard instanceof NextResponse) return guard;

  const data = await gatherUserData(guard.userId);
  const date = data.exportedAt.slice(0, 10);

  return new NextResponse(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="vybi-export-${date}.json"`,
    },
  });
}
