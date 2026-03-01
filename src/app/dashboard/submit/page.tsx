"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../layout";

interface MemberOption {
  memberId: string;
  name: string;
  plan: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const isProvider = session?.role === "provider";

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [selectedMember, setSelectedMember] = useState(searchParams.get("memberId") || "");
  const [form, setForm] = useState({
    dateOfBirth: "",
    diagnosisCode: "",
    diagnosisDescription: "",
    procedureCode: "",
    procedureDescription: "",
    providerName: "",
    providerNpi: "",
    urgency: "routine" as "routine" | "urgent",
    notes: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isProvider) {
      fetch("/api/members").then((r) => r.json()).then((d) => setMembers(d.members || []));
    }
  }, [isProvider]);

  useEffect(() => {
    if (!isProvider || !session) return;
    setForm((prev) => ({
      ...prev,
      providerName: session.displayName || prev.providerName,
      providerNpi: session.providerNpi || prev.providerNpi,
    }));
  }, [isProvider, session]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/prior-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...(isProvider && selectedMember ? { memberId: selectedMember } : {}),
          attachments: files.map((f) => f.name),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <div className="max-w-lg mx-auto mt-16 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Prior Auth Submitted</h2>
          <p className="text-slate-500 mb-1">Your request has been submitted successfully.</p>
          <p className="text-lg font-mono font-bold text-blue-700 mb-6">{success}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard/status")}
              className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 transition text-sm"
            >
              View Status
            </button>
            <button
              onClick={() => { setSuccess(null); setForm({ dateOfBirth: "", diagnosisCode: "", diagnosisDescription: "", procedureCode: "", procedureDescription: "", providerName: "", providerNpi: "", urgency: "routine", notes: "" }); setFiles([]); setSelectedMember(""); }}
              className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-200 transition text-sm"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Submit Prior Authorization</h1>
        <p className="text-slate-500 mt-1">
          {isProvider
            ? "Submit a prior authorization request on behalf of a member."
            : "Complete the form below to submit a new prior authorization request."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Member selector for providers */}
        {isProvider && (
          <Section title="Select Member">
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="">Choose a member...</option>
              {members.map((m) => (
                <option key={m.memberId} value={m.memberId}>
                  {m.memberId} — {m.name} ({m.plan})
                </option>
              ))}
            </select>
          </Section>
        )}

        {/* Patient Info */}
        <Section title="Patient Information">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(v) => update("dateOfBirth", v)} required />
          </div>
        </Section>

        {/* Diagnosis */}
        <Section title="Diagnosis">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="ICD-10 Code" value={form.diagnosisCode} onChange={(v) => update("diagnosisCode", v)} placeholder="e.g. M54.5" required />
            <InputField label="Description" value={form.diagnosisDescription} onChange={(v) => update("diagnosisDescription", v)} placeholder="e.g. Low back pain" required />
          </div>
        </Section>

        {/* Procedure */}
        <Section title="Requested Service / Procedure">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="CPT / HCPCS Code" value={form.procedureCode} onChange={(v) => update("procedureCode", v)} placeholder="e.g. 72148" required />
            <InputField label="Description" value={form.procedureDescription} onChange={(v) => update("procedureDescription", v)} placeholder="e.g. MRI Lumbar Spine" required />
          </div>
        </Section>

        {/* Provider */}
        <Section title="Requesting Provider">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Provider Name"
              value={form.providerName}
              onChange={(v) => update("providerName", v)}
              placeholder="e.g. Dr. Sarah Chen"
              required
              readOnly={isProvider}
            />
            <InputField
              label="NPI"
              value={form.providerNpi}
              onChange={(v) => update("providerNpi", v)}
              placeholder="10-digit NPI"
              required
              readOnly={isProvider}
            />
          </div>
          {isProvider && (
            <p className="text-xs text-slate-500 mt-3">Provider details are auto-filled from your signed-in profile.</p>
          )}
        </Section>

        {/* Urgency */}
        <Section title="Urgency">
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition text-sm ${form.urgency === "routine" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="urgency" checked={form.urgency === "routine"} onChange={() => update("urgency", "routine")} className="sr-only" />
              <span className={`w-3 h-3 rounded-full border-2 ${form.urgency === "routine" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`} />
              Routine
            </label>
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition text-sm ${form.urgency === "urgent" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 hover:border-slate-300"}`}>
              <input type="radio" name="urgency" checked={form.urgency === "urgent"} onChange={() => update("urgency", "urgent")} className="sr-only" />
              <span className={`w-3 h-3 rounded-full border-2 ${form.urgency === "urgent" ? "border-red-600 bg-red-600" : "border-slate-300"}`} />
              Urgent
            </label>
          </div>
        </Section>

        {/* Clinical Notes */}
        <Section title="Clinical Notes">
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={4}
            placeholder="Provide clinical justification and relevant history..."
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
          />
        </Section>

        {/* Attachments */}
        <Section title="Supporting Documents">
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-slate-500">Click to upload clinical documents, lab results, imaging reports</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB each</p>
          </div>
          <input
            id="file-input"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
          />
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {f.name}
                  <span className="text-xs text-slate-400 ml-auto">{(f.size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50 text-sm"
          >
            {loading ? "Submitting..." : "Submit Prior Authorization"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, type = "text", required = false, readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        readOnly={readOnly}
        className={`w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm ${
          readOnly ? "bg-slate-100 text-slate-600 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
