const Leave      = require("../models/Leave");
const Attendance = require("../models/Attendance");
const Employee   = require("../models/Employee");
const User       = require("../models/User");

const MAX_LEAVE_DAYS_PER_MONTH = 5;

// Helper — get manager's department name
const getManagerDeptName = async (userId) => {
  const user = await User.findById(userId).populate("department", "name");
  return user?.department?.name || null;
};

// Helper — get start of day for a Date
const dayStart = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const dayEnd   = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

// ================= APPLY LEAVE (Employee + Manager) =================
// Creates a leave request after validating dates, overlap, and monthly limit
exports.applyLeave = async (req, res) => {
  try {
    console.log("[LEAVE] Apply Leave API hit");
    console.log("[LEAVE] User ID:", req.user.id, "| Role:", req.user.role);

    // 🔹 Admin cannot apply for leave
    if (req.user.role === "admin") {
      console.log("[LEAVE ERROR] Admin cannot apply for leave");
      return res.status(403).json({ msg: "Admin cannot apply for leave" });
    }

    const { startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      console.log("[LEAVE ERROR] Missing required fields");
      return res.status(400).json({ msg: "startDate, endDate, and reason are required" });
    }

    const start = dayStart(new Date(startDate));
    const end   = dayStart(new Date(endDate));

    // 🔹 Validate date range
    if (end < start) {
      console.log("[LEAVE ERROR] endDate before startDate");
      return res.status(400).json({ msg: "End date must be on or after start date" });
    }

    // 🔹 Calculate total days
    const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    console.log("[LEAVE] Total days requested:", totalDays);

    // 🔹 Check monthly leave limit
    // Count approved + pending leaves in the same month as startDate
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
    const monthEnd   = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);

    const existingLeaves = await Leave.find({
      user:      req.user.id,
      status:    { $in: ["pending", "approved"] },
      startDate: { $gte: monthStart, $lte: monthEnd },
    });

    const usedDays = existingLeaves.reduce((sum, l) => sum + l.totalDays, 0);
    console.log("[LEAVE] Used days this month:", usedDays);

    if (usedDays + totalDays > MAX_LEAVE_DAYS_PER_MONTH) {
      console.log("[LEAVE ERROR] Monthly limit exceeded:", usedDays + totalDays);
      return res.status(400).json({
        msg: `You can only apply for ${MAX_LEAVE_DAYS_PER_MONTH} leave days per month. You have ${MAX_LEAVE_DAYS_PER_MONTH - usedDays} day(s) remaining.`,
      });
    }

    // 🔹 Check for overlapping leave requests
    const overlap = await Leave.findOne({
      user:   req.user.id,
      status: { $in: ["pending", "approved"] },
      $or: [
        { startDate: { $lte: end },   endDate: { $gte: start } },
      ],
    });

    if (overlap) {
      console.log("[LEAVE ERROR] Overlapping leave exists:", overlap._id);
      return res.status(400).json({ msg: "You already have a leave request for overlapping dates" });
    }

    // 🔥 Create leave request
    const leave = await Leave.create({
      user:      req.user.id,
      role:      req.user.role,
      startDate: start,
      endDate:   end,
      totalDays,
      reason,
    });

    console.log("[LEAVE] Leave applied:", req.user.id, "| Days:", totalDays);

    res.status(201).json({
      msg: "Leave request submitted successfully",
      leave,
    });
  } catch (error) {
    console.error("[LEAVE ERROR] Apply leave failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET MY LEAVES (Employee + Manager) =================
// Returns all leave requests for the logged-in user
exports.getMyLeaves = async (req, res) => {
  try {
    console.log("[LEAVE] Get My Leaves API hit");
    console.log("[LEAVE] User ID:", req.user.id);

    const filter = { user: req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
      console.log("[LEAVE] Status filter:", req.query.status);
    }

    const leaves = await Leave.find(filter)
      .populate("approvedBy", "name role")
      .sort({ createdAt: -1 });

    console.log(`[LEAVE SUCCESS] User ${req.user.id} has ${leaves.length} leave records`);

    res.json(leaves);
  } catch (error) {
    console.error("[LEAVE ERROR] Get my leaves failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET TEAM LEAVES (Manager only) =================
// Returns leave requests only from employees in the manager's department
exports.getTeamLeaves = async (req, res) => {
  try {
    console.log("[LEAVE] Get Team Leaves API hit");
    console.log("[LEAVE] Manager ID:", req.user.id);

    // 🔹 Get manager's department
    const deptName = await getManagerDeptName(req.user.id);
    if (!deptName) {
      console.log("[LEAVE] Manager has no department — returning empty");
      return res.json([]);
    }

    // 🔹 Find employees in this department
    const deptEmployees = await Employee.find({ department: deptName }, "user");
    const deptUserIds = deptEmployees.map((e) => e.user.toString());

    // 🔹 Filter: only employee-role leaves from this department's users
    const filter = { role: "employee", user: { $in: deptUserIds } };
    if (req.query.status) filter.status = req.query.status;

    console.log("[LEAVE] Dept filter:", deptName, "| Users:", deptUserIds.length);

    const leaves = await Leave.find(filter)
      .populate("user", "name email role")
      .populate("approvedBy", "name role")
      .sort({ createdAt: -1 });

    console.log(`[LEAVE SUCCESS] Manager ${req.user.id} fetched ${leaves.length} dept leave records`);

    res.json(leaves);
  } catch (error) {
    console.error("[LEAVE ERROR] Get team leaves failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= GET ALL LEAVES (Admin only) =================
// Returns all leave requests with optional filters
exports.getAllLeaves = async (req, res) => {
  try {
    console.log("[LEAVE] Get All Leaves API hit (Admin)");

    const { status, role, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (role)   filter.role   = role;

    console.log("[LEAVE] Filters:", filter);

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Leave.countDocuments(filter);

    const leaves = await Leave.find(filter)
      .populate("user", "name email role")
      .populate("approvedBy", "name role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log(`[LEAVE SUCCESS] Admin fetched ${leaves.length} records (total: ${total})`);

    res.json({
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      leaves,
    });
  } catch (error) {
    console.error("[LEAVE ERROR] Get all leaves failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= UPDATE LEAVE STATUS (Manager + Admin) =================
// Approve or reject a leave request
// Manager: can only approve/reject employee leaves
// Admin: can approve/reject all leaves
exports.updateLeaveStatus = async (req, res) => {
  try {
    console.log("[LEAVE] Update Leave Status API hit");
    console.log("[LEAVE] Approver:", req.user.id, "| Role:", req.user.role);

    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      console.log("[LEAVE ERROR] Invalid status:", status);
      return res.status(400).json({ msg: "Status must be 'approved' or 'rejected'" });
    }

    // 🔹 Find the leave request
    const leave = await Leave.findById(id);
    if (!leave) {
      console.log("[LEAVE ERROR] Leave not found:", id);
      return res.status(404).json({ msg: "Leave request not found" });
    }

    // 🔹 Prevent self-approval
    if (leave.user.toString() === req.user.id) {
      console.log("[LEAVE ERROR] Cannot approve own leave");
      return res.status(403).json({ msg: "You cannot approve your own leave request" });
    }

    // 🔹 Manager can only approve employee leaves (not other managers)
    if (req.user.role === "manager" && leave.role !== "employee") {
      console.log("[LEAVE ERROR] Manager cannot approve manager leave");
      return res.status(403).json({ msg: "Managers can only approve employee leave requests" });
    }

    // 🔹 Manager can only approve leaves from their own department
    if (req.user.role === "manager") {
      const deptName = await getManagerDeptName(req.user.id);
      if (deptName) {
        const emp = await Employee.findOne({ user: leave.user });
        if (emp && emp.department !== deptName) {
          console.log("[LEAVE ERROR] Manager tried to approve leave from another dept");
          return res.status(403).json({ msg: "You can only approve leaves from your department" });
        }
      }
    }

    // 🔹 Prevent re-processing already decided leaves
    if (leave.status !== "pending") {
      console.log("[LEAVE ERROR] Leave already processed:", leave.status);
      return res.status(400).json({ msg: `Leave is already ${leave.status}` });
    }

    const oldStatus = leave.status;

    // 🔥 Update leave status
    leave.status     = status;
    leave.approvedBy = req.user.id;
    await leave.save();

    console.log(`[LEAVE] Leave ${id} status: ${oldStatus} → ${status} by ${req.user.id}`);

    // 🔥 If approved — update attendance records for each leave day
    if (status === "approved") {
      await markLeaveAttendance(leave);
    }

    res.json({
      msg:   `Leave ${status} successfully`,
      leave,
    });
  } catch (error) {
    console.error("[LEAVE ERROR] Update status failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= HELPER: Mark Attendance as Leave =================
// For each day in the leave range, upsert attendance record with status = "leave"
// Approved leave days are NOT counted as absent → no payroll deduction
const markLeaveAttendance = async (leave) => {
  try {
    // Find employee record linked to this user
    const employee = await Employee.findOne({ user: leave.user });
    if (!employee) {
      console.log("[LEAVE] No employee record found for user:", leave.user);
      return;
    }

    const current = new Date(leave.startDate);
    const end     = new Date(leave.endDate);
    let   marked  = 0;

    while (current <= end) {
      const dateStart = dayStart(new Date(current));
      const dateEnd   = dayEnd(new Date(current));

      // Upsert: update if exists, create if not
      await Attendance.findOneAndUpdate(
        { employee: employee._id, date: { $gte: dateStart, $lte: dateEnd } },
        {
          employee: employee._id,
          user:     leave.user,
          date:     dateStart,
          status:   "leave",
          checkIn:  null,
          checkOut: null,
        },
        { upsert: true, new: true }
      );

      marked++;
      current.setDate(current.getDate() + 1);
    }

    console.log(`[LEAVE] Marked ${marked} attendance records as leave for employee ${employee._id}`);
  } catch (error) {
    console.error("[LEAVE ERROR] Mark attendance failed:", error.message);
  }
};

