// ============================================================
// ManagerDashboard.jsx — Manager overview
// All data fetched from real APIs — no dummy values
// ============================================================

import { useEffect, useState } from "react";
import { getEmployees } from "../api/employeeApi";
import { getManagerTasks } from "../api/taskApi";

const statusStyle = {
  pending: "text-amber-500",
  done:    "text-emerald-500",
};

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-slate-400 dark:text-slate-500 text-sm">{message}</p>
    </div>
  );
}

export default function ManagerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    console.log("[MANAGER DASHBOARD] Fetching data...");
    Promise.all([getEmployees(), getManagerTasks()])
      .then(([emps, tsks]) => {
        // Only count actual employees (not managers) as team members
        const teamOnly = emps.filter((e) => e.user?.role === "employee");
        setEmployees(teamOnly);
        setTasks(tsks);
        console.log("[MANAGER DASHBOARD] Team members:", teamOnly.length, "| Tasks:", tsks.length);
      })
      .catch((err) => {
        console.error("[MANAGER DASHBOARD ERROR]", err.message);
        setError("Failed to load dashboard data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const doneTasks    = tasks.filter((t) => t.status === "done").length;

  const stats = [
    {
      label: "Team Size",
      value: loading ? "..." : employees.length,
      sub: employees.length > 0 ? `${employees.filter(e => e.status === "active").length} active` : "No team members yet",
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20",
    },
    {
      label: "Total Tasks",
      value: loading ? "..." : tasks.length,
      sub: tasks.length > 0 ? `${pendingTasks} pending` : "No tasks created yet",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    },
    {
      label: "Completed",
      value: loading ? "..." : doneTasks,
      sub: tasks.length > 0 ? `${tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0}% completion rate` : "No tasks yet",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    },
    {
      label: "Pending",
      value: loading ? "..." : pendingTasks,
      sub: tasks.length > 0 ? "Need attention" : "No tasks yet",
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
    },
  ];

  // Skeleton
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-64 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back, {user.name}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 md:p-5 ${s.bg}`}>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Team Members */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            My Team
            {employees.length > 0 && <span className="text-slate-400 font-normal text-sm ml-2">({employees.length})</span>}
          </h2>
          {employees.length === 0 ? (
            <EmptyState message="No team members yet. Go to My Team to add employees." />
          ) : (
            <div className="space-y-3">
              {employees.slice(0, 5).map((e) => (
                <div key={e._id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex-shrink-0">
                    {e.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{e.name}</p>
                    <p className="text-slate-400 text-xs">{e.designation || "—"} · {e.department || "—"}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    e.status === "active"
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                      : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                  }`}>{e.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Recent Tasks
            {tasks.length > 0 && <span className="text-slate-400 font-normal text-sm ml-2">({tasks.length})</span>}
          </h2>
          {tasks.length === 0 ? (
            <EmptyState message="No tasks created yet. Go to Tasks to assign work." />
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((t) => (
                <div key={t._id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-snug truncate">{t.title}</p>
                    <span className={`text-xs font-semibold flex-shrink-0 ${statusStyle[t.status] || "text-slate-400"}`}>
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs truncate">
                    → {t.assignedTo?.name || "Unassigned"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
