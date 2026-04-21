// ============================================================
// CreateTask.jsx — Manager: create and assign a task
// API: POST /tasks  |  GET /employees (for dropdown)
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../api/taskApi";
import { getEmployees } from "../api/employeeApi";

const emptyForm = { title: "", description: "", assignedTo: "", deadline: "" };

export default function CreateTask() {
  const navigate = useNavigate();
  const [form, setForm]           = useState(emptyForm);
  const [employees, setEmployees] = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // Load employees for the dropdown — only employees (not managers)
  useEffect(() => {
    console.log("[TASK] Loading employees for dropdown...");
    getEmployees()
      .then((data) => {
        // Only show employees (role = employee), not managers
        const onlyEmployees = data.filter((e) => e.user?.role === "employee");
        setEmployees(onlyEmployees);
        console.log("[TASK] Employees loaded:", onlyEmployees.length);
      })
      .catch((err) => console.error("[TASK ERROR] Load employees failed:", err.message))
      .finally(() => setLoadingEmps(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!form.assignedTo) {
      setError("Please select an employee to assign this task.");
      return;
    }

    setSubmitting(true);
    console.log("[TASK] Creating task:", form.title);

    try {
      await createTask({
        title:       form.title.trim(),
        description: form.description.trim(),
        assignedTo:  form.assignedTo,
        deadline:    form.deadline || undefined,
      });

      console.log("[TASK] Task created successfully");
      setSuccess("Task created successfully!");

      // Redirect after short delay so user sees the success message
      setTimeout(() => navigate("/manager/tasks"), 1200);
    } catch (err) {
      const msg = err.response?.data?.msg || "Failed to create task.";
      console.error("[TASK ERROR] Create failed:", msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/manager/tasks")}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create Task</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm ml-9">Assign a new task to a team member</p>
      </div>

      <div className="max-w-xl">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6">

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text" name="title" value={form.title}
                onChange={handleChange} required
                placeholder="e.g. Fix login bug"
                className={inputCls}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                name="description" value={form.description}
                onChange={handleChange} rows={3}
                placeholder="Describe what needs to be done..."
                className={inputCls + " resize-none"}
              />
            </div>

            {/* Assign Employee */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Assign To <span className="text-red-500">*</span>
              </label>
              {loadingEmps ? (
                <div className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ) : (
                <select
                  name="assignedTo" value={form.assignedTo}
                  onChange={handleChange} required
                  className={inputCls}
                >
                  <option value="">Select an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} — {emp.designation} ({emp.department})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Deadline <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date" name="deadline" value={form.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={inputCls}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit" disabled={submitting || loadingEmps}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition text-sm"
              >
                {submitting ? "Creating..." : "Create Task"}
              </button>
              <button
                type="button" onClick={() => navigate("/manager/tasks")}
                className="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
