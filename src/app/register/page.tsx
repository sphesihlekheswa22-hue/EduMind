"use client";

import Link from "next/link";
import { useState } from "react";

const roles = [
  { value: "student", label: "Student", emoji: "🎓", desc: "I want to learn and take quizzes" },
  { value: "teacher", label: "Teacher", emoji: "👩‍🏫", desc: "I want to teach and track students" },
  { value: "parent", label: "Parent", emoji: "👨‍👩‍👧", desc: "I want to monitor my child's progress" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (r: string) => {
    setRole(r);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    // Redirect based on role
    const redirectMap: Record<string, string> = {
      student: "/dashboard/student",
      teacher: "/dashboard/teacher",
      parent: "/dashboard/student",
    };
    window.location.href = redirectMap[role] || "/dashboard/student";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="font-bold text-2xl text-white">
              EduMind <span className="gradient-text">AI</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-2">Join 50,000+ learners on EduMind AI</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-1 rounded-full ${step >= 1 ? "bg-indigo-500" : "bg-slate-700"}`} />
          <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-indigo-500" : "bg-slate-700"}`} />
        </div>

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="card p-8 fade-in">
            <h2 className="text-xl font-bold text-white mb-2">I am a…</h2>
            <p className="text-slate-400 text-sm mb-6">Choose your role to get a personalised experience.</p>

            <div className="space-y-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleRoleSelect(r.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-left group"
                >
                  <span className="text-3xl">{r.emoji}</span>
                  <div>
                    <div className="text-white font-semibold group-hover:text-indigo-400 transition-colors">{r.label}</div>
                    <div className="text-slate-400 text-sm">{r.desc}</div>
                  </div>
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Log in</Link>
            </p>
          </div>
        )}

        {/* Step 2: Account Details */}
        {step === 2 && (
          <div className="card p-8 fade-in">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">{roles.find((r) => r.value === role)?.emoji}</span>
              <div>
                <h2 className="text-xl font-bold text-white">Create your account</h2>
                <p className="text-slate-400 text-sm">Signing up as a <span className="text-indigo-400 font-medium capitalize">{role}</span></p>
              </div>
            </div>

            {/* OAuth */}
            <button className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg py-3 text-white text-sm font-medium transition-colors mb-6">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-slate-500 text-xs">or with email</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>

              <p className="text-xs text-slate-500">
                By creating an account, you agree to our{" "}
                <Link href="#" className="text-indigo-400 hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="#" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <p className="text-center text-slate-400 text-sm mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Log in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
