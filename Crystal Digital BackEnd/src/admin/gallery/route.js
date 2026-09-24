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
GalleryRoute.put("/:id", updateGalleryItem);
GalleryRoute.delete("/:id", deleteGalleryItem);