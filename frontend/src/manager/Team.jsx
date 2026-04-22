// ============================================================
// Team.jsx — Manager: view team + add employees
// Department is auto-set to manager's own department (locked)
// APIs: GET /employees  |  POST /employees
//       GET /departments/my  — to get manager's department
// ============================================================

import { useEffect, useState } from "react";
import { getEmployees, createEmployee } from "../api/employeeApi";
import { getMyDepartment } from "../api/departmentApi";

const emptyForm = {
  name: "", email: "", phone: "",
  designation: "", salary: "", password: "",
};

export default function Team() {
  const [employees, setEmployees]       = useState([]);
  const [myDept, setMyDept]             = useState(null);   // manager's department
  const [deptError, setDeptError]       = useState("");     // if no dept assigned
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(emptyForm);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    console.log("[TEAM] Fetching team and department...");
    try {
      const [emps, dept] = await Promise.all([
        getEmployees(),
        getMyDepartment(),
      ]);
      // Only show employees (role = employee), not the manager themselves
      const teamOnly = emps.filter((e) => e.user?.role === "employee");
      setEmployees(teamOnly);
      setMyDept(dept);
      console.log("[TEAM] Team members:", teamOnly.length, "| Department:", dept.name);
    } catch (err) {
      // If department fetch fails, still show employees
      if (err.response?.status === 404) {
        console.warn("[TEAM] Manager has no department assigned");
        setDeptError("You are not assigned to any department. Contact admin to assign you to a department before adding employees.");
        try {
          const emps = await getEmployees();
          setEmployees(emps);
        } catch (e) {
          console.error("[TEAM ERROR]", e.message);
        }
      } else {
        console.error("[TEAM ERROR]", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setError("");
    setForm(emptyForm);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    console.log("[TEAM] Creating employee in department:", myDept?.name);
    try {
      // Department is always the manager's own department — enforced on backend too
      await createEmployee({ ...form, role: "employee", department: myDept.name });
      console.log("[TEAM] Employee created in:", myDept.name);
      setShowModal(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to add employee";
      console.error("[TEAM ERROR]", msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Team</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {myDept ? (
              <span>
                {employees.length} member{employees.length !== 1 ? "s" : ""} ·{" "}
                <span className="text-indigo-500 font-medium">{myDept.name}</span> department
              </span>
            ) : (
              `${employees.length} team members`
            )}
          </p>
        </div>
        <button
          onClick={openModal}
          disabled={!myDept}
          title={!myDept ? "No department assigned" : "Add team member"}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition flex-shrink-0"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden xs:inline">Add Member</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>

      {/* Department warning */}
      {deptError && (
        <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {deptError}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <div className="text-5xl mb-4">👥</div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-lg">No team members yet.</p>
          <p className="text-slate-400 text-sm mt-1">
            {myDept ? `Add your first employee to the ${myDept.name} department.` : "Contact admin to assign you to a department."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((e) => (
            <div key={e._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg mb-3">
                {e.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className="font-semibold text-slate-900 dark:text-white leading-tight">{e.name}</p>
                {/* Badge if added by admin */}
                {e.createdBy?.role === "admin" && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 flex-shrink-0 font-medium">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-0.5">{e.designation || "—"}</p>
              <p className="text-slate-400 text-xs">{e.department || "—"}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                  e.status === "active"
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                    : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                }`}>
                  {e.status}
                </span>
                <span className="text-slate-400 text-xs">{e.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: `calc(1.25rem + var(--sab))` }}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Team Member</h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Department badge — locked */}
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Department:{" "}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{myDept?.name}</span>
              <span className="ml-2 text-xs text-slate-400">(auto-assigned)</span>
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="john@company.com" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+1 234 567 890" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Salary ($) <span className="text-slate-400 font-normal">min $20,000</span>
                  </label>
                  <input required type="number" min="20000" value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="20000" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Designation</label>
                <input required value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  placeholder="e.g. Frontend Developer" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
                <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters" className={inputCls} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 transition">
                  {submitting ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
