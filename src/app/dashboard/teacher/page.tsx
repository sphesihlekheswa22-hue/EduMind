"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import { useState } from "react";

const classStats = [
  { label: "Total Students", value: "34", icon: "👥", change: "+2 this week", positive: true },
  { label: "Avg. Class Score", value: "71%", icon: "📊", change: "+3% vs last week", positive: true },
  { label: "Quizzes Completed", value: "248", icon: "📝", change: "This month", positive: true },
  { label: "At-Risk Students", value: "5", icon: "⚠️", change: "Need attention", positive: false },
];

const students = [
  { name: "Alex Johnson", email: "alex@student.edu", score: 82, quizzes: 12, status: "On Track", lastActive: "Today" },
  { name: "Sarah Chen", email: "sarah@student.edu", score: 91, quizzes: 15, status: "Excellent", lastActive: "Today" },
  { name: "Marcus Williams", email: "marcus@student.edu", score: 54, quizzes: 7, status: "At Risk", lastActive: "3 days ago" },
  { name: "Emma Davis", email: "emma@student.edu", score: 78, quizzes: 11, status: "On Track", lastActive: "Yesterday" },
  { name: "Liam Brown", email: "liam@student.edu", score: 43, quizzes: 5, status: "At Risk", lastActive: "5 days ago" },
  { name: "Olivia Martinez", email: "olivia@student.edu", score: 88, quizzes: 14, status: "Excellent", lastActive: "Today" },
  { name: "Noah Wilson", email: "noah@student.edu", score: 67, quizzes: 9, status: "On Track", lastActive: "Yesterday" },
  { name: "Ava Taylor", email: "ava@student.edu", score: 49, quizzes: 6, status: "At Risk", lastActive: "4 days ago" },
];

const subjectStats = [
  { subject: "Mathematics", avgScore: 68, completion: 82, students: 34 },
  { subject: "Science", avgScore: 74, completion: 91, students: 34 },
  { subject: "English", avgScore: 81, completion: 95, students: 34 },
  { subject: "History", avgScore: 62, completion: 76, students: 34 },
];

const uploadedMaterials = [
  { name: "Chapter 5 - Quadratic Equations.pdf", type: "PDF", questions: 24, status: "Approved", date: "2 days ago" },
  { name: "Photosynthesis Lecture.mp4", type: "MP4", questions: 18, status: "Processing", date: "Today" },
  { name: "World War II Notes.docx", type: "DOCX", questions: 31, status: "Approved", date: "1 week ago" },
  { name: "Geography Slides.pptx", type: "PPT", questions: 15, status: "Review", date: "3 days ago" },
];

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "upload" | "analytics">("overview");
  const [dragOver, setDragOver] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredStudents = filterStatus === "All"
    ? students
    : students.filter((s) => s.status === filterStatus);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar
        role="teacher"
        userName="Dr. Sarah Mitchell"
        userEmail="s.mitchell@school.edu"
      />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
            <p className="text-slate-400 mt-1">Class 10B · Mathematics & Science</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Report
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Content
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-slate-900 p-1 rounded-xl w-fit">
          {(["overview", "students", "upload", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="fade-in">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {classStats.map((stat) => (
                <div key={stat.label} className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className={`text-xs font-medium ${stat.positive ? "text-emerald-400" : "text-amber-400"}`}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Subject Performance */}
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-5">Subject Performance Overview</h2>
              <div className="space-y-4">
                {subjectStats.map((s) => (
                  <div key={s.subject} className="grid grid-cols-4 gap-4 items-center">
                    <div className="text-sm font-medium text-slate-300">{s.subject}</div>
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Avg Score</span>
                        <span className="font-bold text-white">{s.avgScore}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${s.avgScore}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>Completion</span>
                        <span className="font-bold text-white">{s.completion}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.completion}%` }} />
                      </div>
                    </div>
                    <div className="text-sm text-slate-400 text-right">{s.students} students</div>
                  </div>
                ))}
              </div>
            </div>

            {/* At-Risk Students Alert */}
            <div className="card p-6 bg-amber-500/5 border-amber-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚠️</span>
                <h2 className="text-lg font-bold text-white">At-Risk Students</h2>
                <span className="badge badge-warning text-xs ml-auto">5 students need attention</span>
              </div>
              <div className="space-y-3">
                {students.filter((s) => s.status === "At Risk").map((s) => (
                  <div key={s.name} className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{s.name}</div>
                      <div className="text-xs text-slate-400">Last active: {s.lastActive} · Score: {s.score}%</div>
                    </div>
                    <button className="btn-secondary text-xs py-1 px-3">Send Message</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="fade-in">
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Search students…"
                className="input-field max-w-xs"
              />
              <select
                className="input-field max-w-xs"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Students</option>
                <option value="Excellent">Excellent</option>
                <option value="On Track">On Track</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50">
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left p-4 font-medium">Student</th>
                    <th className="text-left p-4 font-medium">Score</th>
                    <th className="text-left p-4 font-medium">Quizzes</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Last Active</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.map((s) => (
                    <tr key={s.name} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-medium">{s.name}</div>
                            <div className="text-xs text-slate-400">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${s.score >= 80 ? "text-emerald-400" : s.score >= 60 ? "text-amber-400" : "text-red-400"}`}>
                          {s.score}%
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{s.quizzes}</td>
                      <td className="p-4">
                        <span className={`badge text-xs ${
                          s.status === "Excellent" ? "badge-success" :
                          s.status === "On Track" ? "badge-info" : "badge-warning"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{s.lastActive}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="text-xs text-indigo-400 hover:text-indigo-300">View</button>
                          <button className="text-xs text-slate-400 hover:text-white">Message</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="fade-in">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center mb-8 transition-all ${
                dragOver
                  ? "border-indigo-500 bg-indigo-500/10"
                  : "border-slate-700 hover:border-slate-600"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
            >
              <div className="text-5xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Course Content</h3>
              <p className="text-slate-400 mb-6">
                Drag & drop your files here, or click to browse.<br />
                Supported: PDF, DOCX, PPT, MP4 · Max 100MB
              </p>
              <button className="btn-primary px-8 py-3">
                Browse Files
              </button>
              <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
                <span className="flex items-center gap-1">📄 PDF</span>
                <span className="flex items-center gap-1">📝 DOCX</span>
                <span className="flex items-center gap-1">📊 PPT</span>
                <span className="flex items-center gap-1">🎥 MP4</span>
              </div>
            </div>

            {/* AI Processing Info */}
            <div className="card p-4 mb-6 bg-indigo-500/5 border-indigo-500/30 flex items-start gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <div className="text-sm font-semibold text-white mb-1">How AI processes your content</div>
                <p className="text-xs text-slate-400">
                  After upload, the AI extracts key concepts, generates quiz questions, and categorises them by difficulty.
                  You can review and approve questions before they go live for students.
                </p>
              </div>
            </div>

            {/* Uploaded Materials */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-5">Uploaded Materials</h2>
              <div className="space-y-3">
                {uploadedMaterials.map((m) => (
                  <div key={m.name} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-lg flex-shrink-0">
                      {m.type === "PDF" ? "📄" : m.type === "MP4" ? "🎥" : m.type === "DOCX" ? "📝" : "📊"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{m.name}</div>
                      <div className="text-xs text-slate-400">{m.questions} questions generated · {m.date}</div>
                    </div>
                    <span className={`badge text-xs ${
                      m.status === "Approved" ? "badge-success" :
                      m.status === "Processing" ? "badge-info" : "badge-warning"
                    }`}>
                      {m.status}
                    </span>
                    {m.status === "Review" && (
                      <button className="btn-primary text-xs py-1 px-3">Review</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Score Distribution */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-white mb-5">Score Distribution</h2>
                <div className="space-y-3">
                  {[
                    { range: "90–100%", count: 4, color: "bg-emerald-500" },
                    { range: "80–89%", count: 8, color: "bg-cyan-500" },
                    { range: "70–79%", count: 10, color: "bg-indigo-500" },
                    { range: "60–69%", count: 7, color: "bg-amber-500" },
                    { range: "Below 60%", count: 5, color: "bg-red-500" },
                  ].map((d) => (
                    <div key={d.range} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-slate-400">{d.range}</div>
                      <div className="flex-1 progress-bar">
                        <div className={`h-full rounded-full ${d.color}`} style={{ width: `${(d.count / 34) * 100}%` }} />
                      </div>
                      <div className="w-8 text-xs text-slate-400 text-right">{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-white mb-5">Weekly Engagement</h2>
                <div className="space-y-4">
                  {[
                    { day: "Monday", quizzes: 42, color: "bg-indigo-500" },
                    { day: "Tuesday", quizzes: 38, color: "bg-indigo-500" },
                    { day: "Wednesday", quizzes: 55, color: "bg-indigo-500" },
                    { day: "Thursday", quizzes: 47, color: "bg-indigo-500" },
                    { day: "Friday", quizzes: 31, color: "bg-indigo-500" },
                    { day: "Saturday", quizzes: 18, color: "bg-slate-600" },
                    { day: "Sunday", quizzes: 12, color: "bg-slate-600" },
                  ].map((d) => (
                    <div key={d.day} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-slate-400">{d.day}</div>
                      <div className="flex-1 progress-bar">
                        <div className={`h-full rounded-full ${d.color}`} style={{ width: `${(d.quizzes / 60) * 100}%` }} />
                      </div>
                      <div className="w-8 text-xs text-slate-400 text-right">{d.quizzes}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="card p-6 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border-indigo-500/30">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🤖</span>
                <h2 className="text-lg font-bold text-white">AI Class Insights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: "📉", title: "Weak Area Detected", desc: "History scores dropped 8% this week. Consider reviewing Cold War content.", type: "warning" },
                  { icon: "📈", title: "Improvement Trend", desc: "Mathematics scores improved 12% after the new practice materials were uploaded.", type: "success" },
                  { icon: "⏰", title: "Engagement Drop", desc: "5 students haven't logged in for 3+ days. Consider sending a reminder.", type: "info" },
                ].map((insight) => (
                  <div key={insight.title} className={`p-4 rounded-xl border ${
                    insight.type === "warning" ? "border-amber-500/30 bg-amber-500/5" :
                    insight.type === "success" ? "border-emerald-500/30 bg-emerald-500/5" :
                    "border-indigo-500/30 bg-indigo-500/5"
                  }`}>
                    <div className="text-2xl mb-2">{insight.icon}</div>
                    <div className="text-sm font-semibold text-white mb-1">{insight.title}</div>
                    <div className="text-xs text-slate-400">{insight.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
