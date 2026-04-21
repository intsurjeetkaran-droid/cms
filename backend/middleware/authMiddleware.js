const jwt = require("jsonwebtoken");

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  try {
    console.log("[AUTH] Middleware triggered");

    const authHeader = req.header("Authorization");

    // 🔹 Check header exists
    if (!authHeader) {
      console.log("[AUTH ERROR] No token provided");
      return res.status(401).json({ msg: "No token, access denied" });
    }

    // 🔹 Check Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      console.log("[AUTH ERROR] Invalid token format");
      return res.status(401).json({ msg: "Invalid token format" });
    }

    // 🔹 Extract actual token
    const token = authHeader.split(" ")[1];

    console.log("[AUTH] Token extracted:", token.substring(0, 15) + "...");

    // 🔹 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("[AUTH SUCCESS] Token verified:", decoded);

    // 🔥 Attach user to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("[AUTH ERROR] Invalid token:", error.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleware;