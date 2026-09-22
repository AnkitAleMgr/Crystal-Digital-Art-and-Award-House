import { adminLogin, adminRegister } from "./auth/Controller.js";
import express from "express";


export const AdminRoute=express.Router();


//Admin register route
AdminRoute.post("/register",adminRegister);
AdminRoute.post("/admin-login",adminLogin);