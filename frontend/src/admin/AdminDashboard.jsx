// ============================================================
// AdminDashboard.jsx — Admin overview with energetic UI
// ============================================================

import { useEffect, useState } from "react";
import { getEmployees } from "../api/employeeApi";
import { getAllDepartments } from "../api/departmentApi";
import { getAllTasks } from "../api/taskApi";
import { useTheme } from "../context/ThemeContext";

function StatCard({ label, value, sub, icon, gradient, glow, delay }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`relative rounded-3xl p-5 overflow-hidden opacity-0 animate-slide-up border transition-all hover:-translate-y-1 hover:shadow-lg cursor-default ${isDark ? "bg-brand-card border-brand-border" : "bg-white border-slate-200"}`}
      style={{ animationDelay: delay, boxShadow: `0 0 0 0 transparent` }}>
      {/* Gradient blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ background: gradient }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-slate-500" : "text-slate-400"}`}>{label}</p>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-base"
            style={{ background: gradient }}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-black" style={{ background: gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {value}
        </p>
        <p className={`text-xs mt-1.5 font-medium ${isDark ? "text-slate-600" : "text-slate-400"}`}>{sub}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, children, className = "" }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className={`rounded-3xl border p-5 md:p-6 ${isDark ? "bg-brand-card border-brand-border" : "bg-white border-slate-200"} ${className}`}>
      <h2 className={`text-sm font-bold tracking-wider uppercase mb-5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>{title}</h2>
      {children}
    </div>
  );
}

function EmptyState({ message }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: "linear-gradient(135deg, #7C3AED22, #06B6D422)" }}>
        <svg className="w-6 h-6" style={{ color: "#7C3AED" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className={`text-sm ${isDark ? "text-slate-600" : "text-slate-400"}`}>{message}</p>
    </div>
  );
}

const STATUS_COLORS = {
  active:   { bg: "#06B6D415", color: "#06B6D4", border: "#06B6D430" },
  inactive: { bg: "#F59E0B15", color: "#F59E0B", border: "#F59E0B30" },
  pending:  { bg: "#F43F5E15", color: "#F43F5E", border: "#F43F5E30" },
};

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [employees, setEmployees]     = useState([]);
  const [departments, setDepartments] = useState([]);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    Promise.all([getEmployees(), getAllDepartments(), getAllTasks({ limit: 100 })])
      .then(([emps, depts, taskData]) => {
        setEmployees(emps);
        setDepartments(depts);
        setTasks(taskData.tasks || []);
      })
      .catch((err) => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  const stats = [
    {
      label: "Total Employees",
      value: loading ? "—" : employees.length,
      sub: employees.length > 0 ? `${employees.filter(e => e.status === "active").length} active` : "No employees yet",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      gradient: "linear-gradient(135deg, #7C3AED, #A855F7)",
      delay: "0ms",
    },
    {
      label: "Departments",
      value: loading ? "—" : departments.length,
      sub: departments.length > 0 ? `${departments.filter(d => d.manager).length} with manager` : "No departments yet",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
      gradient: "linear-gradient(135deg, #06B6D4, #0EA5E9)",
      delay: "80ms",
    },
    {
      label: "Total Tasks",
      value: loading ? "—" : tasks.length,
      sub: tasks.length > 0 ? `${pendingTasks} pending` : "No tasks yet",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
      gradient: "linear-gradient(135deg, #F59E0B, #F97316)",
      delay: "160ms",
    },
    {
      label: "Managers",
      value: loading ? "—" : employees.filter(e => e.user?.role === "manager").length,
      sub: departments.length > 0 ? `${departments.length} dept${departments.length !== 1 ? "s" : ""}` : "No departments yet",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
      gradient: "linear-gradient(135deg, #F43F5E, #EC4899)",
      delay: "240ms",
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>Dashboard</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-600" : "text-slate-400"}`}>Company overview</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-28 rounded-3xl animate-pulse ${isDark ? "bg-brand-card" : "bg-slate-200"}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className={`lg:col-span-2 h-72 rounded-3xl animate-pulse ${isDark ? "bg-brand-card" : "bg-slate-200"}`} />
          <div className={`h-72 rounded-3xl animate-pulse ${isDark ? "bg-brand-card" : "bg-slate-200"}`} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
            Dashboard
          </h1>
          <p className={`text-sm mt-0.5 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            Company overview · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #7C3AED15, #06B6D415)", border: "1px solid #7C3AED30", color: "#7C3AED" }}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-3 p-4 rounded-2xl text-sm font-medium"
          style={{ background: "#F43F5E11", border: "1px solid #F43F5E33", color: "#F43F5E" }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Employees */}
        <SectionCard title={`Recent Employees ${employees.length > 0 ? `· ${employees.length}` : ""}`} className="lg:col-span-2">
          {employees.length === 0 ? (
            <EmptyState message="No employees added yet. Go to Employees to add your first one." />
          ) : (
            <div className="space-y-2">
              {employees.slice(0, 6).map((e, i) => {
                const sc = STATUS_COLORS[e.status] || STATUS_COLORS.inactive;
                return (
                  <div key={e._id}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all hover:-translate-x-0.5 opacity-0 animate-slide-up ${isDark ? "hover:bg-brand-surface" : "hover:bg-slate-50"}`}
                    style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, #7C3AED, #06B6D4)` }}>
                      {e.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{e.name}</p>
                      <p className={`text-xs truncate ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                        {e.department || "—"} · {e.designation || "—"}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                      {e.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Departments */}
        <SectionCard title="Departments">
          {departments.length === 0 ? (
            <EmptyState message="No departments yet. Go to Departments to create one." />
          ) : (
            <div className="space-y-2">
              {departments.map((d, i) => (
                <div key={d._id}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all hover:-translate-x-0.5 opacity-0 animate-slide-up ${isDark ? "bg-brand-surface hover:bg-brand-dark" : "bg-slate-50 hover:bg-slate-100"}`}
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{d.name}</p>
                    <p className={`text-xs mt-0.5 truncate ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                      {d.manager ? d.manager.name : "No manager"}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full ml-3 flex-shrink-0"
                    style={{ background: d.manager ? "#06B6D4" : "#F59E0B" }} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
