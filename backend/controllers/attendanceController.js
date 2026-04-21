const Attendance = require("../models/Attendance");
const Employee   = require("../models/Employee");
const User       = require("../models/User");

// Helper — get manager's department name
const getManagerDeptName = async (userId) => {
  const user = await User.findById(userId).populate("department", "name");
  return user?.department?.name || null;
};

// Helper — returns start and end of today (midnight to midnight)
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Helper — returns start/end for a given date string (YYYY-MM-DD)
const getDateRange = (dateStr) => {
  const start = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(dateStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ================= CHECK IN (Employee only) =================
// Creates today's attendance record and sets checkIn time
// Status: always "present" when checked in
exports.checkIn = async (req, res) => {
  try {
    console.log("[ATTENDANCE] Check-in API hit");
    console.log("[ATTENDANCE] Employee user ID:", req.user.id);

    // 🔹 Find employee record linked to this user
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      console.log("[ATTENDANCE ERROR] No employee record for user:", req.user.id);
      return res.status(404).json({ msg: "Employee record not found" });
    }

    const { start, end } = getTodayRange();

    // 🔹 Check if already checked in today
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    if (existing) {
      console.log("[ATTENDANCE ERROR] Already checked in today:", employee._id);
      return res.status(400).json({ msg: "Already checked in for today" });
    }

    const now = new Date();

    // 🔥 Create attendance record — status is always "present" when checked in
    const attendance = await Attendance.create({
      employee: employee._id,
      user:     req.user.id,
      date:     start,
      checkIn:  now,
      status:   "present",
    });

    console.log(`[ATTENDANCE] Employee ${employee._id} checked in at ${now.toTimeString()} — status: present`);

    res.status(201).json({
      msg: "Checked in successfully",
      attendance,
    });
  } catch (error) {
    console.error("[ATTENDANCE ERROR] Check-in failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= CHECK OUT (Employee only) =================
// Updates today's attendance record with checkOut time
exports.checkOut = async (req, res) => {
  try {
    console.log("[ATTENDANCE] Check-out API hit");
    console.log("[ATTENDANCE] Employee user ID:", req.user.id);

    // 🔹 Find employee record
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      console.log("[ATTENDANCE ERROR] No employee record for user:", req.user.id);
      return res.status(404).json({ msg: "Employee record not found" });
    }

    const { start, end } = getTodayRange();

    // 🔹 Find today's attendance record
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: { $gte: start, $lte: end },
    });

    if (!attendance) {
      console.log("[ATTENDANCE ERROR] No check-in found for today:", employee._id);
      return res.status(400).json({ msg: "You have not checked in today" });
    }

    // 🔹 Prevent double check-out
    if (attendance.checkOut) {
      console.log("[ATTENDANCE ERROR] Already checked out today:", employee._id);
      return res.status(400).json({ msg: "Already checked out for today" });
    }

    const now = new Date();

    // 🔥 Update checkOut time
    attendance.checkOut = now;
    await attendance.save();

    // Calculate working hours
    const hours = ((now - attendance.checkIn) / (1000 * 60 * 60)).toFixed(2);

    console.log(`[ATTENDANCE] Employee ${employee._id} checked out at ${now.toTimeString()} — worked ${hours}h`);

    res.json({
      msg: "Checked out successfully",
      attendance,
      workedHours: hours,
    });
  } catch (error) {
    console.error("[ATTENDANCE ERROR] Check-out failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET MY ATTENDANCE (Employee only) =================
// Returns all attendance records for the logged-in employee
exports.getMyAttendance = async (req, res) => {
  try {
    console.log("[ATTENDANCE] Get My Attendance API hit");
    console.log("[ATTENDANCE] Employee user ID:", req.user.id);

    // 🔹 Find employee record
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      console.log("[ATTENDANCE ERROR] No employee record for user:", req.user.id);
      return res.status(404).json({ msg: "Employee record not found" });
    }

    // 🔹 Build filter — optional date filter
    const filter = { employee: employee._id };
    if (req.query.date) {
      const { start, end } = getDateRange(req.query.date);
      filter.date = { $gte: start, $lte: end };
      console.log("[ATTENDANCE] Date filter applied:", req.query.date);
    }

    const records = await Attendance.find(filter).sort({ date: -1 });

    console.log(`[ATTENDANCE SUCCESS] Employee ${employee._id} has ${records.length} records`);

    res.json(records);
  } catch (error) {
    console.error("[ATTENDANCE ERROR] Get my attendance failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET TEAM ATTENDANCE (Manager only) =================
// Returns attendance records only for employees in the manager's department
exports.getTeamAttendance = async (req, res) => {
  try {
    console.log("[ATTENDANCE] Get Team Attendance API hit");
    console.log("[ATTENDANCE] Manager user ID:", req.user.id);

    // 🔹 Get manager's department
    const deptName = await getManagerDeptName(req.user.id);
    if (!deptName) {
      console.log("[ATTENDANCE] Manager has no department — returning empty");
      return res.json([]);
    }
    console.log("[ATTENDANCE] Manager dept filter:", deptName);

    // 🔹 Find all employees in this department
    const deptEmployees = await Employee.find({ department: deptName }, "_id");
    const deptEmployeeIds = deptEmployees.map((e) => e._id);

    // 🔹 Build filter — only this department's employees
    const filter = { employee: { $in: deptEmployeeIds } };

    if (req.query.employeeId) {
      // Validate the requested employee is in this dept
      if (!deptEmployeeIds.some((id) => id.toString() === req.query.employeeId)) {
        return res.status(403).json({ msg: "That employee is not in your department" });
      }
      filter.employee = req.query.employeeId;
      console.log("[ATTENDANCE] Employee filter:", req.query.employeeId);
    }

    if (req.query.date) {
      const { start, end } = getDateRange(req.query.date);
      filter.date = { $gte: start, $lte: end };
      console.log("[ATTENDANCE] Date filter:", req.query.date);
    }

    const records = await Attendance.find(filter)
      .populate("employee", "name email department designation")
      .populate("user", "name email role")
      .sort({ date: -1 });

    console.log(`[ATTENDANCE SUCCESS] Manager ${req.user.id} fetched ${records.length} dept records`);

    res.json(records);
  } catch (error) {
    console.error("[ATTENDANCE ERROR] Get team attendance failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET ALL ATTENDANCE (Admin only) =================
// Returns all attendance records with filters and pagination
exports.getAllAttendance = async (req, res) => {
  try {
    console.log("[ATTENDANCE] Get All Attendance API hit (Admin)");

    const { date, status, page = 1, limit = 20 } = req.query;

    // 🔹 Build dynamic filter
    const filter = {};
    if (status) filter.status = status;
    if (date) {
      const { start, end } = getDateRange(date);
      filter.date = { $gte: start, $lte: end };
    }

    console.log("[ATTENDANCE] Filters applied:", filter);
    console.log("[ATTENDANCE] Pagination — page:", page, "| limit:", limit);

    // 🔹 Pagination
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Attendance.countDocuments(filter);

    const records = await Attendance.find(filter)
      .populate("employee", "name email department designation")
      .populate("user", "name email role")
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log(`[ATTENDANCE SUCCESS] Admin fetched ${records.length} records (total: ${total})`);

    res.json({
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      records,
    });
  } catch (error) {
    console.error("[ATTENDANCE ERROR] Get all attendance failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= MARK ABSENT (Admin — manual trigger) =================
// Marks all employees who have no check-in for a given date as absent
exports.markAbsent = async (req, res) => {
  try {
    console.log("[ATTENDANCE] Mark Absent API hit (Admin)");

    // Default to today if no date provided
    const targetDate = req.query.date ? new Date(req.query.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    console.log("[ATTENDANCE] Marking absent for date:", targetDate.toDateString());

    // 🔹 Get all employees
    const allEmployees = await Employee.find({}, "_id user");

    // 🔹 Get employees who already have a record for this date
    const existing = await Attendance.find({
      date: { $gte: targetDate, $lte: endDate },
    }).select("employee");

    const checkedInIds = existing.map((r) => r.employee.toString());

    // 🔹 Find employees with no record
    const absentEmployees = allEmployees.filter(
      (emp) => !checkedInIds.includes(emp._id.toString())
    );

    console.log(`[ATTENDANCE] ${absentEmployees.length} employees to mark absent`);

    // 🔥 Create absent records for each
    const absentRecords = await Promise.all(
      absentEmployees.map((emp) =>
        Attendance.create({
          employee: emp._id,
          user:     emp.user,
          date:     targetDate,
          status:   "absent",
        }).catch(() => null) // Skip if duplicate
      )
    );

    const created = absentRecords.filter(Boolean).length;
    console.log(`[ATTENDANCE SUCCESS] Marked ${created} employees as absent`);

    res.json({
      msg:     `Marked ${created} employees as absent`,
      date:    targetDate.toDateString(),
      created,
    });
  } catch (error) {
    console.error("[ATTENDANCE ERROR] Mark absent failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

