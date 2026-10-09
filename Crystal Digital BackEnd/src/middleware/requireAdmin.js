// Role gate on top of authMiddleware: a valid staff token passes the JWT check,
// but only role === "admin" gets through this one. Currently mounted on
// /admin/users only — see admin/route.js.
export const requireAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== "admin") {
    return res.status(403).json({ status: false, message: "Admin access required" });
  }
  next();
};
