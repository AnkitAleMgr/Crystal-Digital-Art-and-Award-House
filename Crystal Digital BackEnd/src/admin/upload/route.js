import express from "express";
import {
  uploadErrorHandler,
  uploadImageController,
  uploadImageHandler,
} from "./controller.js";

export const UploadRoute = express.Router();

UploadRoute.post(
  "/",
  uploadImageHandler,
  uploadImageController,
  uploadErrorHandler
);
