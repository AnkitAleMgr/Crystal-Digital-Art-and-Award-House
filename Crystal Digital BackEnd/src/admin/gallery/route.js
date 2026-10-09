import express from "express";
import {
  createGalleryItem,
  deleteGalleryItem,
  getGallery,
  updateGalleryItem,
} from "./controller.js";

export const GalleryRoute = express.Router();

GalleryRoute.get("/", getGallery);
GalleryRoute.post("/", createGalleryItem);
// Replace (the previous asset is destroyed when imgPublicId changes) and
// delete (the item's image is destroyed too) — both via crud.js's { withImages }.
GalleryRoute.put("/:id", updateGalleryItem);
GalleryRoute.delete("/:id", deleteGalleryItem);