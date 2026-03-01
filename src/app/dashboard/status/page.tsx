"use client";

import { useEffect, useState, useCallback } from "react";

interface PriorAuth {
  id: string;
  patientName: string;
  diagnosisCode: string;
  diagnosisDescription: string;
  procedureCode: string;
  procedureDescription: string;
  providerName: string;
  urgency: string;
  status: string;
  statusHistory: { status: string; timestamp: number; note: string }[];
  submittedAt: number;
  updatedAt: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  submitted: { label: "Submitted", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  under_review: { label: "Under Review", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  approved: { label: "Approved", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  denied: { label: "Denied", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  pending_info: { label: "Pending Info", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
};

export default function StatusPage() {
  const [auths, setAuths] = useState<PriorAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const fetchAuths = useCallback(async () => {
    try {
      const res = await fetch("/api/prior-auth");
      const data = await res.json();
      setAuths(data.auths || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuths();
    // Poll every 5 seconds to show status changes
    const interval = setInterval(fetchAuths, 5000);
    return () => clearInterval(interval);
  }, [fetchAuths]);

  const selectedAuth = auths.find((a) => a.id === selected);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claim Status</h1>
          <p className="text-slate-500 mt-1">Track your prior authorization requests. Statuses update automatically.</p>
        </div>
        <button
          onClick={fetchAuths}
          className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : auths.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500">No prior authorizations found.</p>
          <p className="text-sm text-slate-400 mt-1">Submit a prior auth request to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {auths.map((auth) => {
              const cfg = STATUS_CONFIG[auth.status] || STATUS_CONFIG.submitted;
              return (
                <button
                  key={auth.id}
                  onClick={() => setSelected(auth.id)}
                  className={`w-full text-left bg-white rounded-xl border p-5 hover:shadow-md transition ${
                    selected === auth.id ? "border-blue-400 shadow-md" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-bold text-slate-900">{auth.id}</span>
                        {auth.urgency === "urgent" && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">URGENT</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{auth.procedureCode} — {auth.procedureDescription}</p>
                      <p className="text-xs text-slate-400 mt-1">{auth.diagnosisCode} {auth.diagnosisDescription} &middot; {auth.providerName}</p>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-3 text-xs text-slate-400">
                    <span>Submitted: {new Date(auth.submittedAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(auth.updatedAt).toLocaleDateString()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedAuth ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-8">
                <h3 className="font-semibold text-slate-900 mb-4">{selectedAuth.id}</h3>

                <div className="space-y-3 mb-6">
                  <DetailRow label="Patient" value={selectedAuth.patientName} />
                  <DetailRow label="Procedure" value={`${selectedAuth.procedureCode} — ${selectedAuth.procedureDescription}`} />
                  <DetailRow label="Diagnosis" value={`${selectedAuth.diagnosisCode} — ${selectedAuth.diagnosisDescription}`} />
                  <DetailRow label="Provider" value={selectedAuth.providerName} />
                  <DetailRow label="Urgency" value={selectedAuth.urgency} />
                </div>

                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Status History</h4>
                <div className="space-y-0">
                  {selectedAuth.statusHistory.map((entry, i) => {
                    const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.submitted;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full mt-1 ${cfg.color.replace("text-", "bg-")}`} />
                          {i < selectedAuth.statusHistory.length - 1 && (
                            <div className="w-px h-full bg-slate-200 my-1" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</p>
                          <p className="text-xs text-slate-500">{entry.note}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-400">
                Select a prior auth to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}
