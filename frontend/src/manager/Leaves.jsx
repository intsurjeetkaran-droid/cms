// ============================================================
// Leaves.jsx — Manager: apply own leave + approve/reject team leaves
// API: POST /leaves  |  GET /leaves/my  |  GET /leaves/team
//      PUT /leaves/:id
// Rules: cannot approve own leave, can only approve employee leaves
// ============================================================

import { useEffect, useState } from "react";
import { applyLeave, getMyLeaves, getTeamLeaves, updateLeaveStatus } from "../api/leaveApi";

const statusStyle = {
  pending:  "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  approved: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  rejected: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const today   = () => new Date().toISOString().split("T")[0];

export default function ManagerLeaves() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [myLeaves, setMyLeaves]     = useState([]);
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [updating, setUpdating]     = useState(null); // leave id being updated

  // Apply form
  const [form, setForm]         = useState({ startDate: today(), endDate: today(), reason: "" });
  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState("");
  const [applyErr, setApplyErr] = useState("");

  useEffect(() => { fetchAll(); }, [teamFilter]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    console.log("[LEAVE] Fetching manager leaves...");
    try {
      const [mine, team] = await Promise.all([
        getMyLeaves(),
        getTeamLeaves(teamFilter),
      ]);
      setMyLeaves(mine);
      setTeamLeaves(team);
      console.log("[LEAVE] My leaves:", mine.length, "| Team leaves:", team.length);
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
    if (!form.reason.trim()) { setApplyErr("Reason is required."); return; }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setApplyErr("End date must be on or after start date.");
      return;
    }
    setApplying(true);
    try {
      await applyLeave(form);
      setApplyMsg("Leave request submitted successfully.");
      setForm({ startDate: today(), endDate: today(), reason: "" });
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.msg || "Unable to process request.";
      console.error("[LEAVE ERROR] Apply:", msg);
      setApplyErr(msg);
    } finally {
      setApplying(false);
    }
  };

  const handleAction = async (id, status) => {
    setUpdating(id);
    console.log("[LEAVE] Updating leave status:", id, "→", status);
    try {
      await updateLeaveStatus(id, status);
      console.log("[LEAVE]", status === "approved" ? "Leave approved" : "Leave rejected");
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.msg || "Unable to process request.";
      console.error("[LEAVE ERROR] Update:", msg);
      setError(msg); // show inline error instead of alert
    } finally {
      setUpdating(null);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Apply for your own leave and manage team requests</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* ── Apply Own Leave ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Apply for Leave</h2>

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

          <form onSubmit={handleApply} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="Reason for leave..." rows={2}
                className={inputCls + " resize-none"} required />
            </div>
            <button type="submit" disabled={applying}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition">
              {applying ? "Submitting..." : "Apply for Leave"}
            </button>
          </form>
        </div>

        {/* ── My Leave History ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">My Leave History</h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
            </div>
          ) : myLeaves.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No leave records yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {myLeaves.map((l) => (
                <div key={l._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {fmtDate(l.startDate)} — {fmtDate(l.endDate)}
                    </p>
                    <p className="text-xs text-slate-400">{l.totalDays}d · {l.reason}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusStyle[l.status]}`}>
                    {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Team Leave Requests ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Team Leave Requests <span className="text-slate-400 font-normal text-sm">({teamLeaves.length})</span>
          </h2>
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
          </div>
        )}

        {!loading && teamLeaves.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="text-4xl mb-3">🏖️</div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">No leave records found.</p>
          </div>
        )}

        {!loading && teamLeaves.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-slate-500 dark:text-slate-400">
                    {["Employee", "Dates", "Days", "Reason", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {teamLeaves.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">
                        {l.user?.name || "—"}
                        <p className="text-xs text-slate-400 font-normal">{l.user?.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                        {fmtDate(l.startDate)}<br />{fmtDate(l.endDate)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{l.totalDays}</td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">{l.reason}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle[l.status]}`}>
                          {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {l.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAction(l._id, "approved")}
                              disabled={updating === l._id}
                              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-medium disabled:opacity-50 transition">
                              {updating === l._id ? "..." : "Approve"}
                            </button>
                            <button onClick={() => handleAction(l._id, "rejected")}
                              disabled={updating === l._id}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 font-medium disabled:opacity-50 transition">
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {teamLeaves.map((l) => (
                <div key={l._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{l.user?.name}</p>
                      <p className="text-xs text-slate-400">{fmtDate(l.startDate)} — {fmtDate(l.endDate)} · {l.totalDays}d</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${statusStyle[l.status]}`}>
                      {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{l.reason}</p>
                  {l.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(l._id, "approved")} disabled={updating === l._id}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium disabled:opacity-50">
                        {updating === l._id ? "..." : "Approve"}
                      </button>
                      <button onClick={() => handleAction(l._id, "rejected")} disabled={updating === l._id}
                        className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium disabled:opacity-50">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
