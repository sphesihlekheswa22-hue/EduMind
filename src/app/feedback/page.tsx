import DashboardSidebar from "@/components/DashboardSidebar";
import Link from "next/link";

const weakTopics = [
  { topic: "Quadratic Equations", subject: "Mathematics", score: 45, priority: "High" },
  { topic: "Cold War Era", subject: "History", score: 52, priority: "High" },
  { topic: "Photosynthesis", subject: "Science", score: 61, priority: "Medium" },
];

const strongTopics = [
  { topic: "Shakespeare Sonnets", subject: "English", score: 94 },
  { topic: "Algebra Basics", subject: "Mathematics", score: 89 },
  { topic: "World Geography", subject: "Geography", score: 85 },
];

const resources = [
  {
    title: "Quadratic Equations — Khan Academy",
    type: "Video",
    duration: "18 min",
    topic: "Quadratic Equations",
    emoji: "🎥",
    bookmarked: false,
  },
  {
    title: "Cold War: Causes & Effects",
    type: "Article",
    duration: "12 min read",
    topic: "Cold War Era",
    emoji: "📄",
    bookmarked: true,
  },
  {
    title: "Photosynthesis Interactive Lab",
    type: "Interactive",
    duration: "25 min",
    topic: "Photosynthesis",
    emoji: "🔬",
    bookmarked: false,
  },
  {
    title: "Quadratic Formula Practice Set",
    type: "Practice",
    duration: "30 questions",
    topic: "Quadratic Equations",
    emoji: "📝",
    bookmarked: false,
  },
];

const quizHistory = [
  { subject: "Mathematics", topic: "Quadratic Equations", score: 45, date: "Today", questions: 10 },
  { subject: "Science", topic: "Photosynthesis", score: 72, date: "Yesterday", questions: 10 },
  { subject: "English", topic: "Shakespeare Sonnets", score: 94, date: "2 days ago", questions: 10 },
  { subject: "History", topic: "World War II", score: 61, date: "3 days ago", questions: 10 },
  { subject: "Geography", topic: "Map Reading", score: 85, date: "4 days ago", questions: 10 },
];

export default function FeedbackPage() {
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
            <h1 className="text-2xl font-bold text-white">AI Personalised Feedback</h1>
            <p className="text-slate-400 mt-1">Based on your latest quiz — Mathematics · Quadratic Equations</p>
          </div>
          <Link href="/quiz" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake Quiz
          </Link>
        </div>

        {/* AI Summary Card */}
        <div className="card p-6 mb-6 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border-indigo-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-2xl flex-shrink-0">
              🤖
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-white">AI Learning Analysis</h2>
                <span className="badge badge-info text-xs">Personalised</span>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">
                Based on your quiz performance, you scored <strong className="text-white">45%</strong> on Quadratic Equations —
                below your average of 78%. The AI has detected that you struggle with the <strong className="text-white">discriminant formula</strong> and{" "}
                <strong className="text-white">factoring complex expressions</strong>. Your response time was also slower on harder questions,
                suggesting you may benefit from more practice with timed exercises.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-danger">Weak: Discriminant</span>
                <span className="badge badge-danger">Weak: Factoring</span>
                <span className="badge badge-success">Strong: Linear equations</span>
                <span className="badge badge-warning">Improve: Response time</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weak Topics */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">⚠️</span>
              <h2 className="text-lg font-bold text-white">Areas to Improve</h2>
            </div>
            <div className="space-y-4">
              {weakTopics.map((t) => (
                <div key={t.topic} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-white">{t.topic}</div>
                      <div className="text-xs text-slate-400">{t.subject}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge text-xs ${t.priority === "High" ? "badge-danger" : "badge-warning"}`}>
                        {t.priority} Priority
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="progress-bar flex-1">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${t.score}%` }} />
                    </div>
                    <span className="text-sm font-bold text-red-400">{t.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strong Topics */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">✅</span>
              <h2 className="text-lg font-bold text-white">Your Strengths</h2>
            </div>
            <div className="space-y-4">
              {strongTopics.map((t) => (
                <div key={t.topic} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-white">{t.topic}</div>
                      <div className="text-xs text-slate-400">{t.subject}</div>
                    </div>
                    <span className="badge badge-success text-xs">Strong</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="progress-bar flex-1">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${t.score}%` }} />
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{t.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommended Resources */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h2 className="text-lg font-bold text-white">Recommended Resources</h2>
            </div>
            <span className="text-xs text-slate-400">AI-curated for your weak areas</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((r) => (
              <div key={r.title} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700 hover:border-indigo-500/50 group">
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                    {r.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-info text-xs">{r.type}</span>
                    <span className="text-xs text-slate-400">{r.duration}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Topic: {r.topic}</div>
                </div>
                <button className={`flex-shrink-0 ${r.bookmarked ? "text-amber-400" : "text-slate-600 hover:text-amber-400"} transition-colors`}>
                  <svg className="w-5 h-5" fill={r.bookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz History */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h2 className="text-lg font-bold text-white">Quiz History</h2>
            </div>
            <Link href="/quiz" className="text-sm text-indigo-400 hover:text-indigo-300">
              Take new quiz →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left pb-3 font-medium">Subject</th>
                  <th className="text-left pb-3 font-medium">Topic</th>
                  <th className="text-left pb-3 font-medium">Score</th>
                  <th className="text-left pb-3 font-medium">Questions</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {quizHistory.map((q) => (
                  <tr key={q.topic} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 text-slate-300">{q.subject}</td>
                    <td className="py-3 text-white font-medium">{q.topic}</td>
                    <td className="py-3">
                      <span className={`font-bold ${q.score >= 80 ? "text-emerald-400" : q.score >= 60 ? "text-amber-400" : "text-red-400"}`}>
                        {q.score}%
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{q.questions}</td>
                    <td className="py-3 text-slate-400">{q.date}</td>
                    <td className="py-3">
                      <Link href="/quiz" className="text-indigo-400 hover:text-indigo-300 text-xs">
                        Retake →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
