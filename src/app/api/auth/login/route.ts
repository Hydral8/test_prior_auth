import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { authCodes, MEMBERS, PROVIDERS } from "@/lib/store";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { memberId, email } = await req.json();

  if (!memberId || !email) {
    return NextResponse.json({ error: "ID and email are required" }, { status: 400 });
  }

  const key = memberId.toUpperCase();
  const isProvider = key.startsWith("PRV");
  const record = isProvider ? PROVIDERS[key] : MEMBERS[key];

  if (!record) {
    return NextResponse.json({ error: `${isProvider ? "Provider" : "Member"} ID not found` }, { status: 404 });
  }

  // Set email on record for this session
  record.email = email;

  const code = String(Math.floor(100000 + Math.random() * 900000));

  authCodes.set(key, {
    code,
    memberId: key,
    email,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: email,
      subject: "Your Payer Portal Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #1e40af;">Payer Portal — Verification Code</h2>
          <p>Hello ${record.name},</p>
          <p>Your one-time verification code is:</p>
          <div style="background: #f0f4ff; border: 2px solid #1e40af; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Payer Portal Simulator — Demo Application</p>
        </div>
      `,
    });
  } catch {
    console.log(`\n[DEV] Verification code for ${key}: ${code}\n`);
  }

  return NextResponse.json({
    success: true,
    memberName: record.name,
    role: isProvider ? "provider" : "member",
  });
}
