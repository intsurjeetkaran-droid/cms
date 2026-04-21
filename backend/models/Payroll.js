const mongoose = require("mongoose");

// ================= PAYROLL SCHEMA =================
const payrollSchema = new mongoose.Schema(
  {
    // 🔗 Employee this payroll record belongs to
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee reference is required"],
    },

    // 🔗 User account linked to the employee
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    // Payroll month in YYYY-MM format (e.g. "2026-04")
    month: {
      type: String,
      required: [true, "Month is required"],
      match: [/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"],
    },

    // Base salary pulled from Employee record at time of generation
    baseSalary: {
      type: Number,
      required: [true, "Base salary is required"],
    },

    // Number of absent days in the month (from Attendance records)
    absentDays: {
      type: Number,
      required: true,
      default: 0,
    },

    // Total deduction = absentDays × 500
    deduction: {
      type: Number,
      required: true,
      default: 0,
    },

    // Final net salary = baseSalary - deduction
    netSalary: {
      type: Number,
      required: true,
    },

    // 🔗 Admin or Manager who generated this payroll
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Unique index — one payroll per employee per month
payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
