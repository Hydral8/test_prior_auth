"use client";

import { useState } from "react";

interface EligibilityResult {
  found: boolean;
  transaction: { type: string; status: string; timestamp: string; errorCode?: string; errorMessage?: string };
  member?: {
    memberId: string;
    name: string;
    plan: string;
    group: string;
    effectiveDate: string;
    termDate: string;
    copay: string;
    deductible: string;
    deductibleMet: string;
    outOfPocketMax: string;
    outOfPocketMet: string;
    coverageStatus: string;
  };
}

export default function EligibilityPage() {
  const [memberId, setMemberId] = useState("");
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Eligibility Lookup</h1>
        <p className="text-slate-500 mt-1">HIPAA X12 270/271 — Member Eligibility Inquiry & Response</p>
      </div>

      {/* 270 Request */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-blue-100 text-blue-700 text-xs font-mono font-bold px-2 py-1 rounded">270</span>
          <h2 className="font-semibold text-slate-900">Eligibility Inquiry</h2>
        </div>

        <form onSubmit={handleLookup} className="flex gap-3">
          <input
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Enter Member ID (e.g. MBR001)"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50 text-sm"
          >
            {loading ? "Querying..." : "Submit 270"}
          </button>
        </form>
      </div>

      {/* 271 Response */}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${result.found ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>271</span>
            <h2 className="font-semibold text-slate-900">Eligibility Response</h2>
            <span className="ml-auto text-xs text-slate-400 font-mono">{result.transaction.timestamp}</span>
          </div>

          {!result.found ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-800">Member Not Found</p>
              <p className="text-sm text-red-600 mt-1">
                Error {result.transaction.errorCode}: {result.transaction.errorMessage}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Coverage Status */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-semibold text-green-700">Coverage Active</span>
              </div>

              {/* Member Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Member Information</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Field label="Member ID" value={result.member!.memberId} />
                  <Field label="Name" value={result.member!.name} />
                  <Field label="Plan" value={result.member!.plan} />
                  <Field label="Group" value={result.member!.group} />
                </div>
              </div>

              {/* Coverage Dates */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Coverage Period</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Effective Date" value={result.member!.effectiveDate} />
                  <Field label="Term Date" value={result.member!.termDate} />
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Benefit Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Field label="Copay" value={result.member!.copay} />
                  <Field label="Deductible" value={result.member!.deductible} />
                  <Field label="Deductible Met" value={result.member!.deductibleMet} />
                  <Field label="OOP Maximum" value={result.member!.outOfPocketMax} />
                  <Field label="OOP Met" value={result.member!.outOfPocketMet} />
                </div>
              </div>

              {/* Raw transaction */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Transaction Details</h3>
                <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-600 overflow-x-auto">
{JSON.stringify(result.transaction, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400 mb-0.5">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
