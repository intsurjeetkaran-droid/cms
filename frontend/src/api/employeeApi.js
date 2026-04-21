// ============================================================
// employeeApi.js — All employee CRUD API calls
// Backend: /api/employees (protected, admin + manager)
// ============================================================

import API from "./axios";

// GET all employees
export const getEmployees = async () => {
  console.log("[EMPLOYEE API] Fetching all employees...");
  const { data } = await API.get("/employees");
  console.log("[EMPLOYEE API] Fetched:", data.length, "employees");
  return data;
};

// GET single employee by ID
export const getEmployeeById = async (id) => {
  console.log("[EMPLOYEE API] Fetching employee:", id);
  const { data } = await API.get(`/employees/${id}`);
  return data;
};

// POST create employee (admin + manager)
export const createEmployee = async (payload) => {
  console.log("[EMPLOYEE API] Creating employee:", payload.email);
  const { data } = await API.post("/employees", payload);
  console.log("[EMPLOYEE API] Created:", data.employee._id);
  return data;
};

// PUT update employee (admin + manager)
export const updateEmployee = async (id, payload) => {
  console.log("[EMPLOYEE API] Updating employee:", id);
  const { data } = await API.put(`/employees/${id}`, payload);
  console.log("[EMPLOYEE API] Updated:", data._id);
  return data;
};

// DELETE employee (admin only)
export const deleteEmployee = async (id) => {
  console.log("[EMPLOYEE API] Deleting employee:", id);
  const { data } = await API.delete(`/employees/${id}`);
  console.log("[EMPLOYEE API] Deleted:", id);
  return data;
};

// GET logged-in employee's own profile
export const getMyProfile = async () => {
  console.log("[EMPLOYEE API] Fetching my profile...");
  const { data } = await API.get("/employees/me");
  console.log("[EMPLOYEE API] My profile:", data._id);
  return data;
};
