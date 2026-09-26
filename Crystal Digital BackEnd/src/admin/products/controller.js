import { createOne, deleteOne, getAll, updateOne } from "../../utils/crud.js";
import { ProductModel } from "./model.js";

const withImages = { withImages: true };

export const getProducts = getAll(ProductModel);
export const createProduct = createOne(ProductModel);
export const updateProduct = updateOne(ProductModel, withImages);
export const deleteProduct = deleteOne(ProductModel, withImages);
