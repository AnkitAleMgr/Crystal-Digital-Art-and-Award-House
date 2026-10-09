import express from "express";
import {
  uploadErrorHandler,
  uploadImageController,
  uploadImageHandler,
} from "./controller.js";

export const UploadRoute = express.Router();

// Multipart image → Cloudinary, returns { url, publicId }. Runs after
// authMiddleware (mounted in admin/route.js), so an anonymous caller 401s; the
// error handler turns a bad type/oversized file into a 4xx instead of a 500.
UploadRoute.post(
  "/",
  uploadImageHandler,
  uploadImageController,
  uploadErrorHandler
);
