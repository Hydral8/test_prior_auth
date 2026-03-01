import { NextRequest, NextResponse } from "next/server";
import { authCodes, sessions, MEMBERS, PROVIDERS } from "@/lib/store";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  const { memberId, code } = await req.json();
  const key = memberId?.toUpperCase();

  const stored = authCodes.get(key);
  if (!stored) {
    return NextResponse.json({ error: "No pending verification. Please request a new code." }, { status: 400 });
  }

  if (Date.now() > stored.expiresAt) {
    authCodes.delete(key);
    return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 });
  }

  if (stored.code !== code) {
    return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 401 });
  }

  authCodes.delete(key);

  const isProvider = key.startsWith("PRV");
  const record = isProvider ? PROVIDERS[key] : MEMBERS[key];

  const sessionId = uuid();
  sessions.set(sessionId, {
    userId: key,
    email: stored.email,
    displayName: record?.name || key,
    role: isProvider ? "provider" : "member",
    providerNpi: isProvider ? PROVIDERS[key]?.npi : undefined,
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set("session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 4,
    path: "/",
  });

  return res;
}
