const express = require("express");
const router  = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getTeamLeaves,
  getAllLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// 🔐 Protect all leave routes
router.use(authMiddleware);

// ================= ROUTES =================

// ✅ Admin — view all leave requests (filters + pagination)
router.get("/", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] GET /api/leaves (admin)");
  next();
}, getAllLeaves);

// ✅ Manager — view team (employee) leave requests
router.get("/team", authorizeRoles("manager"), (req, res, next) => {
  console.log("[ROUTE] GET /api/leaves/team (manager)");
  next();
}, getTeamLeaves);

// ✅ Employee + Manager — view own leave requests
router.get("/my", authorizeRoles("employee", "manager"), (req, res, next) => {
  console.log("[ROUTE] GET /api/leaves/my");
  next();
}, getMyLeaves);

// ✅ Employee + Manager — apply for leave
router.post("/", authorizeRoles("employee", "manager"), (req, res, next) => {
  console.log("[ROUTE] POST /api/leaves");
  next();
}, applyLeave);

// ✅ Manager + Admin — approve or reject a leave
router.put("/:id", authorizeRoles("manager", "admin"), (req, res, next) => {
  console.log("[ROUTE] PUT /api/leaves/:id");
  next();
}, updateLeaveStatus);

module.exports = router;
