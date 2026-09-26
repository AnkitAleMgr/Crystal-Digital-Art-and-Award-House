import { deleteImage } from "../claudinery/claudineryService.js";

export const mapDoc = (doc) => {
  const { _id, __v, ...rest } = doc.toObject();
  return { id: _id, ...rest };
};

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value));

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

const releaseImage = async (doc) => {
  if (!doc?.imgPublicId) {
    return;
  }

  const result = await deleteImage(doc.imgPublicId);

  if (result?.error) {
    console.error(`Could not delete image ${doc.imgPublicId}:`, result.error);
  }
};

const releaseReplacedImage = async (before, after) => {
  if (!before?.imgPublicId) {
    return;
  }

  if (before.imgPublicId === after?.imgPublicId) {
    return;
  }

  await releaseImage(before);
};

export const getAll = (Model) => async (req, res) => {
  try {
    const items = await Model.find().sort({ createdAt: -1 });
    res.json({ status: true, data: items.map(mapDoc) });
  } catch (error) {
    fail(res, error);
  }
};

export const createOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};

export const updateOne = (Model, options = {}) => async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(404).json({ status: false, message: "Not found" });
  }

  try {
    const before = options.withImages
      ? await Model.findById(req.params.id).lean()
      : null;

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    if (options.withImages) {
      await releaseReplacedImage(before, doc);
    }

    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};

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
      await releaseImage(doc);
    }

    res.json({ status: true, message: "Deleted" });
  } catch (error) {
    fail(res, error);
  }
};
