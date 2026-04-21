// ============================================================
// Tasks.jsx — Employee: view and update own tasks
// API: GET /tasks/my  |  PUT /tasks/:id
// ============================================================

import { useEffect, useState } from "react";
import { getMyTasks, updateTaskStatus } from "../api/taskApi";

// Status badge styles
const statusStyle = {
  pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  done:    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
};

export default function Tasks() {
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("");       // "" | "pending" | "done"
  const [updating, setUpdating] = useState(null);     // taskId being updated

  // Fetch tasks whenever filter changes
  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    console.log("[TASK] Fetching tasks...");
    try {
      const data = await getMyTasks(filter);
      setTasks(data);
      console.log("[TASK] Tasks loaded:", data.length);
    } catch (err) {
      console.error("[TASK ERROR] Fetch failed:", err.message);
      setError("Something went wrong while loading tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Mark task as done — one-way only (pending → done)
  const handleMarkDone = async (task) => {
    if (task.status === "done") return;
    setUpdating(task._id);
    console.log("[TASK] Marking as done:", task._id);
    try {
      const { task: updated } = await updateTaskStatus(task._id, "done");
      setTasks((prev) => prev.map((t) => t._id === task._id ? { ...t, status: updated.status } : t));
      console.log("[TASK] Status updated to done:", task._id);
    } catch (err) {
      console.error("[TASK ERROR] Status update failed:", err.message);
      setError(err.response?.data?.msg || "Failed to update task status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  // Skeleton loader
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} {filter ? `· ${filter}` : ""}
          </p>
        </div>

        {/* Status filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>
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
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No tasks assigned yet.</p>
          <p className="text-slate-400 text-sm mt-1">Enjoy your free time!</p>
        </div>
      )}

      {/* Task cards */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task._id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-start gap-4"
          >
            {/* Left — content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                {/* Status badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 mt-0.5 ${statusStyle[task.status]}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{task.title}</h3>
              </div>

              {task.description && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 ml-0">{task.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {task.deadline && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Due {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
                {task.assignedBy && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    By {task.assignedBy?.name || "Manager"}
                  </span>
                )}
                <span className="text-slate-300 dark:text-slate-600">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Right — action button */}
            {task.status === "done" ? (
              <div className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 cursor-default">
                ✓ Completed
              </div>
            ) : (
              <button
                onClick={() => handleMarkDone(task)}
                disabled={updating === task._id}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating === task._id ? "Updating..." : "Mark as Done"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
