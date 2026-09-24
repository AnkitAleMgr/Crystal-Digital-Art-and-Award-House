import express from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "./controller.js";

export const ProductRoute = express.Router();

ProductRoute.get("/", getProducts);
ProductRoute.post("/", createProduct);
ProductRoute.put("/:id", updateProduct);
ProductRoute.delete("/:id", deleteProduct);