// ============================================================
// AdminTasks.jsx — Admin: view all tasks with filters + pagination
// API: GET /tasks?status=&assignedTo=&assignedBy=&page=&limit=
// ============================================================

import { useEffect, useState } from "react";
import { getAllTasks } from "../api/taskApi";
import { getEmployees } from "../api/employeeApi";

const statusStyle = {
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  done:    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
};

export default function AdminTasks() {
  const [tasks, setTasks]         = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Filters
  const [filterStatus,     setFilterStatus]     = useState("");
  const [filterAssignedTo, setFilterAssignedTo] = useState("");
  const [filterAssignedBy, setFilterAssignedBy] = useState("");

  // Pagination
  const [page, setPage]   = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 15;

  // Load employees once for filter dropdowns
  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => console.error("[TASK ERROR] Load employees:", err.message));
  }, []);

  // Fetch tasks whenever filters or page change
  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterAssignedTo, filterAssignedBy, page]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    console.log("[TASK] Admin fetching all tasks...");

    const filters = { page, limit: LIMIT };
    if (filterStatus)     filters.status     = filterStatus;
    if (filterAssignedTo) filters.assignedTo = filterAssignedTo;
    if (filterAssignedBy) filters.assignedBy = filterAssignedBy;

    try {
      const data = await getAllTasks(filters);
      setTasks(data.tasks);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      console.log("[TASK] Admin tasks loaded:", data.tasks.length, "of", data.total);
    } catch (err) {
      console.error("[TASK ERROR] Fetch all tasks failed:", err.message);
      setError("Something went wrong while loading tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Reset page when filters change
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterAssignedTo("");
    setFilterAssignedBy("");
    setPage(1);
    console.log("[TASK] Admin filters cleared");
  };

  const hasFilters = filterStatus || filterAssignedTo || filterAssignedBy;

  // Derive unique managers from loaded tasks for filter dropdown
  const managers = tasks.reduce((acc, t) => {
    if (t.assignedBy && !acc.find((m) => m._id === t.assignedBy._id)) {
      acc.push(t.assignedBy);
    }
    return acc;
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">All Tasks</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {total} task{total !== 1 ? "s" : ""} in the system
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-5">
        {/* Status */}
        <select value={filterStatus} onChange={handleFilterChange(setFilterStatus)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>

        {/* Employee filter */}
        <select value={filterAssignedTo} onChange={handleFilterChange(setFilterAssignedTo)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Employees</option>
          {employees.map((e) => (
            <option key={e._id} value={e._id}>{e.name}</option>
          ))}
        </select>

        {/* Manager filter — built from loaded tasks */}
        <select value={filterAssignedBy} onChange={handleFilterChange(setFilterAssignedBy)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Managers</option>
          {managers.map((m) => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button onClick={clearFilters}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition">
            Clear filters
          </button>
        )}
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

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No tasks found.</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {/* Desktop table */}
      {!loading && tasks.length > 0 && (
        <>
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-slate-500 dark:text-slate-400">
                  {["Title", "Employee", "Manager", "Status", "Deadline", "Created"].map((h) => (
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
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                      {t.assignedBy?.name || "—"}
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
                  <span>👔 {t.assignedBy?.name || "—"}</span>
                  {t.deadline && <span>📅 {new Date(t.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
