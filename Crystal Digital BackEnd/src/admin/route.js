import { adminLogin, adminRegister, getMe } from "./auth/controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ProductRoute } from "./products/route.js";
import { QuoteRoute } from "./quotes/route.js";
import { GalleryRoute } from "./gallery/route.js";
import { TestimonialRoute } from "./testimonials/route.js";
import { SettingRoute } from "./settings/route.js";
import express from "express";


export const AdminRoute = express.Router();


//Public routes
AdminRoute.post("/register", adminRegister);
AdminRoute.post("/admin-login", adminLogin);

//Protected routes
AdminRoute.use(authMiddleware);
AdminRoute.get("/me", getMe);
AdminRoute.use("/products", ProductRoute);
AdminRoute.use("/quotes", QuoteRoute);
AdminRoute.use("/gallery", GalleryRoute);
AdminRoute.use("/testimonials", TestimonialRoute);
AdminRoute.use("/settings", SettingRoute);