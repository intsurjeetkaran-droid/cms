const express = require("express");
const router  = express.Router();

const {
  checkIn,
  checkOut,
  getMyAttendance,
  getTeamAttendance,
  getAllAttendance,
  markAbsent,
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// 🔐 Protect all attendance routes
router.use(authMiddleware);

// ================= ROUTES =================

// ✅ Admin — view all attendance (filters + pagination)
router.get("/", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] GET /api/attendance (admin)");
  next();
}, getAllAttendance);

// ✅ Admin — manually mark absent for a date
router.post("/mark-absent", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] POST /api/attendance/mark-absent (admin)");
  next();
}, markAbsent);

// ✅ Manager — view team attendance
router.get("/team", authorizeRoles("manager"), (req, res, next) => {
  console.log("[ROUTE] GET /api/attendance/team (manager)");
  next();
}, getTeamAttendance);

// ✅ Employee — check in
router.post("/check-in", authorizeRoles("employee"), (req, res, next) => {
  console.log("[ROUTE] POST /api/attendance/check-in (employee)");
  next();
}, checkIn);

// ✅ Employee — check out
router.post("/check-out", authorizeRoles("employee"), (req, res, next) => {
  console.log("[ROUTE] POST /api/attendance/check-out (employee)");
  next();
}, checkOut);

// ✅ Employee — view own attendance history
router.get("/my", authorizeRoles("employee"), (req, res, next) => {
  console.log("[ROUTE] GET /api/attendance/my (employee)");
  next();
}, getMyAttendance);

module.exports = router;
