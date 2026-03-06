import Link from "next/link";
import Navbar from "@/components/Navbar";

const features = [
  {
    icon: "🧠",
    title: "AI-Adaptive Quizzes",
    description:
      "Our AI engine adjusts question difficulty in real-time based on your performance, response time, and learning patterns.",
    color: "from-indigo-500/20 to-indigo-500/5",
    border: "border-indigo-500/30",
  },
  {
    icon: "📊",
    title: "Personalised Feedback",
    description:
      "Receive detailed AI-generated feedback after every quiz — highlighting weak topics and recommending targeted resources.",
    color: "from-cyan-500/20 to-cyan-500/5",
    border: "border-cyan-500/30",
  },
  {
    icon: "📈",
    title: "Progress Analytics",
    description:
      "Track score trends, subject performance, weekly goals, learning streaks, and earned badges on your personal dashboard.",
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "border-emerald-500/30",
  },
  {
    icon: "📚",
    title: "Smart Content Upload",
    description:
      "Teachers upload PDFs, DOCX, PPT, or MP4 files. The AI automatically extracts key concepts and generates quiz questions.",
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
  },
  {
    icon: "👩‍🏫",
    title: "Teacher Analytics",
    description:
      "Monitor class performance, identify at-risk students, filter by subject or time period, and send targeted interventions.",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
  },
  {
    icon: "🔐",
    title: "Role-Based Access",
    description:
      "Secure RBAC system for Students, Teachers, Parents, and Admins — each with tailored dashboards and permissions.",
    color: "from-rose-500/20 to-rose-500/5",
    border: "border-rose-500/30",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up as a Student, Teacher, or Parent. Admins manage the platform.",
  },
  {
    step: "02",
    title: "Start an Adaptive Quiz",
    description: "Select a subject. The AI picks the right starting difficulty based on your skill level.",
  },
  {
    step: "03",
    title: "Get Instant AI Feedback",
    description: "After each quiz, receive personalised feedback, weak topic analysis, and resource recommendations.",
  },
  {
    step: "04",
    title: "Track Your Growth",
    description: "Watch your progress on the dashboard — streaks, badges, score trends, and weekly goals.",
  },
];

const stats = [
  { value: "50K+", label: "Active Students" },
  { value: "2M+", label: "Quizzes Completed" },
  { value: "94%", label: "Improvement Rate" },
  { value: "500+", label: "Schools Enrolled" },
];

const roles = [
  {
    role: "Student",
    emoji: "🎓",
    color: "from-indigo-500 to-cyan-500",
    features: ["Adaptive quizzes", "AI feedback", "Progress dashboard", "Learning streaks & badges"],
    href: "/register",
  },
  {
    role: "Teacher",
    emoji: "👩‍🏫",
    color: "from-emerald-500 to-teal-500",
    features: ["Upload course content", "AI question generation", "Class analytics", "At-risk student alerts"],
    href: "/register",
  },
  {
    role: "Parent",
    emoji: "👨‍👩‍👧",
    color: "from-amber-500 to-orange-500",
    features: ["Monitor child progress", "Performance notifications", "Weekly reports", "Teacher communication"],
    href: "/register",
  },
  {
    role: "Admin",
    emoji: "🛡️",
    color: "from-rose-500 to-red-500",
    features: ["User management", "Role assignment", "Audit logs", "Bulk CSV import"],
    href: "/register",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-2 text-sm text-indigo-400 mb-6">
            <span className="w-2 h-2 bg-indigo-400 rounded-full pulse-glow inline-block" />
            AI-Powered Adaptive Learning Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Learn Smarter with{" "}
            <span className="gradient-text">EduMind AI</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Personalised quizzes that adapt to your level, AI-generated feedback on every answer, and
            real-time progress tracking — all in one intelligent learning platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base px-8 py-3 inline-block">
              Start Learning Free →
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3 inline-block">
              Log In to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="card p-4 text-center">
                <div className="text-3xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Excel</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              EduMind AI combines cutting-edge AI with proven learning science to deliver results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`card card-hover p-6 bg-gradient-to-br ${feature.color} ${feature.border}`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 text-lg">Get started in minutes. No setup required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-indigo-500/50 to-transparent z-10" />
                )}
                <div className="card p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-white font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">
              Built for <span className="gradient-text">Everyone</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Tailored experiences for every role in the learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r) => (
              <div key={r.role} className="card card-hover p-6 flex flex-col">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-2xl mb-4`}>
                  {r.emoji}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{r.role}</h3>
                <ul className="flex-1 space-y-2 mb-6">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={r.href} className="btn-primary text-sm text-center py-2">
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card p-12 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border-indigo-500/30">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-slate-400 text-lg mb-8">
              Join 50,000+ students already learning smarter with EduMind AI. Free to start — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn-primary text-base px-8 py-3 inline-block">
                Create Free Account →
              </Link>
              <Link href="/login" className="btn-secondary text-base px-8 py-3 inline-block">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
              E
            </div>
            <span className="font-bold text-white">EduMind AI</span>
          </div>
          <p className="text-slate-500 text-sm">© 2025 EduMind AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
