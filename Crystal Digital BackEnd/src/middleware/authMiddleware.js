import jwt from "jsonwebtoken";
import { AdminModel } from "../admin/auth/model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ status: false, message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const admin = await AdminModel.findById(decoded.id);
    if (!admin) {
      return res
        .status(401)
        .json({ status: false, message: "Admin not found" });
    }

    req.admin = { id: admin._id, email: admin.email, role: admin.role };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ status: false, message: "Invalid or expired token" });
  }
};
