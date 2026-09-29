import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./controller.js";

export const CategoryRoute = express.Router();

CategoryRoute.get("/", getCategories);
CategoryRoute.post("/", createCategory);
CategoryRoute.put("/:id", updateCategory);
CategoryRoute.delete("/:id", deleteCategory);
