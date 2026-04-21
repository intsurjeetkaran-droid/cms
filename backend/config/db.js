const mongoose = require("mongoose");

// Function to connect MongoDB
const connectDB = async () => {
  try {
    console.log("[DB] Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("[DB SUCCESS] MongoDB Connected Successfully");
  } catch (error) {
    console.error("[DB ERROR] Connection failed:", error.message);

    // Exit process if DB fails
    process.exit(1);
  }
};

module.exports = connectDB;