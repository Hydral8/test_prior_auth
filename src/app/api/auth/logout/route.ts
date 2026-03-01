import { NextRequest, NextResponse } from "next/server";
import { sessions } from "@/lib/store";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (sessionId) {
    sessions.delete(sessionId);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete("session");
  return res;
}
