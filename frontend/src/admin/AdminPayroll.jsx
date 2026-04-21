// ============================================================
// AdminPayroll.jsx — Admin: view all payroll + generate
// API: GET /payroll  |  POST /payroll/generate
// ============================================================

import { useEffect, useState } from "react";
import { getAllPayroll, generatePayroll } from "../api/payrollApi";
import { getEmployees } from "../api/employeeApi";

const fmtMonth = (m) => {
  const [y, mo] = m.split("-");
  return new Date(y, mo - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const fmt = (n) => `$${Number(n).toLocaleString()}`;

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const LIMIT = 15;

export default function AdminPayroll() {
  const [records, setRecords]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Generate form
  const [form, setForm]           = useState({ employeeId: "", month: currentMonth() });
  const [generating, setGenerating] = useState(false);
  const [genSuccess, setGenSuccess] = useState("");
  const [genError, setGenError]   = useState("");

  // Filters
  const [monthFilter, setMonthFilter] = useState("");
  const [empFilter, setEmpFilter]     = useState("");

  // Pagination
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getEmployees()
      .then(setEmployees)
      .catch((err) => console.error("[PAYROLL ERROR] Load employees:", err.message));
  }, []);

  useEffect(() => {
    fetchPayroll();
  }, [monthFilter, empFilter, page]);

  const fetchPayroll = async () => {
    setLoading(true);
    setError("");
    console.log("[PAYROLL] Fetching all payroll...");
    const filters = { page, limit: LIMIT };
    if (monthFilter) filters.month      = monthFilter;
    if (empFilter)   filters.employeeId = empFilter;
    try {
      const data = await getAllPayroll(filters);
      setRecords(data.records);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      console.log("[PAYROLL] All payroll loaded:", data.records.length, "of", data.total);
    } catch (err) {
      console.error("[PAYROLL ERROR] Fetch all:", err.message);
      setError("Failed to load payroll data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenError("");
    setGenSuccess("");
    if (!form.employeeId) { setGenError("Please select an employee."); return; }
    setGenerating(true);
    console.log("[PAYROLL] Generating payroll...");
    try {
      await generatePayroll({ employeeId: form.employeeId, month: form.month });
      setGenSuccess(`Payroll generated for ${fmtMonth(form.month)}`);
      console.log("[PAYROLL] Payroll generated");
      setPage(1);
      fetchPayroll();
    } catch (err) {
      const msg = err.response?.data?.msg || "Unable to generate payroll";
      console.error("[PAYROLL ERROR] Generate:", msg);
      setGenError(msg);
    } finally {
      setGenerating(false);
    }
  };

  const inputCls = "px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const hasFilters = monthFilter || empFilter;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payroll</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} total records</p>
      </div>

      {/* ── Generate Payroll ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Generate Payroll</h2>

        {genSuccess && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {genSuccess}
          </div>
        )}
        {genError && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {genError}
          </div>
        )}

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className={inputCls + " flex-1"}>
            <option value="">Select Employee...</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>{e.name} — {e.department}</option>
            ))}
          </select>
          <input type="month" value={form.month}
            onChange={(e) => setForm({ ...form, month: e.target.value })}
            className={inputCls + " sm:w-44"} />
          <button type="submit" disabled={generating}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition whitespace-nowrap">
            {generating ? "Generating..." : "Generate"}
          </button>
        </form>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-5">
        <input type="month" value={monthFilter} onChange={handleFilterChange(setMonthFilter)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <select value={empFilter} onChange={handleFilterChange(setEmpFilter)}
          className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Employees</option>
          {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => { setMonthFilter(""); setEmpFilter(""); setPage(1); }}
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
          <div className="text-5xl mb-4">💰</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No payroll data available.</p>
          <p className="text-slate-400 text-sm mt-1">Generate payroll for employees above.</p>
        </div>
      )}

      {/* Desktop table */}
      {!loading && records.length > 0 && (
        <>
          <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr className="text-slate-500 dark:text-slate-400">
                  {["Employee", "Month", "Base Salary", "Absent Days", "Deduction", "Net Salary", "Generated By"].map((h) => (
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
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{fmtMonth(r.month)}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{fmt(r.baseSalary)}</td>
                    <td className="px-5 py-3.5 text-amber-600 dark:text-amber-400 font-medium">{r.absentDays}</td>
                    <td className="px-5 py-3.5 text-red-600 dark:text-red-400 font-medium">-{fmt(r.deduction)}</td>
                    <td className="px-5 py-3.5 text-emerald-600 dark:text-emerald-400 font-bold">{fmt(r.netSalary)}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs capitalize">
                      {r.generatedBy?.name || "—"}
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
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{r.employee?.name || "—"}</p>
                    <p className="text-xs text-slate-400">{r.employee?.department} · {fmtMonth(r.month)}</p>
                  </div>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{fmt(r.netSalary)}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Base: {fmt(r.baseSalary)}</span>
                  <span className="text-amber-500">Absent: {r.absentDays}d</span>
                  <span className="text-red-500">-{fmt(r.deduction)}</span>
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
