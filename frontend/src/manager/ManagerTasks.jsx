// ============================================================
// ManagerTasks.jsx — Manager: view tasks they created
// API: GET /tasks/manager?status=
// ============================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getManagerTasks } from "../api/taskApi";

const statusStyle = {
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  done:    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
};

export default function ManagerTasks() {
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState("");

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    console.log("[TASK] Manager fetching tasks...");
    try {
      const data = await getManagerTasks(filter);
      setTasks(data);
      console.log("[TASK] Manager tasks loaded:", data.length);
    } catch (err) {
      console.error("[TASK ERROR] Fetch failed:", err.message);
      setError("Something went wrong while loading tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Counts for summary
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount    = tasks.filter((t) => t.status === "done").length;

  if (loading) {
    return (
      <div>
        <div className="mb-6 h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {tasks.length} total · {pendingCount} pending · {doneCount} done
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
          </select>
          {/* Create button */}
          <Link
            to="/manager/tasks/create"
            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition flex-shrink-0"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xs:inline">New Task</span>
            <span className="xs:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!error && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No tasks created yet.</p>
          <p className="text-slate-400 text-sm mt-1 mb-5">Start by assigning a task to your team.</p>
          <Link to="/manager/tasks/create"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition">
            Create First Task
          </Link>
        </div>
      )}

      {/* Desktop table */}
      {tasks.length > 0 && (
        <>
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-slate-500 dark:text-slate-400">
                  {["Title", "Assigned To", "Status", "Deadline", "Created"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-white">{t.title}</p>
                      {t.description && <p className="text-slate-400 text-xs mt-0.5 truncate max-w-xs">{t.description}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {t.assignedTo?.name || "—"}
                      {t.assignedTo?.department && <span className="block text-xs text-slate-400">{t.assignedTo.department}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle[t.status]}`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                      {t.deadline ? new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {tasks.map((t) => (
              <div key={t._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusStyle[t.status]}`}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </div>
                {t.description && <p className="text-slate-400 text-xs mb-2">{t.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>👤 {t.assignedTo?.name || "—"}</span>
                  {t.deadline && <span>📅 {new Date(t.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
