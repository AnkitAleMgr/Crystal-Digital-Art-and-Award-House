import crypto from "crypto";
import { AdminModel } from "./model.js";

const safeUser = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
});

export const adminRegister = async (req, res) => {
  try {
    const { name, email, password, secret } = req.body;

    const registerSecret = process.env.ADMIN_REGISTER_SECRET;

    if (!registerSecret) {
      console.error("ADMIN_REGISTER_SECRET is not set. Registration is disabled.");
      return res.status(503).json({
        status: false,
        message: "Registration is disabled on this server",
      });
    }

    const provided = Buffer.from(String(secret || ""));
    const expected = Buffer.from(registerSecret);

    const secretOk =
      provided.length === expected.length &&
      crypto.timingSafeEqual(provided, expected);

    if (!secretOk) {
      return res.status(401).json({
        status: false,
        message: "Invalid registration secret",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email and password are required",
      });
    }

    const isEmail = await AdminModel.findOne({
      email: email.toLowerCase(),
    });

    if (isEmail) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    const newUser = await AdminModel.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      status: true,
      message: "Admin registered successfully",
      data: safeUser(newUser),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};

      Object.keys(error.errors).forEach((field) => {
        errors[field] = error.errors[field].message;
      });

      return res.status(400).json({
        status: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Email already exists",
      });
    }

    console.error("Admin registration error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    const isUser = await AdminModel.findOne({ email }).select("+password");

    if (!isUser) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordMatched = await isUser.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    const token = isUser.generateToken();

    return res.status(200).json({
      status: true,
      message: "Login successful",
      token,
      user: safeUser(isUser),
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const getMe = (req, res) => {
  res.status(200).json({ status: true, data: req.admin });
};
