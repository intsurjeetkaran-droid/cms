const express = require("express");
const router  = express.Router();

const {
  createTask,
  getManagerTasks,
  getMyTasks,
  updateTaskStatus,
  getAllTasks,
} = require("../controllers/taskController");

const authMiddleware  = require("../middleware/authMiddleware");
const authorizeRoles  = require("../middleware/roleMiddleware");

// 🔐 Protect all task routes
router.use(authMiddleware);

// ================= ROUTES =================

// ✅ Admin — view all tasks (with filters + pagination)
router.get("/", authorizeRoles("admin"), (req, res, next) => {
  console.log("[ROUTE] GET /api/tasks (admin)");
  next();
}, getAllTasks);

// ✅ Manager — create a task and assign to employee
router.post("/", authorizeRoles("manager"), (req, res, next) => {
  console.log("[ROUTE] POST /api/tasks (manager)");
  next();
}, createTask);

// ✅ Manager — get tasks created by them
router.get("/manager", authorizeRoles("manager"), (req, res, next) => {
  console.log("[ROUTE] GET /api/tasks/manager");
  next();
}, getManagerTasks);

// ✅ Employee — get tasks assigned to them
router.get("/my", authorizeRoles("employee"), (req, res, next) => {
  console.log("[ROUTE] GET /api/tasks/my");
  next();
}, getMyTasks);

// ✅ Employee — update task status (pending ↔ done)
router.put("/:id", authorizeRoles("employee"), (req, res, next) => {
  console.log("[ROUTE] PUT /api/tasks/:id (employee)");
  next();
}, updateTaskStatus);

module.exports = router;
