// ============================================================
// attendanceApi.js — All attendance API calls
// Backend: /api/attendance (protected, role-based)
// ============================================================

import API from "./axios";

// ── Employee ──

// POST check in for today
export const checkIn = async () => {
  console.log("[ATTENDANCE API] Checking in...");
  const { data } = await API.post("/attendance/check-in");
  console.log("[ATTENDANCE API] Check-in success:", data.msg);
  return data;
};

// POST check out for today
export const checkOut = async () => {
  console.log("[ATTENDANCE API] Checking out...");
  const { data } = await API.post("/attendance/check-out");
  console.log("[ATTENDANCE API] Check-out success:", data.msg);
  return data;
};

// GET own attendance history
export const getMyAttendance = async (date = "") => {
  console.log("[ATTENDANCE API] Fetching my attendance...", date || "all");
  const { data } = await API.get("/attendance/my", { params: date ? { date } : {} });
  console.log("[ATTENDANCE API] My records loaded:", data.length);
  return data;
};

// ── Manager ──

// GET team attendance with optional filters
export const getTeamAttendance = async (filters = {}) => {
  console.log("[ATTENDANCE API] Fetching team attendance...", filters);
  const { data } = await API.get("/attendance/team", { params: filters });
  console.log("[ATTENDANCE API] Team records loaded:", data.length);
  return data;
};

// ── Admin ──

// GET all attendance with filters + pagination
export const getAllAttendance = async (filters = {}) => {
  console.log("[ATTENDANCE API] Fetching all attendance...", filters);
  const { data } = await API.get("/attendance", { params: filters });
  console.log("[ATTENDANCE API] All records loaded:", data.total, "total");
  return data;
};
