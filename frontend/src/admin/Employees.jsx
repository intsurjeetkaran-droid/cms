// ============================================================
// Employees.jsx — Full CRUD employee management (admin only)
// APIs: GET, POST, PUT, DELETE /api/employees
// ============================================================

import { useEffect, useState } from "react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../api/employeeApi";
import { getDepartments } from "../api/departmentApi";

const emptyForm = { name: "", email: "", phone: "", department: "", designation: "", salary: "", role: "employee", password: "" };

export default function Employees() {
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [filterDept, setFilterDept] = useState(""); // department filter
  const [filterStatus, setFilterStatus] = useState(""); // active | inactive
  const [sortBy, setSortBy]         = useState("name"); // name | salary
  const [deptOptions, setDeptOptions] = useState([]); // departments from API

  useEffect(() => {
    fetchEmployees();
    // Load departments for the form dropdown
    getDepartments()
      .then(setDeptOptions)
      .catch((err) => console.error("[EMPLOYEES] Load departments failed:", err.message));
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try { const data = await getEmployees(); setEmployees(data); }
    catch (err) { console.error("[EMPLOYEES ERROR]", err.message); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    console.log("[EMPLOYEES] Open create modal");
    setEditTarget(null); setForm(emptyForm); setError(""); setShowModal(true);
  };

  const openEdit = (emp) => {
    console.log("[EMPLOYEES] Open edit modal:", emp._id);
    setEditTarget(emp);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone, department: emp.department, designation: emp.designation, salary: emp.salary, role: emp.user?.role || "employee", password: "" });
    setError(""); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      if (editTarget) { await updateEmployee(editTarget._id, form); }
      else { await createEmployee(form); }
      setShowModal(false); fetchEmployees();
    } catch (err) {
      const msg = err.response?.data?.msg || "Operation failed";
      console.error("[EMPLOYEES ERROR]", msg); setError(msg);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.response?.data?.msg || "Delete failed. Please try again.");
    }
  };

  // Derive unique departments from data for dropdown
  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))].sort();

  // Apply search + filters + sort
  const filtered = employees
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q);
      const matchDept   = !filterDept   || e.department === filterDept;
      const matchStatus = !filterStatus || e.status === filterStatus;
      return matchSearch && matchDept && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "salary") return Number(b.salary) - Number(a.salary);
      return a.name.localeCompare(b.name);
    });

  // Reset all filters
  const clearFilters = () => {
    setSearch(""); setFilterDept(""); setFilterStatus(""); setSortBy("name");
    console.log("[EMPLOYEES] Filters cleared");
  };

  const hasFilters = search || filterDept || filterStatus || sortBy !== "name";

  const inputCls = "w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employees</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{employees.length} total</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden xs:inline">Add Employee</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
          <input
            type="text" placeholder="Search name, email, dept..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Department filter */}
          <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); console.log("[EMPLOYEES] Dept filter:", e.target.value); }}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {/* Status filter */}
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); console.log("[EMPLOYEES] Status filter:", e.target.value); }}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {/* Sort */}
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); console.log("[EMPLOYEES] Sort by:", e.target.value); }}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="name">Sort: Name</option>
            <option value="salary">Sort: Salary ↓</option>
          </select>
        </div>
        {/* Count + clear */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm whitespace-nowrap">{filtered.length} of {employees.length}</span>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium whitespace-nowrap">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table — hidden on mobile, shown on md+ */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No employees found.</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-slate-500 dark:text-slate-400">
                    {["Name", "Department", "Designation", "Phone", "Salary", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((e) => (
                    <tr key={e._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 dark:text-white">{e.name}</p>
                        <p className="text-slate-400 text-xs">{e.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{e.department}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{e.designation}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{e.phone}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">${Number(e.salary).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${e.status === "active" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(e)} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition font-medium">Edit</button>
                          <button onClick={() => handleDelete(e._id)} className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((e) => (
                <div key={e._id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{e.name}</p>
                      <p className="text-slate-400 text-xs">{e.email}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${e.status === "active" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"}`}>
                      {e.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span>{e.department}</span>
                    <span>{e.designation}</span>
                    <span>{e.phone}</span>
                    <span>${Number(e.salary).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)} className="flex-1 text-xs py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">Edit</button>
                    <button onClick={() => handleDelete(e._id)} className="flex-1 text-xs py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-0 sm:px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ paddingBottom: `calc(1.25rem + var(--sab))` }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editTarget ? "Edit Employee" : "Add Employee"}</h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Full Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label><input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 890" className={inputCls} /></div>
                <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Salary ($) <span className="text-slate-400 font-normal">min $20,000</span></label><input required type="number" min="20000" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="20000" className={inputCls} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Department {form.role === "manager" && <span className="text-slate-400 font-normal">(assigned later)</span>}
                  </label>
                  {form.role === "manager" ? (
                    <div className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                      Department will be assigned by admin after creation
                    </div>
                  ) : deptOptions.length === 0 ? (
                    <div className="w-full px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
                      No departments available. Please create one first.
                    </div>
                  ) : (
                    <select required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls}>
                      <option value="">Select Department...</option>
                      {deptOptions.map((d) => (
                        <option key={d._id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Designation</label><input required value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Frontend Dev" className={inputCls} /></div>
              </div>
              {!editTarget && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, department: e.target.value === "manager" ? "" : form.department })} className={inputCls}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                  <div><label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label><input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 chars" className={inputCls} /></div>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold disabled:opacity-50 transition">{submitting ? "Saving..." : editTarget ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
