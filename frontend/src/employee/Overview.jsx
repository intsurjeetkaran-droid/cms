// ============================================================
// Overview.jsx — Employee home page
// All data fetched from real APIs — no dummy values
// ============================================================

import { useEffect, useState } from "react";
import { getMyProfile } from "../api/employeeApi";
import { getMyTasks } from "../api/taskApi";
import { getMyAttendance } from "../api/attendanceApi";

const statusStyle = {
  pending: "text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30",
  done:    "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30",
};

const attendanceStyle = {
  present: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  absent:  "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
  leave:   "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30",
  late:    "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
};

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-slate-400 dark:text-slate-500 text-sm">{message}</p>
    </div>
  );
}

export default function Overview() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile]       = useState(null);
  const [tasks, setTasks]           = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    console.log("[OVERVIEW] Fetching all data...");
    // Use allSettled so partial failures don't block the whole page
    Promise.allSettled([
      getMyProfile(),
      getMyTasks(),
      getMyAttendance(),
    ])
      .then(([profResult, tsksResult, attResult]) => {
        if (profResult.status === "fulfilled") setProfile(profResult.value);
        else console.warn("[OVERVIEW] Profile not available:", profResult.reason?.response?.data?.msg);

        if (tsksResult.status === "fulfilled") setTasks(tsksResult.value);
        else console.warn("[OVERVIEW] Tasks not available:", tsksResult.reason?.message);

        if (attResult.status === "fulfilled") setAttendance(attResult.value);
        else console.warn("[OVERVIEW] Attendance not available:", attResult.reason?.message);

        // Only show error if ALL three failed
        if (profResult.status === "rejected" && tsksResult.status === "rejected" && attResult.status === "rejected") {
          setError("Failed to load data. Please refresh the page.");
        }

        console.log("[OVERVIEW] Data loaded");
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingTasks = tasks.filter((t) => t.status === "pending").length;
  const doneTasks    = tasks.filter((t) => t.status === "done").length;

  // Last 5 attendance records
  const recentAttendance = attendance.slice(0, 5);

  const stats = [
    {
      label: "Department",
      value: profile?.department,
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20",
    },
    {
      label: "Designation",
      value: profile?.designation,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    },
    {
      label: "Tasks Assigned",
      value: tasks.length > 0 ? tasks.length : null,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    },
    {
      label: "Tasks Done",
      value: doneTasks > 0 ? doneTasks : (tasks.length > 0 ? "0" : null),
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    },
  ];

  // Skeleton
  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Welcome back, {user.name}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 md:p-5 ${s.bg}`}>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{s.label}</p>
            {s.value ? (
              <p className={`text-base md:text-xl font-bold mt-1 ${s.color} break-words leading-tight`}>{s.value}</p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 italic">Not available</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            My Tasks
            {tasks.length > 0 && (
              <span className="text-slate-400 font-normal text-sm ml-2">
                {pendingTasks} pending · {doneTasks} done
              </span>
            )}
          </h2>
          {tasks.length === 0 ? (
            <EmptyState message="No tasks assigned yet. Your manager will assign tasks to you." />
          ) : (
            <div className="space-y-2.5">
              {tasks.slice(0, 5).map((t) => (
                <div key={t._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-3">
                  <div className="min-w-0">
                    <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{t.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      By {t.assignedBy?.name || "Manager"}
                      {t.deadline && ` · Due ${new Date(t.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${statusStyle[t.status]}`}>
                    {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Account info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Account</h2>
            <div className="space-y-3">
              {[
                { label: "Name",        value: user.name },
                { label: "Email",       value: user.email },
                { label: "Role",        value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) },
                { label: "Salary",      value: profile?.salary ? `$${Number(profile.salary).toLocaleString()}` : null },
                { label: "Joined",      value: profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[60%] text-right">
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Attendance */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Recent Attendance</h2>
            {recentAttendance.length === 0 ? (
              <EmptyState message="No attendance records yet." />
            ) : (
              <div className="space-y-2">
                {recentAttendance.map((a) => (
                  <div key={a._id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(a.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${attendanceStyle[a.status] || ""}`}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
