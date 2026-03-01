"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"login" | "verify">("login");
  const [memberId, setMemberId] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [memberName, setMemberName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setMemberName(data.memberName);
        setStep("verify");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Payer Portal</h1>
          <p className="text-slate-500 mt-1">Prior Authorization System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {step === "login" ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Sign In</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your Member or Provider ID and email to receive a verification code.</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Member / Provider ID</label>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    placeholder="e.g. MBR001 or PRV001"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {loading ? "Sending code..." : "Send Verification Code"}
                </button>
              </form>

              <div className="mt-6 p-3 bg-slate-50 rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Demo Member IDs:</p>
                  <p className="text-xs text-slate-400">MBR001 (John Smith) &middot; MBR002 (Jane Doe) &middot; MBR003 (Robert Johnson)</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">Demo Provider IDs:</p>
                  <p className="text-xs text-slate-400">PRV001 (Dr. Chen) &middot; PRV002 (Dr. Park) &middot; PRV003 (Dr. Rodriguez)</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Verify Your Identity</h2>
              <p className="text-sm text-slate-500 mb-6">
                Welcome back, <span className="font-medium text-slate-700">{memberName}</span>. We sent a 6-digit code to <span className="font-medium text-slate-700">{email}</span>.
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Verification Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center tracking-[0.3em] text-lg font-mono"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 text-white py-2.5 rounded-lg font-medium hover:bg-blue-800 transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("login"); setCode(""); setError(""); }}
                  className="w-full text-slate-500 text-sm hover:text-slate-700 transition"
                >
                  Back to login
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">Payer Portal Simulator &mdash; Demo Application</p>
      </div>
    </div>
  );
}
