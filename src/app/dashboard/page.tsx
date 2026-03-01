"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [session, setSession] = useState<{ memberName: string; memberId: string } | null>(null);
  const [authCount, setAuthCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then(setSession);
    fetch("/api/prior-auth").then((r) => r.json()).then((d) => setAuthCount(d.auths?.length || 0));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{session ? `, ${session.memberName}` : ""}
        </h1>
        <p className="text-slate-500 mt-1">Manage your prior authorizations and check eligibility.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">Member ID</div>
          <div className="text-2xl font-bold text-slate-900">{session?.memberId || "—"}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">Prior Authorizations</div>
          <div className="text-2xl font-bold text-slate-900">{authCount}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">Portal Status</div>
          <div className="text-2xl font-bold text-green-600">Active</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/eligibility"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition">
            <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Eligibility Lookup</h3>
          <p className="text-sm text-slate-500">Check member eligibility and benefits (270/271)</p>
        </Link>

        <Link
          href="/dashboard/submit"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-100 transition">
            <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Submit Prior Auth</h3>
          <p className="text-sm text-slate-500">Submit a new prior authorization request</p>
        </Link>

        <Link
          href="/dashboard/status"
          className="bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-md transition group"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-100 transition">
            <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Claim Status</h3>
          <p className="text-sm text-slate-500">Track authorization status and history</p>
        </Link>
      </div>
    </div>
  );
}
