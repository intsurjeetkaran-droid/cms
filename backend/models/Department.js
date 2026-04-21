const mongoose = require("mongoose");

// ================= DEPARTMENT SCHEMA =================
const departmentSchema = new mongoose.Schema(
  {
    // Department name — must be unique across the company
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
    },

    // 🔗 Manager assigned to this department (one manager per department)
    // Null initially — assigned separately via assignManager API
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Department", departmentSchema);
