import { createOne, deleteOne, getAll, updateOne } from "../../utils/crud.js";
import { GalleryModel } from "./model.js";

const withImages = { withImages: true };

export const getGallery = getAll(GalleryModel);
export const createGalleryItem = createOne(GalleryModel);
export const updateGalleryItem = updateOne(GalleryModel, withImages);
export const deleteGalleryItem = deleteOne(GalleryModel, withImages);
