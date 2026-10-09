import { deleteImage } from "../claudinery/claudineryService.js";

// Every response in this project is built through mapDoc: strip Mongo's `_id`
// and `__v`, expose the document under `id`, so the TypeScript shapes on the
// frontend never have to care about Mongo's naming.
export const mapDoc = (doc) => {
  const { _id, __v, ...rest } = doc.toObject();
  return { id: _id, ...rest };
};

// Checked before any findById: a junk id would otherwise surface as a Mongoose
// CastError, and 404 is both the honest answer and the one that leaks nothing.
export const isObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value));

// The one error responder: a Mongoose ValidationError becomes a 400 carrying a
// field → message map (`errors`) the admin modal renders next to each input,
// anything else falls through to the given status with just the message.
export const fail = (res, error, status = 500) => {
  if (error.name === "ValidationError") {
    const errors = Object.fromEntries(
      Object.entries(error.errors).map(([field, detail]) => [field, detail.message])
    );

    return res.status(400).json({
      status: false,
      message: "Please fix the highlighted fields.",
      errors,
    });
  }

  if (error.name === "CastError") {
    return res.status(404).json({ status: false, message: "Not found" });
  }

  return res.status(status).json({ status: false, message: error.message });
};

// Products and gallery store the Cloudinary public id in `imgPublicId`; quotes
// name theirs `attachmentPublicId`. The field is a parameter rather than hardcoded
// so both resources share this one function.
const releaseImage = async (doc, imageField = "imgPublicId") => {
  if (!doc?.[imageField]) {
    return;
  }

  const result = await deleteImage(doc[imageField]);

  if (result?.error) {
    console.error(`Could not delete image ${doc[imageField]}:`, result.error);
  }
};

const releaseReplacedImage = async (before, after, imageField) => {
  if (!before?.[imageField]) {
    return;
  }

  if (before[imageField] === after?.[imageField]) {
    return;
  }

  await releaseImage(before, imageField);
};

// GET handler: every row, newest first, under { status, data }.
export const getAll = (Model) => async (req, res) => {
  try {
    const items = await Model.find().sort({ createdAt: -1 });
    res.json({ status: true, data: items.map(mapDoc) });
  } catch (error) {
    fail(res, error);
  }
};

// POST handler: creates from req.body and answers 201. The resources that need
// a server-owned field hand-roll their own create instead — products (slug) and
// the public quote path (status, timestamps) — but a ValidationError still
// surfaces through fail() as a 400 with the field map either way.
export const createOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};

// PUT handler: a PARTIAL update — findByIdAndUpdate only merges the keys the
// caller sent, which is what lets an admin save { status } alone without
// wiping the customer's details. `returnDocument: "after"` (not the deprecated
// `new: true`) so the response carries the row as saved. `{ withImages }`
// additionally destroys the previous Cloudinary asset when it was replaced.
export const updateOne = (Model, options = {}) => async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(404).json({ status: false, message: "Not found" });
  }

  try {
    const before = options.withImages
      ? await Model.findById(req.params.id).lean()
      : null;

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!doc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    if (options.withImages) {
      await releaseReplacedImage(before, doc, options.imageField);
    }

    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};

// DELETE handler: removes the row, and with `{ withImages }` the Cloudinary
// asset it owns too (imageField names the column — products/gallery say
// `imgPublicId`, quotes say `attachmentPublicId`). Answers { status, message }
// with no `data` key.
export const deleteOne = (Model, options = {}) => async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(404).json({ status: false, message: "Not found" });
  }

  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    if (options.withImages) {
      await releaseImage(doc, options.imageField);
    }

    res.json({ status: true, message: "Deleted" });
  } catch (error) {
    fail(res, error);
  }
};
