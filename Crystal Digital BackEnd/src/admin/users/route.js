import express from "express";
import { listAdmins, createAdmin, deleteAdmin } from "./controller.js";

export const UsersRoute = express.Router();

// Admin/staff accounts. Mounted behind requireAdmin as well as authMiddleware,
// so a staff token gets a 403 here; the first admin is made by POST
// /admin/register. DELETE refuses to remove the caller's own account.
UsersRoute.get("/", listAdmins);
UsersRoute.post("/", createAdmin);
UsersRoute.delete("/:id", deleteAdmin);
