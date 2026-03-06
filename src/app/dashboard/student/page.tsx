import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";


const subjectPerformance = [
  { subject: "Mathematics", score: 82, trend: "+5%", color: "from-indigo-500 to-indigo-600" },
  { subject: "Science", score: 74, trend: "+2%", color: "from-cyan-500 to-cyan-600" },
  { subject: "English", score: 91, trend: "+8%", color: "from-emerald-500 to-emerald-600" },
  { subject: "History", score: 63, trend: "-3%", color: "from-amber-500 to-amber-600" },
  { subject: "Geography", score: 78, trend: "+1%", color: "from-purple-500 to-purple-600" },
];

const recentQuizzes = [
  { subject: "Mathematics", topic: "Quadratic Equations", score: 85, date: "Today", difficulty: "Hard" },
  { subject: "Science", topic: "Photosynthesis", score: 72, date: "Yesterday", difficulty: "Medium" },
  { subject: "English", topic: "Shakespeare Sonnets", score: 94, date: "2 days ago", difficulty: "Medium" },
  { subject: "History", topic: "World War II", score: 61, date: "3 days ago", difficulty: "Hard" },
];

const badges = [
  { emoji: "🔥", label: "7-Day Streak", earned: true },
  { emoji: "⚡", label: "Speed Demon", earned: true },
  { emoji: "🎯", label: "Perfect Score", earned: true },
  { emoji: "📚", label: "Bookworm", earned: true },
  { emoji: "🏆", label: "Top 10%", earned: false },
  { emoji: "🌟", label: "All-Rounder", earned: false },
];

const weeklyGoals = [
  { label: "Quizzes completed", current: 8, target: 10 },
  { label: "Study hours", current: 5.5, target: 7 },
  { label: "Topics reviewed", current: 12, target: 15 },
];

const aiRecommendations = [
  { subject: "History", topic: "Cold War Era", reason: "Weak area detected", type: "warning" },
  { subject: "Mathematics", topic: "Calculus Basics", reason: "Next level unlocked", type: "success" },
  { subject: "Science", topic: "Cell Biology", reason: "Recommended review", type: "info" },
];

export default function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar
        role="student"
        userName="Alex Johnson"
        userEmail="alex@student.edu"
      />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Good morning, Alex! 👋</h1>
            <p className="text-slate-400 mt-1">You have a 7-day learning streak. Keep it up!</p>
          </div>
          <Link href="/quiz" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Quiz
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Overall Score", value: "78%", icon: "📊", change: "+4% this week", positive: true },
            { label: "Quizzes Taken", value: "47", icon: "📝", change: "+8 this week", positive: true },
            { label: "Learning Streak", value: "7 days", icon: "🔥", change: "Personal best!", positive: true },
            { label: "Rank in Class", value: "#5", icon: "🏆", change: "↑2 positions", positive: true },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-xs font-medium ${stat.positive ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Subject Performance */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-bold text-white mb-5">Subject Performance</h2>
            <div className="space-y-4">
              {subjectPerformance.map((s) => (
                <div key={s.subject}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">{s.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${s.trend.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                        {s.trend}
                      </span>
                      <span className="text-sm font-bold text-white">{s.score}%</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill bg-gradient-to-r ${s.color}`}
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-5">Weekly Goals</h2>
            <div className="space-y-5">
              {weeklyGoals.map((goal) => {
                const pct = Math.round((goal.current / goal.target) * 100);
                return (
                  <div key={goal.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-300">{goal.label}</span>
                      <span className="text-sm font-bold text-white">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{pct}% complete</div>
                  </div>
                );
              })}
            </div>

            {/* Streak */}
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
              <div className="text-3xl mb-1">🔥</div>
              <div className="text-2xl font-bold text-amber-400">7</div>
              <div className="text-xs text-slate-400">Day Streak</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Recent Quizzes */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Recent Quizzes</h2>
              <Link href="/quiz" className="text-sm text-indigo-400 hover:text-indigo-300">
                Take new quiz →
              </Link>
            </div>
            <div className="space-y-3">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.topic} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm flex-shrink-0">
                    {quiz.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{quiz.topic}</div>
                    <div className="text-xs text-slate-400">{quiz.subject} · {quiz.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${
                      quiz.difficulty === "Hard" ? "badge-danger" :
                      quiz.difficulty === "Medium" ? "badge-warning" : "badge-success"
                    }`}>
                      {quiz.difficulty}
                    </span>
                    <Link href="/feedback" className="text-xs text-indigo-400 hover:text-indigo-300">
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-white mb-5">Badges</h2>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.label}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                    badge.earned
                      ? "border-indigo-500/30 bg-indigo-500/10"
                      : "border-slate-700 bg-slate-800/30 opacity-40"
                  }`}
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className="text-xs text-slate-400 text-center leading-tight">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xl">🤖</span>
            <h2 className="text-lg font-bold text-white">AI Recommendations</h2>
            <span className="badge badge-info text-xs ml-auto">Personalised for you</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.topic}
                className={`p-4 rounded-xl border ${
                  rec.type === "warning"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : rec.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-indigo-500/30 bg-indigo-500/5"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge text-xs ${
                    rec.type === "warning" ? "badge-warning" :
                    rec.type === "success" ? "badge-success" : "badge-info"
                  }`}>
                    {rec.subject}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mb-1">{rec.topic}</div>
                <div className="text-xs text-slate-400 mb-3">{rec.reason}</div>
                <Link href="/quiz" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                  Practice now →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* AI Study Assistant */}
        <div className="card p-6 border-indigo-500/30" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AI Study Assistant</h2>
                <p className="text-slate-400 text-xs">Upload notes · Get summaries · Ask questions · Take quizzes</p>
              </div>
            </div>
            <Link href="/study-assistant" className="btn-primary flex items-center gap-2 text-sm">
              Open Assistant →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                href: "/study-assistant",
                icon: "📁",
                label: "Upload Notes",
                desc: "PDF, DOCX, TXT",
                color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30",
              },
              {
                href: "/study-assistant",
                icon: "📋",
                label: "View Summary",
                desc: "AI-generated overview",
                color: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
              },
              {
                href: "/study-assistant",
                icon: "💬",
                label: "Ask AI Questions",
                desc: "Chat with your notes",
                color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
              },
              {
                href: "/study-assistant",
                icon: "🧠",
                label: "Generate Quiz",
                desc: "Test your knowledge",
                color: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`p-4 rounded-xl border bg-gradient-to-br ${item.color} hover:scale-105 transition-transform text-center block`}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-white text-sm font-semibold">{item.label}</div>
                <div className="text-slate-400 text-xs mt-1">{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
