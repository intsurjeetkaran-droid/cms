// ============================================================
// taskApi.js — All task API calls
// Backend: /api/tasks (protected, role-based)
// ============================================================

import API from "./axios";

// ── Employee ──

// GET tasks assigned to logged-in employee
export const getMyTasks = async (status = "") => {
  console.log("[TASK API] Fetching my tasks...", status ? `status=${status}` : "all");
  const { data } = await API.get("/tasks/my", { params: status ? { status } : {} });
  console.log("[TASK API] My tasks loaded:", data.length);
  return data;
};

// PUT update task status (employee only)
export const updateTaskStatus = async (taskId, status) => {
  console.log("[TASK API] Updating task status:", taskId, "→", status);
  const { data } = await API.put(`/tasks/${taskId}`, { status });
  console.log("[TASK API] Status updated:", taskId);
  return data;
};

// ── Manager ──

// GET tasks created by logged-in manager
export const getManagerTasks = async (status = "") => {
  console.log("[TASK API] Fetching manager tasks...", status ? `status=${status}` : "all");
  const { data } = await API.get("/tasks/manager", { params: status ? { status } : {} });
  console.log("[TASK API] Manager tasks loaded:", data.length);
  return data;
};

// POST create a new task (manager only)
export const createTask = async (payload) => {
  console.log("[TASK API] Creating task:", payload.title);
  const { data } = await API.post("/tasks", payload);
  console.log("[TASK API] Task created:", data.task._id);
  return data;
};

// ── Admin ──

// GET all tasks with optional filters + pagination
export const getAllTasks = async (filters = {}) => {
  console.log("[TASK API] Fetching all tasks with filters:", filters);
  const { data } = await API.get("/tasks", { params: filters });
  console.log("[TASK API] All tasks loaded:", data.total, "total");
  return data;
};
