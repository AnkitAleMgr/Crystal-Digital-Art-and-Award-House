import express from "express";
import {
  getPublicProducts,
  getPublicGallery,
  getPublicTestimonials,
  getPublicSettings,
} from "./controller.js";

export const PublicRoute = express.Router();

PublicRoute.get("/products", getPublicProducts);
PublicRoute.get("/gallery", getPublicGallery);
PublicRoute.get("/testimonials", getPublicTestimonials);
PublicRoute.get("/settings", getPublicSettings);
