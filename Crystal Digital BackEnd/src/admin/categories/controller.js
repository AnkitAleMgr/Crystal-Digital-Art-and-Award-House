import { fail, isObjectId, mapDoc } from "../../utils/crud.js";
import { CategoryModel } from "./model.js";
import { ProductModel } from "../products/model.js";
import { GalleryModel } from "../gallery/model.js";

const field = (value, max) => String(value ?? "").trim().slice(0, max);

// Case-insensitive duplicate guard. The schema's `unique: true` would also catch
// it, but it surfaces as a raw E11000 → 500, and the admin needs a message it
// can show next to the field.
const takenByOther = async (name, exceptId) =>
  CategoryModel.exists({
    name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });

// Categories drive the filter pills on the home and gallery pages, so the order
// the admin arranged them in is the order visitors see. name is the tiebreak so
// two categories sharing an order still sort deterministically.
export const getCategories = async (_req, res) => {
  try {
    const docs = await CategoryModel.find().sort({ order: 1, name: 1 });
    res.json({ status: true, data: docs.map(mapDoc) });
  } catch (error) {
    fail(res, error);
  }
};

export const createCategory = async (req, res) => {
  const name = field(req.body.name, 60);

  if (!name) {
    return res.status(400).json({
      status: false,
      message: "Please fix the highlighted fields.",
      errors: { name: "Give the category a name." },
    });
  }

  if (await takenByOther(name)) {
    return res.status(400).json({
      status: false,
      message: "Please fix the highlighted fields.",
      errors: { name: `A category named "${name}" already exists.` },
    });
  }

  try {
    // Appended, so a new category lands at the end of the pills rather than
    // jumping to the top.
    const order = await CategoryModel.countDocuments();
    const doc = await CategoryModel.create({ name, order });
    res.status(201).json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};

export const updateCategory = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(404).json({ status: false, message: "Not found" });
  }

  // Built field by field rather than spreading req.body: a rename has to
  // rewrite every product and gallery doc carrying the old name, so an
  // unexpected key here would be a silent no-op at best.
  const patch = {};

  if (req.body.name !== undefined) {
    const name = field(req.body.name, 60);

    if (!name) {
      return res.status(400).json({
        status: false,
        message: "Please fix the highlighted fields.",
        errors: { name: "Give the category a name." },
      });
    }

    if (await takenByOther(name, req.params.id)) {
      return res.status(400).json({
        status: false,
        message: "Please fix the highlighted fields.",
        errors: { name: `A category named "${name}" already exists.` },
      });
    }

    patch.name = name;
  }

  if (req.body.order !== undefined) {
    const order = Number(req.body.order);
    if (Number.isFinite(order)) patch.order = order;
  }

  try {
    const before = await CategoryModel.findById(req.params.id).lean();

    if (!before) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    const doc = await CategoryModel.findByIdAndUpdate(req.params.id, patch, {
      returnDocument: "after",
      runValidators: true,
    });

    // The docs store the category *name*, so a rename has to follow it through.
    // Without this the category would simply vanish from both filter pills and
    // every product would be left pointing at a name nothing offers any more.
    if (patch.name && patch.name !== before.name) {
      await Promise.all([
        ProductModel.updateMany({ cat: before.name }, { $set: { cat: patch.name } }),
        GalleryModel.updateMany({ cat: before.name }, { $set: { cat: patch.name } }),
      ]);
    }

    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    fail(res, error, 400);
  }
};

// Deleting a category does not delete the products that used it. Their `cat` is
// cleared, which the schema allows and the admin/public UIs render as
// "Uncategorized" — a category is a label, not a container.
export const deleteCategory = async (req, res) => {
  if (!isObjectId(req.params.id)) {
    return res.status(404).json({ status: false, message: "Not found" });
  }

  try {
    const doc = await CategoryModel.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({ status: false, message: "Not found" });
    }

    await Promise.all([
      ProductModel.updateMany({ cat: doc.name }, { $set: { cat: "" } }),
      GalleryModel.updateMany({ cat: doc.name }, { $set: { cat: "" } }),
    ]);

    res.json({ status: true, message: "Deleted" });
  } catch (error) {
    fail(res, error);
  }
};
