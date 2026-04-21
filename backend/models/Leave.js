const mongoose = require("mongoose");

// ================= LEAVE SCHEMA =================
const leaveSchema = new mongoose.Schema(
  {
    // 🔗 User who applied for leave (employee or manager)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },

    // Role of the applicant at time of application
    role: {
      type: String,
      enum: ["employee", "manager"],
      required: true,
    },

    // Leave start date
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },

    // Leave end date (must be >= startDate)
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    // Total number of leave days = (endDate - startDate) / ms_per_day + 1
    totalDays: {
      type: Number,
      required: true,
      min: [1, "Total days must be at least 1"],
    },

    // Reason for leave
    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },

    // Current status of the leave request
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // 🔗 Admin or Manager who approved/rejected this leave
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Leave", leaveSchema);
