import { AdminModel } from "../auth/model.js";

const toSafe = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

export const listAdmins = async (req, res) => {
  try {
    const admins = await AdminModel.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      status: true,
      data: admins.map(toSafe),
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Failed to fetch admins" });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ status: false, message: "All fields are required" });
    }
    const r = String(role).toLowerCase();
    if (r !== "admin" && r !== "staff") {
      return res.status(400).json({ status: false, message: "Role must be admin or staff" });
    }
    const exists = await AdminModel.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ status: false, message: "Email already exists" });
    }
    const created = await AdminModel.create({ name, email, password, role: r });
    return res.status(201).json({ status: true, data: toSafe(created) });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Failed to create admin" });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await AdminModel.findById(id);
    if (!admin) return res.status(404).json({ status: false, message: "Admin not found" });
    const me = String(req.admin?.id || "");
    if (me && String(admin._id) === me) {
      return res.status(400).json({ status: false, message: "Cannot delete your own account" });
    }
    await admin.deleteOne();
    return res.status(200).json({ status: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ status: false, message: "Failed to delete admin" });
  }
};
