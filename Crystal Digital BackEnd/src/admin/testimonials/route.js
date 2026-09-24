import express from "express";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "./controller.js";

export const TestimonialRoute = express.Router();

TestimonialRoute.get("/", getTestimonials);
TestimonialRoute.post("/", createTestimonial);
TestimonialRoute.put("/:id", updateTestimonial);
TestimonialRoute.delete("/:id", deleteTestimonial);