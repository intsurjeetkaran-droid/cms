// ============================================================
// Attendance.jsx — Manager: view team attendance
// API: GET /attendance/team?date=&employeeId=
// ============================================================

import { useEffect, useState } from "react";
import { getTeamAttendance } from "../api/attendanceApi";
import { getEmployees } from "../api/employeeApi";

const statusStyle = {
  present: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  absent:  "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
  leave:   "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30",
  late:    "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
};

const fmtTime = (iso) => iso
  ? new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  : "—";

const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", {
  month: "short", day: "numeric", year: "numeric",
});

const workedHours = (ci, co) => {
  if (!ci || !co) return null;
  return ((new Date(co) - new Date(ci)) / (1000 * 60 * 60)).toFixed(1) + "h";
};

export default function ManagerAttendance() {
  const [records, setRecords]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [dateFilter, setDateFilter]   = useState("");
  const [empFilter, setEmpFilter]     = useState("");

  // Load employees for filter dropdown
  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => console.error("[ATTENDANCE ERROR] Load employees:", err.message));
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [dateFilter, empFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    setError("");
    console.log("[ATTENDANCE] Fetching team data...");
    const filters = {};
    if (dateFilter) filters.date       = dateFilter;
    if (empFilter)  filters.employeeId = empFilter;
    try {
      const data = await getTeamAttendance(filters);
      setRecords(data);
      console.log("[ATTENDANCE] Team records loaded:", data.length);
    } catch (err) {
      console.error("[ATTENDANCE ERROR] Fetch team:", err.message);
      setError("Failed to load team attendance.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => { setDateFilter(""); setEmpFilter(""); };
  const hasFilters = dateFilter || empFilter;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Attendance</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{records.length} records</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-5">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <select value={empFilter} onChange={(e) => setEmpFilter(e.target.value)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Employees</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        {hasFilters && (
          <button onClick={clearFilters}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium transition">
            Clear
          </button>
        )}
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

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No attendance data found.</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {/* Desktop table */}
      {!loading && records.length > 0 && (
        <>
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-slate-500 dark:text-slate-400">
                  {["Employee", "Date", "Check-in", "Check-out", "Worked", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-white">{r.employee?.name || "—"}</p>
                      <p className="text-xs text-slate-400">{r.employee?.department}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{fmtDate(r.date)}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{fmtTime(r.checkIn)}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{fmtTime(r.checkOut)}</td>
                    <td className="px-5 py-3.5 text-indigo-600 dark:text-indigo-400 font-medium">
                      {workedHours(r.checkIn, r.checkOut) || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle[r.status]}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {records.map((r) => (
              <div key={r._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{r.employee?.name || "—"}</p>
                    <p className="text-xs text-slate-400">{r.employee?.department} · {fmtDate(r.date)}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusStyle[r.status]}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  In: {fmtTime(r.checkIn)} · Out: {fmtTime(r.checkOut)}
                  {workedHours(r.checkIn, r.checkOut) && ` · ${workedHours(r.checkIn, r.checkOut)}`}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
