const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
} = require("../controllers/employeeController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// 🔐 Protect all routes
router.use(authMiddleware);

// ================= ROUTES =================

// ✅ Admin + Manager can create
router.post("/", authorizeRoles("admin", "manager"), createEmployee);

// ✅ Logged-in employee can fetch their own profile
router.get("/me", getMyProfile);

// ✅ Admin + Manager can view all
router.get("/", authorizeRoles("admin", "manager"), getEmployees);

// ✅ All logged-in users can view single (optional)
router.get("/:id", getEmployeeById);

// ✅ Admin + Manager can update
router.put("/:id", authorizeRoles("admin", "manager"), updateEmployee);

// 🔥 Only Admin can delete (recommended safety)
router.delete("/:id", authorizeRoles("admin"), deleteEmployee);

module.exports = router;