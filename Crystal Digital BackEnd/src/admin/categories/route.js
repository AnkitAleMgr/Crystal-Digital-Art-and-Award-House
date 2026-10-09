import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./controller.js";

export const CategoryRoute = express.Router();

// Admin CRUD for the one list both products and gallery items draw their `cat`
// from. A rename is rewritten onto every row using the old name; a delete
// strips `cat` from those rows and never deletes the rows themselves.
// Read: sorted by `order`, which is exactly the pill order visitors see.
CategoryRoute.get("/", getCategories);
// Create: appends to the end of that order; duplicate names are rejected
// case-insensitively with a field-level message.
CategoryRoute.post("/", createCategory);
CategoryRoute.put("/:id", updateCategory);
CategoryRoute.delete("/:id", deleteCategory);
