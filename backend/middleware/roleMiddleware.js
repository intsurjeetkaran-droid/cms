const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("[ROLE] Checking access...");

    const userRole = req.user.role;

    console.log("[ROLE] User role:", userRole);
    console.log("[ROLE] Allowed roles:", allowedRoles);

    if (!allowedRoles.includes(userRole)) {
      console.log("[ROLE ERROR] Access denied");
      return res.status(403).json({ msg: "Access denied" });
    }

    next();
  };
};

module.exports = authorizeRoles;