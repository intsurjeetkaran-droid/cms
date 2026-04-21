// ============================================================
// leaveApi.js — All leave API calls
// Backend: /api/leaves (protected, role-based)
// ============================================================

import API from "./axios";

// POST apply for leave (employee + manager)
export const applyLeave = async (data) => {
  console.log("[LEAVE API] Applying for leave:", data);
  const { data: res } = await API.post("/leaves", data);
  console.log("[LEAVE API] Leave applied:", res.leave._id);
  return res;
};

// GET own leave history (employee + manager)
export const getMyLeaves = async (status = "") => {
  console.log("[LEAVE API] Fetching my leaves...", status || "all");
  const { data } = await API.get("/leaves/my", { params: status ? { status } : {} });
  console.log("[LEAVE API] My leaves loaded:", data.length);
  return data;
};

// GET team leave requests (manager only)
export const getTeamLeaves = async (status = "") => {
  console.log("[LEAVE API] Fetching team leaves...", status || "all");
  const { data } = await API.get("/leaves/team", { params: status ? { status } : {} });
  console.log("[LEAVE API] Team leaves loaded:", data.length);
  return data;
};

// GET all leave requests (admin only)
export const getAllLeaves = async (filters = {}) => {
  console.log("[LEAVE API] Fetching all leaves...", filters);
  const { data } = await API.get("/leaves", { params: filters });
  console.log("[LEAVE API] All leaves loaded:", data.total, "total");
  return data;
};

// PUT approve or reject a leave (manager + admin)
export const updateLeaveStatus = async (id, status) => {
  console.log("[LEAVE API] Updating leave status:", id, "→", status);
  const { data } = await API.put(`/leaves/${id}`, { status });
  console.log("[LEAVE API] Leave status updated:", id);
  return data;
};
