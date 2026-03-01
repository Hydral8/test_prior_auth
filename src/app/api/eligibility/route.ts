import { NextRequest, NextResponse } from "next/server";
import { sessions, MEMBERS } from "@/lib/store";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get("session")?.value;
  if (!sessionId || !sessions.has(sessionId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { memberId } = await req.json();
  const key = memberId?.toUpperCase();
  const member = MEMBERS[key];

  if (!member) {
    // Simulate 271 rejection
    return NextResponse.json({
      found: false,
      transaction: {
        type: "271",
        status: "Rejected",
        errorCode: "72",
        errorMessage: "Invalid/Missing Subscriber ID",
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Simulate 271 response
  return NextResponse.json({
    found: true,
    transaction: {
      type: "271",
      status: "Active",
      timestamp: new Date().toISOString(),
    },
    member: {
      memberId: key,
      name: member.name,
      plan: member.plan,
      group: member.group,
      effectiveDate: member.effectiveDate,
      termDate: member.termDate,
      copay: member.copay,
      deductible: member.deductible,
      deductibleMet: member.deductibleMet,
      outOfPocketMax: member.outOfPocketMax,
      outOfPocketMet: member.outOfPocketMet,
      coverageStatus: "Active",
    },
  });
}
