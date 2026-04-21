const Department = require("../models/Department");
const User       = require("../models/User");

// ================= CREATE DEPARTMENT (Admin only) =================
// Creates a new department with no manager assigned initially
exports.createDepartment = async (req, res) => {
  try {
    console.log("[DEPARTMENT] Create Department API hit");
    console.log("[DEPARTMENT] Admin ID:", req.user.id);

    const { name } = req.body;

    if (!name || !name.trim()) {
      console.log("[DEPARTMENT ERROR] Name is required");
      return res.status(400).json({ msg: "Department name is required" });
    }

    // 🔹 Check if department already exists
    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      console.log("[DEPARTMENT ERROR] Department already exists:", name);
      return res.status(400).json({ msg: "Department already exists" });
    }

    // 🔥 Create department — manager is null until assigned
    const department = await Department.create({ name: name.trim() });

    console.log("[DEPARTMENT] Created:", department.name, "| ID:", department._id);

    res.status(201).json({
      msg: "Department created successfully",
      department,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Department already exists" });
    }
    console.error("[DEPARTMENT ERROR] Create failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET ALL DEPARTMENTS (Admin) =================
// Returns all departments with manager details populated
exports.getAllDepartments = async (req, res) => {
  try {
    console.log("[DEPARTMENT] Get All Departments API hit");

    const departments = await Department.find()
      .populate("manager", "name email role")
      .sort({ name: 1 });

    console.log(`[DEPARTMENT SUCCESS] Found ${departments.length} departments`);

    res.json(departments);
  } catch (error) {
    console.error("[DEPARTMENT ERROR] Fetch failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET ALL DEPARTMENTS (Public — for dropdowns) =================
// Returns all departments — accessible by any logged-in user for form dropdowns
exports.getDepartmentsPublic = async (req, res) => {
  try {
    console.log("[DEPARTMENT] Get Departments (public) API hit");

    const departments = await Department.find({}, "name manager")
      .populate("manager", "name")
      .sort({ name: 1 });

    console.log(`[DEPARTMENT SUCCESS] Returning ${departments.length} departments for dropdown`);

    res.json(departments);
  } catch (error) {
    console.error("[DEPARTMENT ERROR] Fetch public failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= ASSIGN MANAGER (Admin only) =================
// Assigns a manager user to a department
// Rules: one manager per department, manager must have role = "manager"
exports.assignManager = async (req, res) => {
  try {
    console.log("[DEPARTMENT] Assign Manager API hit");
    console.log("[DEPARTMENT] Admin ID:", req.user.id);

    const { managerId, departmentId } = req.body;

    console.log("[DEPARTMENT] Assigning manager:", managerId, "to dept:", departmentId);

    // 🔹 Validate required fields
    if (!managerId || !departmentId) {
      console.log("[DEPARTMENT ERROR] Missing managerId or departmentId");
      return res.status(400).json({ msg: "managerId and departmentId are required" });
    }

    // 🔹 Check department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      console.log("[DEPARTMENT ERROR] Department not found:", departmentId);
      return res.status(404).json({ msg: "Department not found" });
    }

    // 🔹 Check department already has a manager
    if (department.manager) {
      console.log("[DEPARTMENT ERROR] Department already has a manager:", department.name);
      return res.status(400).json({ msg: "This department already has a manager" });
    }

    // 🔹 Check manager user exists and has role = "manager"
    const managerUser = await User.findById(managerId);
    if (!managerUser) {
      console.log("[DEPARTMENT ERROR] Manager user not found:", managerId);
      return res.status(404).json({ msg: "Manager user not found" });
    }

    if (managerUser.role !== "manager") {
      console.log("[DEPARTMENT ERROR] User is not a manager:", managerUser.role);
      return res.status(400).json({ msg: "Selected user does not have manager role" });
    }

    // 🔹 Check this manager is not already assigned to another department
    const alreadyAssigned = await Department.findOne({ manager: managerId });
    if (alreadyAssigned) {
      console.log("[DEPARTMENT ERROR] Manager already assigned to:", alreadyAssigned.name);
      return res.status(400).json({
        msg: `This manager is already assigned to ${alreadyAssigned.name} department`,
      });
    }

    // 🔥 Assign manager to department
    department.manager = managerId;
    await department.save();

    // 🔥 Update manager's department reference on User
    managerUser.department = departmentId;
    await managerUser.save();

    console.log("[DEPARTMENT] Manager assigned:", managerUser.name, "→", department.name);

    // Return populated result
    const updated = await Department.findById(departmentId).populate("manager", "name email role");

    res.json({
      msg: "Manager assigned successfully",
      department: updated,
    });
  } catch (error) {
    console.error("[DEPARTMENT ERROR] Assign manager failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= REMOVE MANAGER (Admin only) =================
// Unassigns the manager from a department
exports.removeManager = async (req, res) => {
  try {
    console.log("[DEPARTMENT] Remove Manager API hit");

    const { departmentId } = req.params;

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ msg: "Department not found" });
    }

    if (!department.manager) {
      return res.status(400).json({ msg: "Department has no manager assigned" });
    }

    // 🔹 Get manager name before clearing the reference
    const managerId = department.manager;

    // Clear department field on the manager's User record
    await User.findByIdAndUpdate(managerId, { $unset: { department: 1 } });

    department.manager = null;
    await department.save();

    console.log("[DEPARTMENT] Manager removed from:", department.name);

    res.json({ msg: `Manager removed from ${department.name}` });
  } catch (error) {
    console.error("[DEPARTMENT ERROR] Remove manager failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};


// ================= GET MY DEPARTMENT (Manager only) =================
// Returns the department the logged-in manager is assigned to
exports.getMyDepartment = async (req, res) => {
  try {
    console.log("[DEPARTMENT] Get My Department hit for manager:", req.user.id);

    const user = await require("../models/User")
      .findById(req.user.id)
      .populate("department", "name manager");

    if (!user?.department) {
      console.log("[DEPARTMENT] Manager has no department:", req.user.id);
      return res.status(404).json({ msg: "You are not assigned to any department" });
    }

    console.log("[DEPARTMENT SUCCESS] Manager department:", user.department.name);
    res.json(user.department);
  } catch (error) {
    console.error("[DEPARTMENT ERROR] Get my department failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};
