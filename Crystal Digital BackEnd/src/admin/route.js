import { adminLogin, adminRegister, getMe } from "./auth/controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ProductRoute } from "./products/route.js";
import { CategoryRoute } from "./categories/route.js";
import { QuoteRoute } from "./quotes/route.js";
import { GalleryRoute } from "./gallery/route.js";
import { TestimonialRoute } from "./testimonials/route.js";
import { SettingRoute } from "./settings/route.js";
import { SubscriberRoute } from "./subscribers/route.js";
import { UploadRoute } from "./upload/route.js";
import { UsersRoute } from "./users/route.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import express from "express";


// The /admin router. Two auth endpoints sit in front of the middleware; every
// route registered after `AdminRoute.use(authMiddleware)` needs a Bearer token.

export const AdminRoute = express.Router();


// Public: creates the first admin. Secret-gated (ADMIN_REGISTER_SECRET,
// compared with timingSafeEqual) and 503 when that secret is unset — it never
// falls back to open access.
AdminRoute.post("/register", adminRegister);

// Public: exchanges email + password for a JWT plus a whitelisted user object.
AdminRoute.post("/admin-login", adminLogin);

// Everything below requires a valid token.
AdminRoute.use(authMiddleware);

// Echoes the req.admin set by the middleware — a token health check.
AdminRoute.get("/me", getMe);

// Sub-routers, every one of them behind the token check above:
//
//   upload        multipart image → Cloudinary, for the admin forms
//   products      CRUD; the slug is server-owned and images are cleaned up
//   categories    the one product/gallery category list
//   quotes        CRUD; a status change emails the customer, no public read
//   gallery       CRUD; images are cleaned up on replace and delete
//   testimonials  plain CRUD
//   subscribers   GET + DELETE only, by design (see subscribers/controller.js)
//   settings      single document, no :id
//   users         admin/staff accounts — requireAdmin adds a role gate
AdminRoute.use("/upload", UploadRoute);
AdminRoute.use("/products", ProductRoute);
AdminRoute.use("/categories", CategoryRoute);
AdminRoute.use("/quotes", QuoteRoute);
AdminRoute.use("/gallery", GalleryRoute);
AdminRoute.use("/testimonials", TestimonialRoute);
AdminRoute.use("/subscribers", SubscriberRoute);
AdminRoute.use("/settings", SettingRoute);
AdminRoute.use("/users", requireAdmin, UsersRoute);