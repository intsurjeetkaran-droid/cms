// ============================================================
// AdminLeaves.jsx — Admin: view all leaves + approve/reject
// API: GET /leaves  |  PUT /leaves/:id
// Admin can approve/reject ALL leaves including manager leaves
// ============================================================

import { useEffect, useState } from "react";
import { getAllLeaves, updateLeaveStatus } from "../api/leaveApi";

const statusStyle = {
  pending:  "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  approved: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
  rejected: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30",
};

const roleBadge = {
  manager:  "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
  employee: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
};

const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const LIMIT = 15;

export default function AdminLeaves() {
  const [leaves, setLeaves]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [updating, setUpdating] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter]     = useState("");

  // Pagination
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchLeaves(); }, [statusFilter, roleFilter, page]);

  const fetchLeaves = async () => {
    setLoading(true);
    setError("");
    console.log("[LEAVE] Fetching all leaves...");
    const filters = { page, limit: LIMIT };
    if (statusFilter) filters.status = statusFilter;
    if (roleFilter)   filters.role   = roleFilter;
    try {
      const data = await getAllLeaves(filters);
      setLeaves(data.leaves);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      console.log("[LEAVE] All leaves loaded:", data.leaves.length, "of", data.total);
    } catch (err) {
      console.error("[LEAVE ERROR] Fetch all:", err.message);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const handleAction = async (id, status) => {
    setUpdating(id);
    console.log("[LEAVE] Updating leave status:", id, "→", status);
    try {
      await updateLeaveStatus(id, status);
      console.log("[LEAVE]", status === "approved" ? "Leave approved" : "Leave rejected");
      fetchLeaves();
    } catch (err) {
      const msg = err.response?.data?.msg || "Unable to process request.";
      console.error("[LEAVE ERROR] Update:", msg);
      setError(msg); // show inline error instead of alert
    } finally {
      setUpdating(null);
    }
  };

  const clearFilters = () => { setStatusFilter(""); setRoleFilter(""); setPage(1); };
  const hasFilters = statusFilter || roleFilter;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Requests</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} total requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-5">
        <select value={statusFilter} onChange={handleFilterChange(setStatusFilter)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={roleFilter} onChange={handleFilterChange(setRoleFilter)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Roles</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
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
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && leaves.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="text-5xl mb-4">🏖️</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No leave records found.</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      )}

      {/* Desktop table */}
      {!loading && leaves.length > 0 && (
        <>
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-slate-500 dark:text-slate-400">
                  {["User", "Role", "Dates", "Days", "Reason", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900 dark:text-white">{l.user?.name || "—"}</p>
                      <p className="text-xs text-slate-400">{l.user?.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${roleBadge[l.role] || ""}`}>
                        {l.role?.toUpperCase()}
                      </span>
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
                          <button onClick={() => handleAction(l._id, "approved")} disabled={updating === l._id}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-medium disabled:opacity-50 transition">
                            {updating === l._id ? "..." : "Approve"}
                          </button>
                          <button onClick={() => handleAction(l._id, "rejected")} disabled={updating === l._id}
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
            {leaves.map((l) => (
              <div key={l._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{l.user?.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold border ${roleBadge[l.role] || ""}`}>
                        {l.role?.toUpperCase()}
                      </span>
                    </div>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Page {page} of {totalPages} · {total} total</p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  ← Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
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
