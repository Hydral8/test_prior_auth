"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "./layout";

interface AuthSummary {
  id: string;
  memberId: string;
  patientName: string;
  procedureCode: string;
  procedureDescription: string;
  status: string;
  submittedAt: number;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  denied: "bg-red-100 text-red-700",
  pending_info: "bg-purple-100 text-purple-700",
};

export default function DashboardPage() {
  const session = useSession();
  const [auths, setAuths] = useState<AuthSummary[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    fetch("/api/prior-auth").then((r) => r.json()).then((d) => setAuths(d.auths || []));
    if (session?.role === "provider") {
      fetch("/api/members").then((r) => r.json()).then((d) => setMemberCount(d.members?.length || 0));
    }
  }, [session?.role]);

  const isProvider = session?.role === "provider";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back{session ? `, ${session.displayName}` : ""}
        </h1>
        <p className="text-slate-500 mt-1">
          {isProvider
            ? "Manage prior authorizations and view member information across your panel."
            : "Manage your prior authorizations and check eligibility."}
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-6 mb-8 ${isProvider ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">{isProvider ? "Provider ID" : "Member ID"}</div>
          <div className="text-2xl font-bold text-slate-900">{session?.userId || "—"}</div>
        </div>
        {isProvider && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm font-medium text-slate-500 mb-1">Members in Panel</div>
            <div className="text-2xl font-bold text-slate-900">{memberCount}</div>
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">Prior Authorizations</div>
          <div className="text-2xl font-bold text-slate-900">{auths.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 mb-1">Portal Status</div>
          <div className="text-2xl font-bold text-green-600">Active</div>
        </div>
      </div>

      {/* Recent auths for providers */}
      {isProvider && auths.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Authorizations</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Auth ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Member</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Procedure</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {auths.slice(0, 5).map((auth) => (
                  <tr key={auth.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{auth.id}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-900">{auth.patientName}</div>
                      <div className="text-xs text-slate-400">{auth.memberId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{auth.procedureCode} — {auth.procedureDescription}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[auth.status] || ""}`}>
                        {auth.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{new Date(auth.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className={`grid grid-cols-1 gap-4 ${isProvider ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {isProvider && (
          <Link
            href="/dashboard/members"
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-md transition group"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition">
              <svg className="w-5 h-5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Member Panel</h3>
            <p className="text-sm text-slate-500">View all members and their eligibility details</p>
          </Link>
        )}

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
          <p className="text-sm text-slate-500">{isProvider ? "Submit on behalf of a member" : "Submit a new prior authorization request"}</p>
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
          <h3 className="font-semibold text-slate-900 mb-1">{isProvider ? "All Authorizations" : "Claim Status"}</h3>
          <p className="text-sm text-slate-500">{isProvider ? "View and track all prior auth requests" : "Track authorization status and history"}</p>
        </Link>
      </div>
    </div>
  );
}
