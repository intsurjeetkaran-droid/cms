const mongoose = require("mongoose");

// Define user schema
const userSchema = new mongoose.Schema(
  {
    // User full name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Unique email for login
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    // Hashed password
    password: {
      type: String,
      required: true,
    },

    // Role-based access control
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },

    // 🔗 Department reference — required for managers
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

// Export model
module.exports = mongoose.model("User", userSchema);