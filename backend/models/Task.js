const mongoose = require("mongoose");

// ================= TASK SCHEMA =================
const taskSchema = new mongoose.Schema(
  {
    // Task title — required, short summary
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    // Optional detailed description of the task
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // 🔗 Employee this task is assigned to (one task → one employee)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Task must be assigned to an employee"],
    },

    // 🔗 Manager (User) who created/assigned this task
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must have an assigning manager"],
    },

    // Task status — employee can toggle between pending and done
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },

    // Optional deadline for the task
    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Task", taskSchema);
