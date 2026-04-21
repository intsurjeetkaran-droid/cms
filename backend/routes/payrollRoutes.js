const express = require("express");
const router  = express.Router();

const {
  generatePayroll,
  getMyPayroll,
  getTeamPayroll,
  getAllPayroll,
} = require("../controllers/payrollController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// 🔐 Protect all payroll routes
router.use(authMiddleware);

// ================= ROUTES =================

// ✅ Admin — view all payroll (filters + pagination)
router.get("/", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] GET /api/payroll (admin)");
  next();
}, getAllPayroll);

// ✅ Admin + Manager — generate payroll for an employee
router.post("/generate", authorizeRoles("admin", "manager"), (req, res, next) => {
  console.log("[ROUTE] POST /api/payroll/generate");
  next();
}, generatePayroll);

// ✅ Manager — view team payroll
router.get("/team", authorizeRoles("manager"), (req, res, next) => {
  console.log("[ROUTE] GET /api/payroll/team (manager)");
  next();
}, getTeamPayroll);

// ✅ Employee — view own payroll
router.get("/my", authorizeRoles("employee"), (req, res, next) => {
  console.log("[ROUTE] GET /api/payroll/my (employee)");
  next();
}, getMyPayroll);

module.exports = router;
