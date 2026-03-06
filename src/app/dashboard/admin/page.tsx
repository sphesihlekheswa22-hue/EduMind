"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import { useState } from "react";

const allUsers = [
  { id: 1, name: "Alex Johnson", email: "alex@student.edu", role: "Student", status: "Active", joined: "Jan 15, 2025", lastLogin: "Today" },
  { id: 2, name: "Sarah Chen", email: "sarah@student.edu", role: "Student", status: "Active", joined: "Jan 15, 2025", lastLogin: "Today" },
  { id: 3, name: "Dr. Sarah Mitchell", email: "s.mitchell@school.edu", role: "Teacher", status: "Active", joined: "Sep 1, 2024", lastLogin: "Today" },
  { id: 4, name: "Marcus Williams", email: "marcus@student.edu", role: "Student", status: "Active", joined: "Jan 15, 2025", lastLogin: "3 days ago" },
  { id: 5, name: "Prof. James Carter", email: "j.carter@school.edu", role: "Teacher", status: "Active", joined: "Sep 1, 2024", lastLogin: "Yesterday" },
  { id: 6, name: "Linda Johnson", email: "linda@parent.com", role: "Parent", status: "Active", joined: "Feb 1, 2025", lastLogin: "1 week ago" },
  { id: 7, name: "Emma Davis", email: "emma@student.edu", role: "Student", status: "Active", joined: "Jan 15, 2025", lastLogin: "Yesterday" },
  { id: 8, name: "Robert Admin", email: "admin@edumind.ai", role: "Admin", status: "Active", joined: "Aug 1, 2024", lastLogin: "Today" },
  { id: 9, name: "Liam Brown", email: "liam@student.edu", role: "Student", status: "Suspended", joined: "Jan 15, 2025", lastLogin: "5 days ago" },
  { id: 10, name: "Maria Garcia", email: "maria@parent.com", role: "Parent", status: "Inactive", joined: "Mar 1, 2025", lastLogin: "Never" },
];

const auditLogs = [
  { action: "User Created", user: "alex@student.edu", by: "admin@edumind.ai", time: "Today, 09:14", type: "create" },
  { action: "Role Changed", user: "j.carter@school.edu", by: "admin@edumind.ai", time: "Today, 08:52", type: "update" },
  { action: "User Suspended", user: "liam@student.edu", by: "admin@edumind.ai", time: "Yesterday, 16:30", type: "delete" },
  { action: "Bulk Import", user: "15 users imported", by: "admin@edumind.ai", time: "Yesterday, 10:00", type: "create" },
  { action: "Password Reset", user: "marcus@student.edu", by: "System", time: "2 days ago", type: "update" },
  { action: "User Deleted", user: "old.user@school.edu", by: "admin@edumind.ai", time: "3 days ago", type: "delete" },
];

const systemStats = [
  { label: "Total Users", value: "1,247", icon: "👥", color: "text-indigo-400" },
  { label: "Students", value: "1,089", icon: "🎓", color: "text-cyan-400" },
  { label: "Teachers", value: "87", icon: "👩‍🏫", color: "text-emerald-400" },
  { label: "Parents", value: "71", icon: "👨‍👩‍👧", color: "text-amber-400" },
];

const roleColors: Record<string, string> = {
  Student: "badge-info",
  Teacher: "badge-success",
  Parent: "badge-warning",
  Admin: "badge-danger",
};

const statusColors: Record<string, string> = {
  Active: "badge-success",
  Inactive: "badge-warning",
  Suspended: "badge-danger",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "logs" | "settings">("users");
  const [filterRole, setFilterRole] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Student" });
  const [notification, setNotification] = useState("");

  const filteredUsers = allUsers.filter((u) => {
    const matchRole = filterRole === "All" || u.role === filterRole;
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    setNotification(`✅ User ${newUser.name} created successfully. Notification email sent.`);
    setNewUser({ name: "", email: "", role: "Student" });
    setTimeout(() => setNotification(""), 4000);
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar
        role="admin"
        userName="Robert Admin"
        userEmail="admin@edumind.ai"
      />

      <main className="flex-1 p-8 overflow-auto">
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-xl text-sm fade-in">
            {notification}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 mt-1">Manage users, roles, and system settings</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import CSV
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {systemStats.map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-slate-900 p-1 rounded-xl w-fit">
          {(["users", "logs", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-orange-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab === "users" ? "User Management" : tab === "logs" ? "Audit Logs" : "Settings"}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="fade-in">
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Search by name or email…"
                className="input-field max-w-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="input-field max-w-xs"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Student">Students</option>
                <option value="Teacher">Teachers</option>
                <option value="Parent">Parents</option>
                <option value="Admin">Admins</option>
              </select>
              <span className="text-sm text-slate-400 ml-auto">{filteredUsers.length} users</span>
            </div>

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/50">
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Joined</th>
                    <th className="text-left p-4 font-medium">Last Login</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-medium">{u.name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`badge text-xs ${roleColors[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="p-4">
                        <span className={`badge text-xs ${statusColors[u.status]}`}>{u.status}</span>
                      </td>
                      <td className="p-4 text-slate-400">{u.joined}</td>
                      <td className="p-4 text-slate-400">{u.lastLogin}</td>
                      <td className="p-4">
                        <div className="flex gap-3">
                          <button className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                          <button className="text-xs text-amber-400 hover:text-amber-300">
                            {u.status === "Suspended" ? "Restore" : "Suspend"}
                          </button>
                          <button className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === "logs" && (
          <div className="fade-in">
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Audit Log</h2>
                <button className="btn-secondary text-xs py-1 px-3">Export Logs</button>
              </div>
              <div className="divide-y divide-slate-800">
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-800/30 transition-colors">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      log.type === "create" ? "bg-emerald-400" :
                      log.type === "update" ? "bg-amber-400" : "bg-red-400"
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{log.action}</span>
                        <span className={`badge text-xs ${
                          log.type === "create" ? "badge-success" :
                          log.type === "update" ? "badge-warning" : "badge-danger"
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Target: <span className="text-slate-300">{log.user}</span> · By: <span className="text-slate-300">{log.by}</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{log.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="fade-in space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-5">System Settings</h2>
              <div className="space-y-4">
                {[
                  { label: "Allow Student Self-Registration", desc: "Students can create accounts without admin approval", enabled: true },
                  { label: "Require Email Verification", desc: "New users must verify their email before accessing the platform", enabled: true },
                  { label: "Parent Notifications", desc: "Automatically notify parents when student performance drops below 60%", enabled: true },
                  { label: "AI Feedback Generation", desc: "Enable AI-generated personalised feedback after each quiz", enabled: true },
                  { label: "Maintenance Mode", desc: "Temporarily disable access for all non-admin users", enabled: false },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
                    <div>
                      <div className="text-sm font-medium text-white">{setting.label}</div>
                      <div className="text-xs text-slate-400 mt-1">{setting.desc}</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${setting.enabled ? "bg-indigo-600" : "bg-slate-700"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${setting.enabled ? "left-6" : "left-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-bold text-white mb-5">RBAC Permissions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left pb-3 font-medium">Permission</th>
                      <th className="text-center pb-3 font-medium">Student</th>
                      <th className="text-center pb-3 font-medium">Teacher</th>
                      <th className="text-center pb-3 font-medium">Parent</th>
                      <th className="text-center pb-3 font-medium">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[
                      { perm: "Take Quizzes", student: true, teacher: false, parent: false, admin: true },
                      { perm: "View Own Progress", student: true, teacher: false, parent: true, admin: true },
                      { perm: "Upload Content", student: false, teacher: true, parent: false, admin: true },
                      { perm: "View Class Analytics", student: false, teacher: true, parent: false, admin: true },
                      { perm: "Manage Users", student: false, teacher: false, parent: false, admin: true },
                      { perm: "View Audit Logs", student: false, teacher: false, parent: false, admin: true },
                    ].map((row) => (
                      <tr key={row.perm} className="hover:bg-slate-800/30">
                        <td className="py-3 text-slate-300">{row.perm}</td>
                        {[row.student, row.teacher, row.parent, row.admin].map((allowed, i) => (
                          <td key={i} className="py-3 text-center">
                            {allowed ? (
                              <span className="text-emerald-400">✓</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card p-8 w-full max-w-md fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create New User</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="john@school.edu"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                  <select
                    className="input-field"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Parent">Parent</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs text-indigo-300">
                  A welcome email with login instructions will be sent automatically.
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1 py-2">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 py-2">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
