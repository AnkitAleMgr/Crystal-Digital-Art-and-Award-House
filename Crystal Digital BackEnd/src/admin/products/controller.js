import { deleteOne, fail, getAll, mapDoc, updateOne } from "../../utils/crud.js";
import { notifySubscribersOfProduct } from "../../utils/notifications.js";
import { ProductModel } from "./model.js";

const withImages = { withImages: true };

export const getProducts = getAll(ProductModel);

// Hand-written rather than the createOne factory purely so the newsletter
// broadcast has a home. The saved doc, the 201, and the mapDoc body are all
// unchanged, and a ValidationError still surfaces through fail() as a 400 with
// the field map the admin modal renders.
export const createProduct = async (req, res) => {
  try {
    const doc = await ProductModel.create(req.body);

    // Fire-and-forget and never awaited, same as the quote alert: the product is
    // already saved, so a mail outage must not fail the admin's save. It returns
    // immediately when nobody is subscribed, when the product has no slug, or
    // when no API key is configured, so this costs one query on an idle list.
    notifySubscribersOfProduct(doc);

    res.status(201).json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};

export const updateProduct = updateOne(ProductModel, withImages);
export const deleteProduct = deleteOne(ProductModel, withImages);
