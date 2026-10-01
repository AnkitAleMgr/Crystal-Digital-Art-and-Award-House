import express from "express";
import {
  getPublicProducts,
  getPublicGallery,
  getPublicTestimonials,
  getPublicSettings,
  getPublicCategories,
  createPublicQuote,
  createPublicSubscriber,
  confirmPublicSubscriber,
  unsubscribePublicSubscriber,
} from "./controller.js";
import { quoteRateLimit, subscribeRateLimit, artworkDailyBudget } from "../middleware/rateLimit.js";
import { singleAnyFile, artworkUploadFallback } from "../middleware/imageUpload.js";

export const PublicRoute = express.Router();

PublicRoute.get("/products", getPublicProducts);
PublicRoute.get("/categories", getPublicCategories);
PublicRoute.get("/gallery", getPublicGallery);
PublicRoute.get("/testimonials", getPublicTestimonials);
PublicRoute.get("/settings", getPublicSettings);

//   quoteRateLimit       per-IP, before any bytes are read
//   singleAnyFile        parses multipart so req.body/req.file exist; size-capped
//   artworkUploadFallback  a bad attachment is logged, not fatal
//   artworkDailyBudget   the site-wide ceiling, only spends a slot if there is a file
//
// The per-IP limiter runs first so a flood is rejected without buffering a single
// 5MB upload. The budget runs after multer because it can only tell whether a
// file was attached once the body has been parsed.
PublicRoute.post(
  "/quotes",
  quoteRateLimit,
  singleAnyFile("artwork"),
  artworkUploadFallback,
  artworkDailyBudget,
  createPublicQuote
);

// Rate limited on the subscribe POST only. Confirm and unsubscribe are POSTs
// carrying a signed token, so they are not guessable and are not worth a bucket
// of their own — a person clicking their link twice should not be turned away.
PublicRoute.post("/subscribers", subscribeRateLimit, createPublicSubscriber);
PublicRoute.post("/subscribers/confirm", confirmPublicSubscriber);
PublicRoute.post("/subscribers/unsubscribe", unsubscribePublicSubscriber);
