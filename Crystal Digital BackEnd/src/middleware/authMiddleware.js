import jwt from "jsonwebtoken";
import { AdminModel } from "../admin/auth/model.js";

// Verifies the `Authorization: Bearer <jwt>` header, loads the admin it was
// issued to and puts a plain object on req.admin. Every failure answers 401 —
// an expired or tampered token is indistinguishable from no token, and a
// subscriber link token fails here too because its payload carries no `id`.
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
