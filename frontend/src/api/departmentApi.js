// ============================================================
// departmentApi.js — All department API calls
// Backend: /api/departments (protected, role-based)
// ============================================================

import API from "./axios";

// GET all departments for dropdowns (any logged-in user)
export const getDepartments = async () => {
  console.log("[DEPARTMENT] Fetching departments...");
  const { data } = await API.get("/departments/public");
  console.log("[DEPARTMENT] Departments loaded:", data.length);
  return data;
};

// GET all departments with full details (admin only)
export const getAllDepartments = async () => {
  console.log("[DEPARTMENT] Fetching all departments (admin)...");
  const { data } = await API.get("/departments");
  console.log("[DEPARTMENT] All departments loaded:", data.length);
  return data;
};

// POST create a new department (admin only)
export const createDepartment = async (data) => {
  console.log("[DEPARTMENT] Creating department:", data.name);
  const { data: res } = await API.post("/departments", data);
  console.log("[DEPARTMENT] Created department:", res.department._id);
  return res;
};

// POST assign manager to department (admin only)
export const assignManager = async (data) => {
  console.log("[DEPARTMENT] Assigning manager:", data.managerId, "→", data.departmentId);
  const { data: res } = await API.post("/departments/assign-manager", data);
  console.log("[DEPARTMENT] Manager assigned");
  return res;
};

// DELETE remove manager from department (admin only)
export const removeManager = async (departmentId) => {
  console.log("[DEPARTMENT] Removing manager from:", departmentId);
  const { data } = await API.delete(`/departments/${departmentId}/manager`);
  return data;
};

// GET logged-in manager's own department
export const getMyDepartment = async () => {
  console.log("[DEPARTMENT API] Fetching my department...");
  const { data } = await API.get("/departments/my");
  console.log("[DEPARTMENT API] My department:", data.name);
  return data;
};
