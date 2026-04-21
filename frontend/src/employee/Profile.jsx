// ============================================================
// Profile.jsx — Employee profile page
// Fetches real data from GET /employees/me
// Shows "Not available" for any missing fields — no dummy data
// ============================================================

import { useEffect, useState } from "react";
import { getMyProfile } from "../api/employeeApi";

export default function Profile() {
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    console.log("[PROFILE] Fetching employee profile...");
    getMyProfile()
      .then((data) => { setProfile(data); console.log("[PROFILE] Loaded:", data._id); })
      .catch((err) => {
        const msg = err.response?.data?.msg || "Failed to load profile";
        console.error("[PROFILE ERROR]", msg);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  const initials = user.name
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

  // Skeleton
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-7 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your personal and employment information</p>
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

      {/* ── Hero card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-5">
        {/* Cover — thin strip */}
        <div className="h-16 bg-gradient-to-r from-indigo-500 to-violet-600" />

        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          {/* Avatar + name row — avatar overlaps cover, name sits beside it */}
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="flex items-end gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl flex-shrink-0">
                {initials}
              </div>
              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{user.name || "—"}</h2>
                <p className="text-slate-400 text-sm mt-0.5">{profile?.designation || user.role}</p>
              </div>
            </div>
            {/* Status badge */}
            <span className={`mb-1 px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
              profile?.status === "active"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600"
            }`}>
              {(profile?.status || "employee").toUpperCase()}
            </span>
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2">
            {profile?.department && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {profile.department}
              </span>
            )}
            {user.email && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user.email}
              </span>
            )}
            {profile?.phone && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {profile.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Info grid ── */}
      {!profile ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No employee record linked to your account</p>
          <p className="text-slate-400 text-xs mt-1">Contact admin to set up your employee profile</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Salary highlight card */}
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white">
            <p className="text-indigo-200 text-xs font-medium uppercase tracking-wide mb-1">Monthly Salary</p>
            <p className="text-3xl font-bold">
              {profile.salary ? `$${Number(profile.salary).toLocaleString()}` : "—"}
            </p>
            <p className="text-indigo-200 text-xs mt-1">Base salary per month</p>
          </div>

          {/* Joining date card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-1">Joined</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile.joiningDate
                ? new Date(profile.joiningDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                : "—"}
            </p>
            {profile.joiningDate && (
              <p className="text-slate-400 text-xs mt-1">
                {new Date(profile.joiningDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>

          {/* Employment details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Employment</h3>
            <div className="space-y-3">
              {[
                { label: "Department",  value: profile.department },
                { label: "Designation", value: profile.designation },
                { label: "Status",      value: profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : null },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                  <span className={`text-sm font-medium text-right ${value ? "text-slate-900 dark:text-white" : "text-slate-400 italic"}`}>
                    {value || "Not available"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Account details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Account</h3>
            <div className="space-y-3">
              {[
                { label: "Full Name", value: user.name },
                { label: "Email",     value: user.email },
                { label: "Role",      value: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : null },
                { label: "Phone",     value: profile.phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                  <span className={`text-sm font-medium text-right truncate max-w-[55%] ${value ? "text-slate-900 dark:text-white" : "text-slate-400 italic"}`}>
                    {value || "Not available"}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
