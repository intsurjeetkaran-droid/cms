// ============================================================
// payrollApi.js — All payroll API calls
// Backend: /api/payroll (protected, role-based)
// ============================================================

import API from "./axios";

// ── Admin + Manager ──

// POST generate payroll for an employee
export const generatePayroll = async (data) => {
  console.log("[PAYROLL API] Generating payroll:", data);
  const { data: res } = await API.post("/payroll/generate", data);
  console.log("[PAYROLL API] Payroll generated:", res.payroll._id);
  return res;
};

// ── Employee ──

// GET own payroll records
export const getMyPayroll = async (month = "") => {
  console.log("[PAYROLL API] Fetching my payroll...", month || "all");
  const { data } = await API.get("/payroll/my", { params: month ? { month } : {} });
  console.log("[PAYROLL API] My payroll loaded:", data.length);
  return data;
};

// ── Manager ──

// GET team payroll records
export const getTeamPayroll = async (filters = {}) => {
  console.log("[PAYROLL API] Fetching team payroll...", filters);
  const { data } = await API.get("/payroll/team", { params: filters });
  console.log("[PAYROLL API] Team payroll loaded:", data.length);
  return data;
};

// ── Admin ──

// GET all payroll records with filters + pagination
export const getAllPayroll = async (filters = {}) => {
  console.log("[PAYROLL API] Fetching all payroll...", filters);
  const { data } = await API.get("/payroll", { params: filters });
  console.log("[PAYROLL API] All payroll loaded:", data.total, "total");
  return data;
};
