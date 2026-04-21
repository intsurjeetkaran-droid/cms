const Employee = require("../models/Employee");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Helper — get manager's department name from their User record
const getManagerDeptName = async (userId) => {
  const user = await User.findById(userId).populate("department", "name");
  return user?.department?.name || null;
};

// ================= CREATE EMPLOYEE =================
exports.createEmployee = async (req, res) => {
  try {
    console.log("[EMPLOYEE] Create Employee API hit");

    const {
      name,
      email,
      phone,
      department,
      designation,
      salary,
      role,
      password, // ✅ NEW
    } = req.body;

    console.log("[EMPLOYEE] Incoming Data:", {
      name,
      email,
      phone,
      department,
      designation,
      salary,
      role,
    });

    // 🔹 Validation
    if (
      !name ||
      !email ||
      !phone ||
      !designation ||
      !salary ||
      !password
    ) {
      console.log("[EMPLOYEE ERROR] Missing required fields");
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 🔹 Department required for employees, optional for managers (assigned later)
    if (req.user.role !== "admin" || (req.user.role === "admin" && role !== "manager")) {
      if (!department) {
        console.log("[EMPLOYEE ERROR] Department required for employees");
        return res.status(400).json({ msg: "Department is required" });
      }
    }

    // 🔹 Password validation
    if (password.length < 6) {
      console.log("[EMPLOYEE ERROR] Weak password");
      return res.status(400).json({ msg: "Password must be at least 6 characters" });
    }

    // 🔹 Salary validation — minimum $20,000
    if (Number(salary) < 20000) {
      console.log("[EMPLOYEE ERROR] Salary below minimum:", salary);
      return res.status(400).json({ msg: "Salary must be at least $20,000" });
    }

    // 🔹 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[EMPLOYEE ERROR] User already exists");
      return res.status(400).json({ msg: "User already exists" });
    }

    // 🔐 Decide role safely
    let userRole = "employee";

    if (req.user.role === "admin") {
      if (role && ["employee", "manager"].includes(role)) {
        userRole = role;
      }
    } else if (req.user.role === "manager") {
      userRole = "employee";

      // 🔹 Manager can only create employees in their own department
      const managerUser = await User.findById(req.user.id).populate("department", "name");
      if (!managerUser?.department) {
        console.log("[EMPLOYEE ERROR] Manager has no department assigned:", req.user.id);
        return res.status(403).json({ msg: "You are not assigned to any department. Contact admin." });
      }

      const managerDeptName = managerUser.department.name;
      if (department !== managerDeptName) {
        console.log("[EMPLOYEE ERROR] Manager tried to create employee in wrong dept:", department, "| allowed:", managerDeptName);
        return res.status(403).json({ msg: `You can only add employees to your department: ${managerDeptName}` });
      }

      console.log("[EMPLOYEE] Manager department verified:", managerDeptName);
    }

    console.log("[EMPLOYEE] Assigned Role:", userRole);

    // 🔹 Hash password
    console.log("[EMPLOYEE] Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("[EMPLOYEE] Creating user account...");

    // 🔥 Create User
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    console.log("[EMPLOYEE SUCCESS] User created:", user._id);

    // 🔥 Create Employee
    const employee = await Employee.create({
      name,
      email,
      phone,
      department: department || "",
      designation,
      salary,
      user:      user._id,
      createdBy: req.user.id,
    });

    console.log("[EMPLOYEE SUCCESS] Employee created:", employee._id);

    res.status(201).json({
      msg: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("[EMPLOYEE ERROR] Create failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET ALL EMPLOYEES =================
exports.getEmployees = async (req, res) => {
  try {
    console.log("[EMPLOYEE] Get All Employees API hit");

    let filter = {};

    // 🔹 Manager sees only employees in their own department
    if (req.user.role === "manager") {
      const deptName = await getManagerDeptName(req.user.id);
      if (!deptName) {
        console.log("[EMPLOYEE] Manager has no department — returning empty");
        return res.json([]);
      }
      filter.department = deptName;
      console.log("[EMPLOYEE] Manager dept filter:", deptName);
    }

    const employees = await Employee.find(filter)
      .populate("user", "name email role")
      .populate("createdBy", "name role");

    console.log(`[EMPLOYEE SUCCESS] Found ${employees.length} employees`);

    res.json(employees);
  } catch (error) {
    console.error("[EMPLOYEE ERROR] Fetch failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET EMPLOYEE BY ID =================
exports.getEmployeeById = async (req, res) => {
  try {
    console.log("[EMPLOYEE] Get Employee By ID API hit");

    const { id } = req.params;

    console.log("[EMPLOYEE] Fetching ID:", id);

    const employee = await Employee.findById(id).populate(
      "user",
      "name email role"
    );

    if (!employee) {
      console.log("[EMPLOYEE ERROR] Employee not found");
      return res.status(404).json({ msg: "Employee not found" });
    }

    console.log("[EMPLOYEE SUCCESS] Employee found:", employee._id);

    res.json(employee);
  } catch (error) {
    console.error("[EMPLOYEE ERROR] Fetch by ID failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= UPDATE EMPLOYEE =================
exports.updateEmployee = async (req, res) => {
  try {
    console.log("[EMPLOYEE] Update Employee API hit");

    const { id } = req.params;

    console.log("[EMPLOYEE] Updating ID:", id);

    // 🔹 Manager can only update employees in their own department
    if (req.user.role === "manager") {
      const deptName = await getManagerDeptName(req.user.id);
      const emp = await Employee.findById(id);
      if (!emp) return res.status(404).json({ msg: "Employee not found" });
      if (emp.department !== deptName) {
        console.log("[EMPLOYEE ERROR] Manager tried to update employee from another dept");
        return res.status(403).json({ msg: "You can only update employees in your department" });
      }
    }

    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      department: req.body.department,
      designation: req.body.designation,
      salary: req.body.salary,
    };

    // 🔹 Salary validation on update
    if (updates.salary && Number(updates.salary) < 20000) {
      console.log("[EMPLOYEE ERROR] Salary below minimum on update:", updates.salary);
      return res.status(400).json({ msg: "Salary must be at least $20,000" });
    }

    console.log("[EMPLOYEE] Update Data:", updates);

    const employee = await Employee.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      console.log("[EMPLOYEE ERROR] Employee not found");
      return res.status(404).json({ msg: "Employee not found" });
    }

    console.log("[EMPLOYEE SUCCESS] Employee updated:", employee._id);

    res.json(employee);
  } catch (error) {
    console.error("[EMPLOYEE ERROR] Update failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= DELETE EMPLOYEE =================
exports.deleteEmployee = async (req, res) => {
  try {
    console.log("[EMPLOYEE] Delete Employee API hit");

    const { id } = req.params;

    console.log("[EMPLOYEE] Deleting ID:", id);

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      console.log("[EMPLOYEE ERROR] Employee not found");
      return res.status(404).json({ msg: "Employee not found" });
    }

    console.log("[EMPLOYEE SUCCESS] Employee deleted:", employee._id);

    res.json({ msg: "Employee deleted successfully" });
  } catch (error) {
    console.error("[EMPLOYEE ERROR] Delete failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET MY PROFILE (logged-in employee) =================
exports.getMyProfile = async (req, res) => {
  try {
    console.log("[EMPLOYEE] Get My Profile hit for user:", req.user.id);

    // Find employee record linked to the logged-in user
    const employee = await Employee.findOne({ user: req.user.id }).populate(
      "user",
      "name email role"
    );

    if (!employee) {
      console.log("[EMPLOYEE] No employee record found for user:", req.user.id);
      return res.status(404).json({ msg: "Employee record not found" });
    }

    console.log("[EMPLOYEE SUCCESS] Profile fetched:", employee._id);
    res.json(employee);
  } catch (error) {
    console.error("[EMPLOYEE ERROR] Get profile failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

