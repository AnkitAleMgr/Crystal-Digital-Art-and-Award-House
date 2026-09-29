import express from "express";
import {
  getPublicProducts,
  getPublicGallery,
  getPublicTestimonials,
  getPublicSettings,
  getPublicCategories,
  createPublicQuote,
} from "./controller.js";
import { quoteRateLimit } from "../middleware/quoteRateLimit.js";

export const PublicRoute = express.Router();

PublicRoute.get("/products", getPublicProducts);
PublicRoute.get("/categories", getPublicCategories);
PublicRoute.get("/gallery", getPublicGallery);
PublicRoute.get("/testimonials", getPublicTestimonials);
PublicRoute.get("/settings", getPublicSettings);

PublicRoute.post("/quotes", quoteRateLimit, createPublicQuote);
