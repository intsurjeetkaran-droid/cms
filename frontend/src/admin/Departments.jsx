// ============================================================
// Departments.jsx — Admin: create departments + assign managers
// APIs: GET/POST /departments  |  POST /departments/assign-manager
//       DELETE /departments/:id/manager
// ============================================================

import { useEffect, useState } from "react";
import { getAllDepartments, createDepartment, assignManager, removeManager } from "../api/departmentApi";
import { getEmployees } from "../api/employeeApi";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers]       = useState([]);   // users with role=manager
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  // Create form
  const [newName, setNewName]         = useState("");
  const [creating, setCreating]       = useState(false);
  const [createMsg, setCreateMsg]     = useState("");
  const [createErr, setCreateErr]     = useState("");

  // Assign manager form
  const [assignForm, setAssignForm]   = useState({ departmentId: "", managerId: "" });
  const [assigning, setAssigning]     = useState(false);
  const [assignMsg, setAssignMsg]     = useState("");
  const [assignErr, setAssignErr]     = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    console.log("[DEPARTMENT] Fetching departments and managers...");
    try {
      const [depts, emps] = await Promise.all([
        getAllDepartments(),
        getEmployees(),
      ]);
      setDepartments(depts);
      // Extract unique managers from employee records
      const mgrs = emps
        .filter((e) => e.user?.role === "manager")
        .map((e) => ({ _id: e.user._id, name: e.user.name, email: e.user.email }));
      setManagers(mgrs);
      console.log("[DEPARTMENT] Loaded:", depts.length, "depts,", mgrs.length, "managers");
    } catch (err) {
      console.error("[DEPARTMENT ERROR] Fetch failed:", err.message);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Create department
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateErr("");
    setCreateMsg("");
    if (!newName.trim()) { setCreateErr("Department name is required."); return; }
    setCreating(true);
    try {
      await createDepartment({ name: newName.trim() });
      setCreateMsg(`Department "${newName.trim()}" created successfully.`);
      setNewName("");
      console.log("[DEPARTMENT] Created department");
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to create department.";
      console.error("[DEPARTMENT ERROR] Create:", msg);
      setCreateErr(msg);
    } finally {
      setCreating(false);
    }
  };

  // Assign manager
  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignErr("");
    setAssignMsg("");
    if (!assignForm.departmentId) { setAssignErr("Please select a department."); return; }
    if (!assignForm.managerId)    { setAssignErr("Please select a manager."); return; }
    setAssigning(true);
    try {
      const res = await assignManager(assignForm);
      setAssignMsg(`Manager assigned to ${res.department.name} successfully.`);
      setAssignForm({ departmentId: "", managerId: "" });
      console.log("[DEPARTMENT] Manager assigned");
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to assign manager.";
      console.error("[DEPARTMENT ERROR] Assign:", msg);
      setAssignErr(msg);
    } finally {
      setAssigning(false);
    }
  };

  // Remove manager
  const handleRemoveManager = async (deptId, deptName) => {
    if (!window.confirm(`Remove manager from ${deptName}?`)) return;
    try {
      await removeManager(deptId);
      console.log("[DEPARTMENT] Manager removed from:", deptName);
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to remove manager.";
      console.error("[DEPARTMENT ERROR] Remove manager:", msg);
      setError(msg);
    }
  };

  // Departments without a manager (for assign dropdown)
  const unassignedDepts = departments.filter((d) => !d.manager);
  // Managers not yet assigned to any department
  const assignedManagerIds = departments
    .filter((d) => d.manager)
    .map((d) => d.manager._id?.toString() || d.manager.toString());
  const availableManagers = managers.filter(
    (m) => !assignedManagerIds.includes(m._id.toString())
  );

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Departments</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {departments.length} department{departments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div className="mb-5 flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading skeleton for top cards */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      )}

      {!loading && <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Create Department</h2>

          {createMsg && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {createMsg}
            </div>
          )}
          {createErr && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {createErr}
            </div>
          )}

          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Engineering"
              className={inputCls + " flex-1"}
            />
            <button type="submit" disabled={creating}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition whitespace-nowrap">
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        {/* ── Assign Manager ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Assign Manager</h2>

          {assignMsg && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {assignMsg}
            </div>
          )}
          {assignErr && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {assignErr}
            </div>
          )}

          <form onSubmit={handleAssign} className="space-y-3">
            <select
              value={assignForm.departmentId}
              onChange={(e) => setAssignForm({ ...assignForm, departmentId: e.target.value })}
              className={inputCls}
            >
              <option value="">Select Department (without manager)...</option>
              {unassignedDepts.length === 0
                ? <option disabled>All departments have managers</option>
                : unassignedDepts.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))
              }
            </select>
            <select
              value={assignForm.managerId}
              onChange={(e) => setAssignForm({ ...assignForm, managerId: e.target.value })}
              className={inputCls}
            >
              <option value="">Select Manager (unassigned)...</option>
              {availableManagers.length === 0
                ? <option disabled>No available managers</option>
                : availableManagers.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))
              }
            </select>
            <button type="submit" disabled={assigning}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition">
              {assigning ? "Assigning..." : "Assign Manager"}
            </button>
          </form>
        </div>
      </div>}

      {/* ── Department List ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">All Departments</h2>
        </div>

        {loading ? (
          <div className="space-y-2 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">🏢</div>
            <p className="text-slate-600 dark:text-slate-300 font-medium">No departments found.</p>
            <p className="text-slate-400 text-sm mt-1">Create your first department above.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-slate-500 dark:text-slate-400">
                    {["Department", "Manager", "Status", "Created", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {departments.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white">{d.name}</td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                        {d.manager ? (
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{d.manager.name}</p>
                            <p className="text-xs text-slate-400">{d.manager.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">No manager assigned</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          d.manager
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                            : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                        }`}>
                          {d.manager ? "Active" : "No Manager"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        {d.manager && (
                          <button
                            onClick={() => handleRemoveManager(d._id, d.name)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition font-medium"
                          >
                            Remove Manager
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {departments.map((d) => (
                <div key={d._id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{d.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${
                      d.manager
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                        : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                    }`}>
                      {d.manager ? "Active" : "No Manager"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {d.manager ? `Manager: ${d.manager.name}` : "No manager assigned"}
                  </p>
                  {d.manager && (
                    <button
                      onClick={() => handleRemoveManager(d._id, d.name)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium"
                    >
                      Remove Manager
                    </button>
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
