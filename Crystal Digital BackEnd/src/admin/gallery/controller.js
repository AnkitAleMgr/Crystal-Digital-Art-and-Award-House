import { createOne, deleteOne, getAll, updateOne } from "../../utils/crud.js";
import { GalleryModel } from "./model.js";

// Gallery CRUD through the generic factory. withImages is what makes replace
// and delete clean up the old Cloudinary asset instead of orphaning it.
const withImages = { withImages: true };

export const getGallery = getAll(GalleryModel);
export const createGalleryItem = createOne(GalleryModel);
export const updateGalleryItem = updateOne(GalleryModel, withImages);
export const deleteGalleryItem = deleteOne(GalleryModel, withImages);
