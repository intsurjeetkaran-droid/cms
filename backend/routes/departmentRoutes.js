const express = require("express");
const router  = express.Router();

const {
  createDepartment,
  getAllDepartments,
  getDepartmentsPublic,
  assignManager,
  removeManager,
  getMyDepartment,
} = require("../controllers/departmentController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// 🔐 Protect all department routes
router.use(authMiddleware);

// ================= ROUTES =================

// ✅ All logged-in users — get departments for dropdowns
router.get("/public", (req, res, next) => {
  console.log("[ROUTE] GET /api/departments/public");
  next();
}, getDepartmentsPublic);

// ✅ Manager — get their own assigned department
router.get("/my", authorizeRoles("manager"), (req, res, next) => {
  console.log("[ROUTE] GET /api/departments/my (manager)");
  next();
}, getMyDepartment);

// ✅ Admin — get all departments with manager details
router.get("/", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] GET /api/departments (admin)");
  next();
}, getAllDepartments);

// ✅ Admin — create a new department
router.post("/", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] POST /api/departments (admin)");
  next();
}, createDepartment);

// ✅ Admin — assign manager to department
router.post("/assign-manager", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] POST /api/departments/assign-manager (admin)");
  next();
}, assignManager);

// ✅ Admin — remove manager from department
router.delete("/:departmentId/manager", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] DELETE /api/departments/:id/manager (admin)");
  next();
}, removeManager);

module.exports = router;
