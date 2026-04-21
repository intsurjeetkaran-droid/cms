// Import required packages
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Import DB connection
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request body

// Debug log for server start
console.log("[SERVER] Express app initialized");

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/payroll", require("./routes/payrollRoutes"));
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));

// Root route (health check)
app.get("/", (req, res) => {
  console.log("[ROUTE] Root route accessed");
  res.send("API is running...");
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`[SERVER] Server running on port ${PORT}`);
});