import { createOne, deleteOne, getAll, updateOne } from "../../utils/crud.js";
import { GalleryModel } from "./model.js";

export const getGallery = getAll(GalleryModel);
export const createGalleryItem = createOne(GalleryModel);
export const updateGalleryItem = updateOne(GalleryModel);
export const deleteGalleryItem = deleteOne(GalleryModel);