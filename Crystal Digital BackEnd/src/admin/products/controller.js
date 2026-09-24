import { createOne, deleteOne, getAll, updateOne } from "../../utils/crud.js";
import { ProductModel } from "./model.js";

export const getProducts = getAll(ProductModel);
export const createProduct = createOne(ProductModel);
export const updateProduct = updateOne(ProductModel);
export const deleteProduct = deleteOne(ProductModel);