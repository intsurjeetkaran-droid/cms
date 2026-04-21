const Task     = require("../models/Task");
const Employee = require("../models/Employee");
const User     = require("../models/User");

// Helper — get manager's department name
const getManagerDeptName = async (userId) => {
  const user = await User.findById(userId).populate("department", "name");
  return user?.department?.name || null;
};

// ================= CREATE TASK (Manager only) =================
// Manager creates a task and assigns it to an employee
exports.createTask = async (req, res) => {
  try {
    console.log("[TASK] Create Task API hit");
    console.log("[TASK] Manager ID:", req.user.id);

    const { title, description, assignedTo, deadline } = req.body;

    console.log("[TASK] Incoming data:", { title, assignedTo, deadline });

    // 🔹 Validate required fields
    if (!title || !assignedTo) {
      console.log("[TASK ERROR] Missing required fields: title or assignedTo");
      return res.status(400).json({ msg: "Title and assignedTo are required" });
    }

    // 🔹 Verify the employee exists
    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      console.log("[TASK ERROR] Employee not found:", assignedTo);
      return res.status(404).json({ msg: "Employee not found" });
    }

    // 🔹 Manager can only assign tasks to employees in their own department
    const deptName = await getManagerDeptName(req.user.id);
    if (!deptName) {
      console.log("[TASK ERROR] Manager has no department:", req.user.id);
      return res.status(403).json({ msg: "You are not assigned to any department. Contact admin." });
    }
    if (employee.department !== deptName) {
      console.log("[TASK ERROR] Employee not in manager's dept:", employee.department, "vs", deptName);
      return res.status(403).json({ msg: `You can only assign tasks to employees in your department: ${deptName}` });
    }

    // 🔥 Create the task — assignedBy is the logged-in manager
    const task = await Task.create({
      title,
      description: description || "",
      assignedTo,
      assignedBy: req.user.id,
      deadline: deadline || null,
    });

    console.log(`[TASK SUCCESS] Manager ${req.user.id} created task "${title}" for employee ${assignedTo}`);

    res.status(201).json({
      msg: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("[TASK ERROR] Create task failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET MANAGER TASKS (Manager only) =================
// Returns all tasks created by the logged-in manager
exports.getManagerTasks = async (req, res) => {
  try {
    console.log("[TASK] Get Manager Tasks API hit");
    console.log("[TASK] Manager ID:", req.user.id);

    // Optional status filter from query params
    const filter = { assignedBy: req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
      console.log("[TASK] Status filter applied:", req.query.status);
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email department designation")
      .sort({ createdAt: -1 });

    console.log(`[TASK SUCCESS] Manager ${req.user.id} fetched ${tasks.length} tasks`);

    res.json(tasks);
  } catch (error) {
    console.error("[TASK ERROR] Get manager tasks failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET MY TASKS (Employee only) =================
// Returns all tasks assigned to the logged-in employee
exports.getMyTasks = async (req, res) => {
  try {
    console.log("[TASK] Get My Tasks API hit");
    console.log("[TASK] Employee user ID:", req.user.id);

    // Find the employee record linked to this user
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      console.log("[TASK ERROR] No employee record for user:", req.user.id);
      return res.status(404).json({ msg: "Employee record not found" });
    }

    console.log("[TASK] Employee record found:", employee._id);

    // Optional status filter
    const filter = { assignedTo: employee._id };
    if (req.query.status) {
      filter.status = req.query.status;
      console.log("[TASK] Status filter applied:", req.query.status);
    }

    const tasks = await Task.find(filter)
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });

    console.log(`[TASK SUCCESS] Employee ${employee._id} has ${tasks.length} tasks`);

    res.json(tasks);
  } catch (error) {
    console.error("[TASK ERROR] Get my tasks failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= UPDATE TASK STATUS (Employee only) =================
// Employee can only update the status field (pending ↔ done)
exports.updateTaskStatus = async (req, res) => {
  try {
    console.log("[TASK] Update Task Status API hit");

    const { id } = req.params;
    const { status } = req.body;

    console.log("[TASK] Task ID:", id, "| New status:", status);

    // 🔹 Validate status value — employee can only move pending → done, not back
    if (!status || status !== "done") {
      console.log("[TASK ERROR] Invalid status — employee can only mark as done:", status);
      return res.status(400).json({ msg: "You can only mark a task as done" });
    }

    // 🔹 Find the employee record for this user
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      console.log("[TASK ERROR] No employee record for user:", req.user.id);
      return res.status(404).json({ msg: "Employee record not found" });
    }

    // 🔹 Find the task and verify it belongs to this employee
    const task = await Task.findOne({ _id: id, assignedTo: employee._id });
    if (!task) {
      console.log("[TASK ERROR] Task not found or not assigned to this employee:", id);
      return res.status(404).json({ msg: "Task not found or access denied" });
    }

    // 🔹 Prevent reverting — once done, cannot go back to pending
    if (task.status === "done") {
      console.log("[TASK ERROR] Task already done, cannot revert:", id);
      return res.status(400).json({ msg: "Task is already completed and cannot be reverted" });
    }

    const oldStatus = task.status;

    // 🔥 Update only the status field
    task.status = status;
    await task.save();

    console.log(`[TASK SUCCESS] Employee ${employee._id} updated task ${id} status: ${oldStatus} → ${status}`);

    res.json({
      msg: "Task status updated successfully",
      task,
    });
  } catch (error) {
    console.error("[TASK ERROR] Update status failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET ALL TASKS (Admin only) =================
// Admin can view all tasks with optional filters + pagination + sorting
exports.getAllTasks = async (req, res) => {
  try {
    console.log("[TASK] Get All Tasks API hit (Admin)");

    const { status, assignedTo, assignedBy, page = 1, limit = 20, sort = "createdAt" } = req.query;

    // 🔹 Build dynamic filter object
    const filter = {};
    if (status)     filter.status     = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignedBy) filter.assignedBy = assignedBy;

    console.log("[TASK] Filters applied:", filter);
    console.log("[TASK] Pagination — page:", page, "| limit:", limit, "| sort:", sort);

    // 🔹 Pagination
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email department designation")
      .populate("assignedBy", "name email role")
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log(`[TASK SUCCESS] Admin fetched ${tasks.length} tasks (total: ${total})`);

    res.json({
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      tasks,
    });
  } catch (error) {
    console.error("[TASK ERROR] Get all tasks failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

