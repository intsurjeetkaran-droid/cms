// ============================================================
// Leaves.jsx — Employee: apply for leave + view history
// API: POST /leaves  |  GET /leaves/my
// Rules: max 5 days/month, no overlapping, no admin apply
// ============================================================

import { useEffect, useState } from "react";
import { applyLeave, getMyLeaves } from "../api/leaveApi";

const statusStyle = {
  pending:  "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  approved: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  rejected: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Default today's date as YYYY-MM-DD
const today = () => new Date().toISOString().split("T")[0];

export default function EmployeeLeaves() {
  const [leaves, setLeaves]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("");

  // Apply form
  const [form, setForm]         = useState({ startDate: today(), endDate: today(), reason: "" });
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [applyErr, setApplyErr] = useState("");

  useEffect(() => { fetchLeaves(); }, [filter]);

  const fetchLeaves = async () => {
    setLoading(true);
    setError("");
    console.log("[LEAVE] Fetching my leaves...");
    try {
      const data = await getMyLeaves(filter);
      setLeaves(data);
      console.log("[LEAVE] Leaves loaded:", data.length);
    } catch (err) {
      console.error("[LEAVE ERROR] Fetch failed:", err.message);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplyErr("");
    setApplyMsg("");

    // Frontend validation
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setApplyErr("All fields are required.");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setApplyErr("End date must be on or after start date.");
      return;
    }
    const days = Math.round((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 5) {
      setApplyErr("You can only apply for 5 leave days per month.");
      return;
    }

    setApplying(true);
    console.log("[LEAVE] Applying for leave...");
    try {
      await applyLeave(form);
      setApplyMsg("Leave request submitted successfully.");
      setForm({ startDate: today(), endDate: today(), reason: "" });
      fetchLeaves();
    } catch (err) {
      const msg = err.response?.data?.msg || "Unable to process request. Please try again.";
      console.error("[LEAVE ERROR] Apply failed:", msg);
      setApplyErr(msg);
    } finally {
      setApplying(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Apply for leave and view your history</p>
      </div>

      {/* ── Apply Leave Form ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Apply for Leave</h2>
        <p className="text-xs text-slate-400 mb-4">Maximum 5 leave days per month. Approved leaves are not deducted from salary.</p>

        {applyMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {applyMsg}
          </div>
        )}
        {applyErr && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {applyErr}
          </div>
        )}

        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
              <input type="date" value={form.startDate} min={today()}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={inputCls} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">End Date</label>
              <input type="date" value={form.endDate} min={form.startDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={inputCls} required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Reason</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Briefly describe your reason for leave..."
              rows={3} className={inputCls + " resize-none"} required />
          </div>
          <button type="submit" disabled={applying}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition">
            {applying ? "Submitting..." : "Apply for Leave"}
          </button>
        </form>
      </div>

      {/* ── Leave History ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Leave History <span className="text-slate-400 font-normal text-sm">({leaves.length})</span>
          </h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && !error && leaves.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="text-4xl mb-3">🏖️</div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">No leave records yet.</p>
            <p className="text-slate-400 text-sm mt-1">Apply for leave using the form above.</p>
          </div>
        )}

        <div className="space-y-3">
          {leaves.map((l) => (
            <div key={l._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {fmtDate(l.startDate)} — {fmtDate(l.endDate)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{l.totalDays} day{l.totalDays > 1 ? "s" : ""}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusStyle[l.status]}`}>
                  {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{l.reason}</p>
              {l.approvedBy && (
                <p className="text-xs text-slate-400 mt-2">
                  {l.status === "approved" ? "Approved" : "Rejected"} by {l.approvedBy.name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
