"use client";

import { useEffect, useState } from "react";
import { useSession } from "../layout";
import { useRouter } from "next/navigation";

interface Member {
  memberId: string;
  name: string;
  plan: string;
  group: string;
  effectiveDate: string;
  termDate: string;
}

interface EligibilityDetail {
  member: {
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

export default function MembersPage() {
  const session = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<EligibilityDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (session?.role !== "provider") {
      router.push("/dashboard");
      return;
    }
    fetch("/api/members")
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .finally(() => setLoading(false));
  }, [session, router]);

  async function selectMember(memberId: string) {
    setSelected(memberId);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch("/api/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (data.found) setDetail(data);
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  }

  if (session?.role !== "provider") return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Member Panel</h1>
        <p className="text-slate-500 mt-1">View all members in your panel and their eligibility details.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member List */}
          <div className="lg:col-span-1 space-y-3">
            {members.map((m) => (
              <button
                key={m.memberId}
                onClick={() => selectMember(m.memberId)}
                className={`w-full text-left bg-white rounded-xl border p-4 hover:shadow-md transition ${
                  selected === m.memberId ? "border-blue-400 shadow-md" : "border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-500">
                    {m.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.memberId} &middot; {m.plan}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {detailLoading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
              </div>
            ) : detail ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-semibold text-green-700">Coverage Active</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">{detail.member.memberId}</span>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Member Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Field label="Name" value={detail.member.name} />
                      <Field label="Plan" value={detail.member.plan} />
                      <Field label="Group" value={detail.member.group} />
                      <Field label="Coverage Status" value={detail.member.coverageStatus} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Coverage Period</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Effective Date" value={detail.member.effectiveDate} />
                      <Field label="Term Date" value={detail.member.termDate} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Benefits Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Field label="Copay" value={detail.member.copay} />
                      <Field label="Deductible" value={detail.member.deductible} />
                      <Field label="Deductible Met" value={detail.member.deductibleMet} />
                      <Field label="OOP Maximum" value={detail.member.outOfPocketMax} />
                      <Field label="OOP Met" value={detail.member.outOfPocketMet} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => router.push(`/dashboard/submit?memberId=${detail.member.memberId}`)}
                      className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
                    >
                      Submit Prior Auth
                    </button>
                    <button
                      onClick={() => router.push("/dashboard/status")}
                      className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
                    >
                      View Authorizations
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-sm text-slate-400">
                Select a member to view their eligibility details
              </div>
            )}
          </div>
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
