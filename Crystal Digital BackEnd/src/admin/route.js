import { adminLogin, adminRegister, getMe } from "./auth/controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import express from "express";


export const AdminRoute = express.Router();


//Public routes
AdminRoute.post("/register", adminRegister);
AdminRoute.post("/admin-login", adminLogin);

//Protected route
AdminRoute.use(authMiddleware);
AdminRoute.get("/me", getMe);