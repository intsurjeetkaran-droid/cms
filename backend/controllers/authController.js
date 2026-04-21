const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    console.log("[AUTH] Register API hit");

    // ✅ include role
    const { name, email, password, role } = req.body;

    console.log("[AUTH] Incoming data:", { name, email, role });

    // 🔹 Validate required fields
    if (!name || !email || !password) {
      console.log("[AUTH ERROR] Missing required fields");
      return res.status(400).json({ msg: "Name, email, and password are required" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log("[AUTH ERROR] User already exists");
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    console.log("[AUTH] Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save role
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "employee", // default
    });

    console.log("[AUTH SUCCESS] User registered:", user._id);
    console.log("[AUTH] Role assigned:", user.role);

    // ✅ Include role in token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

 const { password: _, ...safeUser } = user.toObject();

    res.json({
      msg: "User registered successfully",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("[AUTH ERROR] Register failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    console.log("[AUTH] Login API hit");

    const { email, password } = req.body;

    console.log("[AUTH] Login attempt for:", email);

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("[AUTH ERROR] User not found");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Compare password
    console.log("[AUTH] Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("[AUTH ERROR] Password mismatch");
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // ✅ Include role in token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    console.log("[AUTH SUCCESS] Login successful:", user._id);
    console.log("[AUTH] User role:", user.role);

    const { password: _, ...safeUser } = user.toObject();

    res.json({
      msg: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("[AUTH ERROR] Login failed:", error.message);
    res.status(500).json({ msg: "Something went wrong. Please try again." });
  }
};
