export const requireAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== "admin") {
    return res.status(403).json({ status: false, message: "Admin access required" });
  }
  next();
};
