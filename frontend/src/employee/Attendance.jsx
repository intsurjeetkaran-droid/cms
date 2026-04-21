// ============================================================
// Attendance.jsx — Employee: check in/out + view history
// API: POST /attendance/check-in  |  POST /attendance/check-out
//      GET  /attendance/my
// ============================================================

import { useEffect, useState } from "react";
import { checkIn, checkOut, getMyAttendance } from "../api/attendanceApi";

// Status badge styles
const statusStyle = {
  present: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  absent:  "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
  leave:   "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30",
  late:    "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
};

// Format time from ISO string
const fmtTime = (iso) => iso
  ? new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  : "—";

// Format date
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", {
  weekday: "short", month: "short", day: "numeric", year: "numeric",
});

// Calculate worked hours
const workedHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
  return diff.toFixed(1) + "h";
};

export default function Attendance() {
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [actionLoading, setActionLoading] = useState(""); // "in" | "out"
  const [actionMsg, setActionMsg]   = useState("");
  const [actionErr, setActionErr]   = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Today's record (first in list if date matches today)
  const today = new Date().toDateString();
  const todayRecord = records.find(
    (r) => new Date(r.date).toDateString() === today
  );

  useEffect(() => {
    fetchRecords();
  }, [dateFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    setError("");
    console.log("[ATTENDANCE] Fetching data...");
    try {
      const data = await getMyAttendance(dateFilter);
      setRecords(data);
      console.log("[ATTENDANCE] Records loaded:", data.length);
    } catch (err) {
      console.error("[ATTENDANCE ERROR] Fetch failed:", err.message);
      setError("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading("in");
    setActionMsg("");
    setActionErr("");
    try {
      const data = await checkIn();
      setActionMsg(data.msg);
      console.log("[ATTENDANCE] Check-in success");
      fetchRecords();
    } catch (err) {
      const msg = err.response?.data?.msg || "Check-in failed";
      console.error("[ATTENDANCE ERROR] Check-in:", msg);
      setActionErr(msg);
    } finally {
      setActionLoading("");
    }
  };

  const handleCheckOut = async () => {
    setActionLoading("out");
    setActionMsg("");
    setActionErr("");
    try {
      const data = await checkOut();
      setActionMsg(data.msg + (data.workedHours ? ` · ${data.workedHours}h worked` : ""));
      console.log("[ATTENDANCE] Check-out success");
      fetchRecords();
    } catch (err) {
      const msg = err.response?.data?.msg || "Check-out failed";
      console.error("[ATTENDANCE ERROR] Check-out:", msg);
      setActionErr(msg);
    } finally {
      setActionLoading("");
    }
  };

  const alreadyCheckedIn  = !!todayRecord?.checkIn;
  const alreadyCheckedOut = !!todayRecord?.checkOut;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* ── Today's Action Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Today</h2>

        {/* Today's status */}
        {todayRecord && (
          <div className="flex flex-wrap gap-4 mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Check-in</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtTime(todayRecord.checkIn)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Check-out</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{fmtTime(todayRecord.checkOut)}</p>
            </div>
            {workedHours(todayRecord.checkIn, todayRecord.checkOut) && (
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Worked</p>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {workedHours(todayRecord.checkIn, todayRecord.checkOut)}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Status</p>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle[todayRecord.status]}`}>
                {todayRecord.status.charAt(0).toUpperCase() + todayRecord.status.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Action feedback */}
        {actionMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {actionMsg}
          </div>
        )}
        {actionErr && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {actionErr}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCheckIn}
            disabled={alreadyCheckedIn || actionLoading === "in"}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            {actionLoading === "in" ? "Checking in..." : alreadyCheckedIn ? "Checked In ✓" : "Check In"}
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!alreadyCheckedIn || alreadyCheckedOut || actionLoading === "out"}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {actionLoading === "out" ? "Checking out..." : alreadyCheckedOut ? "Checked Out ✓" : "Check Out"}
          </button>
        </div>
      </div>

      {/* ── History ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            History {records.length > 0 && <span className="text-slate-400 font-normal text-sm">({records.length} records)</span>}
          </h2>
          <input
            type="date" value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm mb-4">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">No attendance records yet.</p>
            <p className="text-slate-400 text-sm mt-1">Start by checking in today.</p>
          </div>
        )}

        {/* Desktop table */}
        {!loading && records.length > 0 && (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-left pb-3 font-medium">Check-in</th>
                    <th className="text-left pb-3 font-medium">Check-out</th>
                    <th className="text-left pb-3 font-medium">Worked</th>
                    <th className="text-left pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 text-slate-900 dark:text-white font-medium">{fmtDate(r.date)}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{fmtTime(r.checkIn)}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{fmtTime(r.checkOut)}</td>
                      <td className="py-3 text-indigo-600 dark:text-indigo-400 font-medium">
                        {workedHours(r.checkIn, r.checkOut) || "—"}
                      </td>
                      <td className="py-3">
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
            <div className="sm:hidden space-y-2">
              {records.map((r) => (
                <div key={r._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{fmtDate(r.date)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {fmtTime(r.checkIn)} → {fmtTime(r.checkOut)}
                      {workedHours(r.checkIn, r.checkOut) && ` · ${workedHours(r.checkIn, r.checkOut)}`}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusStyle[r.status]}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
