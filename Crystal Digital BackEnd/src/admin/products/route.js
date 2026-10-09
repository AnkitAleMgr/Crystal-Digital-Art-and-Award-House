import express from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "./controller.js";

export const ProductRoute = express.Router();

// Admin CRUD. The slug is server-owned: it is derived from the name on create
// and frozen on update, so neither endpoint can move a product's public URL.
ProductRoute.get("/", getProducts);
ProductRoute.post("/", createProduct);
ProductRoute.put("/:id", updateProduct);
// Delete, which also destroys the product's Cloudinary image (withImages).
ProductRoute.delete("/:id", deleteProduct);