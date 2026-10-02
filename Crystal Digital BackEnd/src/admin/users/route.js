import express from "express";
import { listAdmins, createAdmin, deleteAdmin } from "./controller.js";

export const UsersRoute = express.Router();

UsersRoute.get("/", listAdmins);
UsersRoute.post("/", createAdmin);
UsersRoute.delete("/:id", deleteAdmin);
