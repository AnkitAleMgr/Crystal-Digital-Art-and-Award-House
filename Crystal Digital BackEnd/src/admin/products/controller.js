import { deleteOne, fail, getAll, mapDoc, updateOne } from "../../utils/crud.js";
import { notifySubscribersOfProduct } from "../../utils/notifications.js";
import { ProductModel } from "./model.js";

const withImages = { withImages: true };

export const getProducts = getAll(ProductModel);

// The admin form does not ask for a slug any more, so the server derives it from
// the product name. Kept deliberately naive — it only has to produce a readable,
// URL-safe segment; the uniqueness check below is what actually protects the
// column, not the quality of the transformation.
const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

// A second "Crystal Award" must not 500 on the unique index, so collisions get a
// numeric suffix. Loops rather than one shot because a deletion can free a slug
// and a name can be reused.
const uniqueSlug = async (name) => {
  const base = slugify(name) || "product";
  let candidate = base;
  let n = 2;

  while (await ProductModel.findOne({ slug: candidate }).select("_id").lean()) {
    candidate = `${base}-${n++}`;
  }

  return candidate;
};

// Hand-written rather than the createOne factory purely so the newsletter
// broadcast has a home. The saved doc, the 201, and the mapDoc body are all
// unchanged, and a ValidationError still surfaces through fail() as a 400 with
// the field map the admin modal renders.
export const createProduct = async (req, res) => {
  try {
    // req.body is not spread wholesale: `slug` and `id` are server-owned, so a
    // crafted POST cannot pin a product to somebody else's URL.
    const doc = await ProductModel.create({
      name: req.body.name,
      desc: req.body.desc,
      fullDesc: req.body.fullDesc,
      cat: req.body.cat,
      features: req.body.features,
      specs: req.body.specs,
      customizationFields: req.body.customizationFields,
      tags: req.body.tags,
      sizes: req.body.sizes,
      imgUrl: req.body.imgUrl,
      imgPublicId: req.body.imgPublicId,
      slug: await uniqueSlug(req.body.name),
    });

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

// The update is still the generic partial-update factory, but the slug is frozen
// on an existing product: renaming "Crystal Award" to "Premium Award" must not
// break a URL that has already been printed on somebody's invoice, and
// `runValidators` would otherwise reject a body carrying no slug at all.
export const updateProduct = async (req, res) => {
  const { slug, id, _id, __v, ...rest } = req.body || {};
  return updateOne(ProductModel, withImages)({ ...req, body: rest }, res);
};

export const deleteProduct = deleteOne(ProductModel, withImages);
