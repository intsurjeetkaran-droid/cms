const mongoose = require("mongoose");

// ================= ATTENDANCE SCHEMA =================
const attendanceSchema = new mongoose.Schema(
  {
    // 🔗 Employee whose attendance this record belongs to
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee reference is required"],
    },

    // 🔗 User account linked to the employee (for role-based queries)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    // Date of attendance — stored as date-only (no time component)
    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    // Time employee checked in
    checkIn: {
      type: Date,
      default: null,
    },

    // Time employee checked out
    checkOut: {
      type: Date,
      default: null,
    },

    // Auto-calculated status based on check-in time
    // present → checked in (any time)
    // absent  → no check-in recorded
    // leave   → approved leave for this day
    status: {
      type: String,
      enum: ["present", "absent", "leave"],
      default: "absent",
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 Compound unique index — one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
