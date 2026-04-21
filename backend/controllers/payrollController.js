const Payroll    = require("../models/Payroll");
const Employee   = require("../models/Employee");
const Attendance = require("../models/Attendance");
const User       = require("../models/User");

const DEDUCTION_PER_ABSENT_DAY = 500;

// Helper — get manager's department name
const getManagerDeptName = async (userId) => {
  const user = await User.findById(userId).populate("department", "name");
  return user?.department?.name || null;
};

// Helper — get start and end Date objects for a YYYY-MM month string
const getMonthRange = (month) => {
  const [year, mon] = month.split("-").map(Number);
  const start = new Date(year, mon - 1, 1, 0, 0, 0, 0);
  const end   = new Date(year, mon, 0, 23, 59, 59, 999); // last day of month
  return { start, end };
};

// ================= GENERATE PAYROLL (Admin + Manager) =================
// Calculates and saves payroll for an employee for a given month
exports.generatePayroll = async (req, res) => {
  try {
    console.log("[PAYROLL] Generate Payroll API hit");
    console.log("[PAYROLL] Requested by:", req.user.id, "| role:", req.user.role);

    const { employeeId, month } = req.body;

    console.log("[PAYROLL] Incoming data:", { employeeId, month });

    // 🔹 Validate required fields
    if (!employeeId || !month) {
      console.log("[PAYROLL ERROR] Missing employeeId or month");
      return res.status(400).json({ msg: "employeeId and month are required" });
    }

    // 🔹 Validate month format
    if (!/^\d{4}-\d{2}$/.test(month)) {
      console.log("[PAYROLL ERROR] Invalid month format:", month);
      return res.status(400).json({ msg: "Month must be in YYYY-MM format" });
    }

    // 🔹 Verify employee exists
    const employee = await Employee.findById(employeeId).populate("user", "name email role");
    if (!employee) {
      console.log("[PAYROLL ERROR] Employee not found:", employeeId);
      return res.status(404).json({ msg: "Employee not found" });
    }

    console.log("[PAYROLL] Employee found:", employee.name, "| Base salary:", employee.salary);

    // 🔹 Manager can only generate payroll for employees in their department
    if (req.user.role === "manager") {
      const deptName = await getManagerDeptName(req.user.id);
      if (!deptName) {
        return res.status(403).json({ msg: "You are not assigned to any department. Contact admin." });
      }
      if (employee.department !== deptName) {
        console.log("[PAYROLL ERROR] Manager tried to generate payroll for employee in another dept");
        return res.status(403).json({ msg: `You can only generate payroll for employees in your department: ${deptName}` });
      }
    }

    // 🔹 Check if payroll already exists for this month
    const existing = await Payroll.findOne({ employee: employeeId, month });
    if (existing) {
      console.log("[PAYROLL ERROR] Payroll already exists for", employeeId, month);
      return res.status(400).json({ msg: `Payroll already exists for ${month}` });
    }

    // 🔹 Fetch attendance records for this employee in the given month
    const { start, end } = getMonthRange(month);
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: start, $lte: end },
    });

    console.log("[PAYROLL] Attendance records found:", attendanceRecords.length);

    // 🔹 Count absent days — "leave" status is NOT counted as absent (no deduction)
    const absentDays = attendanceRecords.filter((r) => r.status === "absent").length;
    console.log("[PAYROLL] Absent days (excluding leave):", absentDays);

    // 🔹 Calculate payroll
    const baseSalary = employee.salary;
    const deduction  = absentDays * DEDUCTION_PER_ABSENT_DAY;
    const netSalary  = baseSalary - deduction;

    console.log(`[PAYROLL] Calculation — base: ${baseSalary} | deduction: ${deduction} | net: ${netSalary}`);

    // 🔥 Save payroll record
    const payroll = await Payroll.create({
      employee:    employeeId,
      user:        employee.user._id,
      month,
      baseSalary,
      absentDays,
      deduction,
      netSalary,
      generatedBy: req.user.id,
    });

    console.log(`[PAYROLL SUCCESS] Generated for employee ${employeeId} by ${req.user.id}`);

    res.status(201).json({
      msg: "Payroll generated successfully",
      payroll,
    });
  } catch (error) {
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      return res.status(400).json({ msg: "Payroll already exists for this month" });
    }
    console.error("[PAYROLL ERROR] Generate failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET MY PAYROLL (Employee only) =================
// Returns payroll records for the logged-in employee
exports.getMyPayroll = async (req, res) => {
  try {
    console.log("[PAYROLL] Get My Payroll API hit");
    console.log("[PAYROLL] Employee user ID:", req.user.id);

    // 🔹 Find employee record linked to this user
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      console.log("[PAYROLL ERROR] No employee record for user:", req.user.id);
      return res.status(404).json({ msg: "Employee record not found" });
    }

    // 🔹 Build filter — optional month filter
    const filter = { employee: employee._id };
    if (req.query.month) {
      filter.month = req.query.month;
      console.log("[PAYROLL] Month filter applied:", req.query.month);
    }

    const records = await Payroll.find(filter)
      .populate("generatedBy", "name role")
      .sort({ month: -1 });

    console.log(`[PAYROLL SUCCESS] Employee ${employee._id} has ${records.length} payroll records`);

    res.json(records);
  } catch (error) {
    console.error("[PAYROLL ERROR] Get my payroll failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET TEAM PAYROLL (Manager only) =================
// Returns payroll records only for employees in the manager's department
exports.getTeamPayroll = async (req, res) => {
  try {
    console.log("[PAYROLL] Get Team Payroll API hit");
    console.log("[PAYROLL] Manager user ID:", req.user.id);

    // 🔹 Get manager's department
    const deptName = await getManagerDeptName(req.user.id);
    if (!deptName) {
      console.log("[PAYROLL] Manager has no department — returning empty");
      return res.json([]);
    }

    // 🔹 Find employees in this department
    const deptEmployees = await Employee.find({ department: deptName }, "_id");
    const deptEmployeeIds = deptEmployees.map((e) => e._id);

    const filter = { employee: { $in: deptEmployeeIds } };
    if (req.query.month)      filter.month    = req.query.month;
    if (req.query.employeeId) {
      if (!deptEmployeeIds.some((id) => id.toString() === req.query.employeeId)) {
        return res.status(403).json({ msg: "That employee is not in your department" });
      }
      filter.employee = req.query.employeeId;
    }

    console.log("[PAYROLL] Dept filter:", deptName, "| Filters:", filter);

    const records = await Payroll.find(filter)
      .populate("employee", "name email department designation")
      .populate("generatedBy", "name role")
      .sort({ month: -1 });

    console.log(`[PAYROLL SUCCESS] Manager ${req.user.id} fetched ${records.length} dept payroll records`);

    res.json(records);
  } catch (error) {
    console.error("[PAYROLL ERROR] Get team payroll failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET ALL PAYROLL (Admin only) =================
// Returns all payroll records with filters and pagination
exports.getAllPayroll = async (req, res) => {
  try {
    console.log("[PAYROLL] Get All Payroll API hit (Admin)");

    const { month, employeeId, page = 1, limit = 20 } = req.query;

    // 🔹 Build dynamic filter
    const filter = {};
    if (month)      filter.month    = month;
    if (employeeId) filter.employee = employeeId;

    console.log("[PAYROLL] Filters applied:", filter);
    console.log("[PAYROLL] Pagination — page:", page, "| limit:", limit);

    // 🔹 Pagination
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Payroll.countDocuments(filter);

    const records = await Payroll.find(filter)
      .populate("employee", "name email department designation")
      .populate("user", "name email role")
      .populate("generatedBy", "name role")
      .sort({ month: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log(`[PAYROLL SUCCESS] Admin fetched ${records.length} records (total: ${total})`);

    res.json({
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      records,
    });
  } catch (error) {
    console.error("[PAYROLL ERROR] Get all payroll failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

