import { NextRequest, NextResponse } from "next/server";
import { sessions, MEMBERS } from "@/lib/store";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId || !sessions.has(sessionId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = sessions.get(sessionId)!;
  if (session.role !== "provider") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const members = Object.entries(MEMBERS).map(([id, m]) => ({
    memberId: id,
    name: m.name,
    plan: m.plan,
    group: m.group,
    effectiveDate: m.effectiveDate,
    termDate: m.termDate,
  }));

  return NextResponse.json({ members });
}
