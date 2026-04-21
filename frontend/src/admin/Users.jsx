// ============================================================
// Users.jsx — View all system users (admin only)
// ============================================================

import { useEffect, useState } from "react";
import { getEmployees } from "../api/employeeApi";

const roleBadge = {
  admin:    "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30",
  manager:  "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  employee: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
};

export default function Users() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterRole, setFilterRole] = useState(""); // admin | manager | employee

  useEffect(() => {
    console.log("[USERS PAGE] Loading users...");
    getEmployees()
      .then((data) => { setEmployees(data); console.log("[USERS PAGE] Loaded:", data.length); })
      .catch((err) => console.error("[USERS PAGE ERROR]", err.message))
      .finally(() => setLoading(false));
  }, []);

  // Apply search + role filter
  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q);
    const matchRole = !filterRole || (e.user?.role || "employee") === filterRole;
    return matchSearch && matchRole;
  });

  const hasFilters = search || filterRole;
  const clearFilters = () => { setSearch(""); setFilterRole(""); console.log("[USERS] Filters cleared"); };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">All system accounts</p>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input type="text" placeholder="Search name, email, dept..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); console.log("[USERS] Role filter:", e.target.value); }}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
          <span className="text-slate-400 text-sm whitespace-nowrap">{filtered.length} of {employees.length}</span>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium whitespace-nowrap">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No users found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-slate-500 dark:text-slate-400">
                    {["Name", "Email", "Role", "Department", "Joined"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((e) => (
                    <tr key={e._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex-shrink-0">
                            {e.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{e.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{e.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${roleBadge[e.user?.role] || roleBadge.employee}`}>
                          {(e.user?.role || "employee").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{e.department}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((e) => (
                <div key={e._id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold flex-shrink-0">
                    {e.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{e.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${roleBadge[e.user?.role] || roleBadge.employee}`}>
                        {(e.user?.role || "employee").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs truncate">{e.email}</p>
                    <p className="text-slate-400 text-xs">{e.department} · {new Date(e.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
