const express = require("express");
const router = express.Router();

// Import controller
const { register, login } = require("../controllers/authController");

// Register route
router.post("/register", (req, res, next) => {
  console.log("[ROUTE] POST /api/auth/register");
  next();
}, register);

// Login route
router.post("/login", (req, res, next) => {
  console.log("[ROUTE] POST /api/auth/login");
  next();
}, login);

module.exports = router;