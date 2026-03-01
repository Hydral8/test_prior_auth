import { NextRequest, NextResponse } from "next/server";
import { sessions, priorAuths, MEMBERS } from "@/lib/store";
import type { PriorAuth } from "@/lib/store";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId || !sessions.has(sessionId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = sessions.get(sessionId)!;

  // Simulate status progression — randomly advance statuses
  for (const [, pa] of priorAuths) {
    if (session.role === "provider" || pa.memberId === session.userId) {
      simulateStatusChange(pa);
    }
  }

  // Providers see all auths, members see only their own
  const auths = Array.from(priorAuths.values())
    .filter((a) => session.role === "provider" || a.memberId === session.userId)
    .sort((a, b) => b.submittedAt - a.submittedAt);

  return NextResponse.json({ auths });
}

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId || !sessions.has(sessionId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = sessions.get(sessionId)!;
  const body = await req.json();

  // Providers can specify a memberId; members always use their own
  const memberId = session.role === "provider" && body.memberId
    ? body.memberId.toUpperCase()
    : session.userId;

  const member = MEMBERS[memberId];
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const id = `PA-${new Date().getFullYear()}-${String(priorAuths.size + 1).padStart(4, "0")}`;
  const now = Date.now();

  const pa: PriorAuth = {
    id,
    memberId,
    patientName: member.name,
    dateOfBirth: body.dateOfBirth || "",
    diagnosisCode: body.diagnosisCode || "",
    diagnosisDescription: body.diagnosisDescription || "",
    procedureCode: body.procedureCode || "",
    procedureDescription: body.procedureDescription || "",
    providerName: body.providerName || "",
    providerNpi: body.providerNpi || "",
    urgency: body.urgency || "routine",
    notes: body.notes || "",
    attachments: body.attachments || [],
    status: "submitted",
    statusHistory: [
      { status: "submitted", timestamp: now, note: "Prior authorization request received" },
    ],
    submittedAt: now,
    updatedAt: now,
  };

  priorAuths.set(id, pa);

  return NextResponse.json({ success: true, id });
}

function simulateStatusChange(pa: PriorAuth) {
  if (Math.random() > 0.3) return;

  const transitions: Record<string, string[]> = {
    submitted: ["under_review"],
    under_review: ["approved", "denied", "pending_info"],
    pending_info: ["under_review", "denied"],
  };

  const next = transitions[pa.status];
  if (!next) return;

  const newStatus = next[Math.floor(Math.random() * next.length)];
  const notes: Record<string, string> = {
    under_review: "Assigned to clinical reviewer",
    approved: "Meets medical necessity criteria per clinical guidelines",
    denied: "Does not meet medical necessity criteria. Appeal rights enclosed.",
    pending_info: "Additional clinical documentation required from provider",
  };

  pa.status = newStatus as PriorAuth["status"];
  pa.updatedAt = Date.now();
  pa.statusHistory.push({
    status: newStatus,
    timestamp: Date.now(),
    note: notes[newStatus] || "",
  });
}
