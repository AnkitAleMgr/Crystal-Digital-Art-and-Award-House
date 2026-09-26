import { ProductModel } from "../admin/products/model.js";
import { GalleryModel } from "../admin/gallery/model.js";
import { TestimonialModel } from "../admin/testimonials/model.js";
import { SettingModel } from "../admin/settings/model.js";

const publicProduct = (doc) => ({
  id: doc.slug,
  slug: doc.slug,
  name: doc.name,
  img: doc.imgUrl,
  desc: doc.desc,
  fullDesc: doc.fullDesc,
  cat: doc.cat,
  features: doc.features,
  specs: doc.specs,
  customizable: doc.customizable,
  tags: doc.tags,
  sizes: doc.sizes,
});

const publicGallery = (doc) => ({
  id: String(doc._id),
  label: doc.label,
  cat: doc.cat,
  img: doc.imgUrl,
  linkedProductId: doc.linkedProductId,
});

const publicTestimonial = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  company: doc.company,
  text: doc.text,
  rating: doc.rating,
});

export const getPublicProducts = async (req, res) => {
  try {
    // Only products carrying a slug are published to the site — a slug is what
    // the public /products/:slug URLs resolve against, so a product without one
    // is unreachable and must not be listed.
    const docs = await ProductModel.find({ slug: { $exists: true, $ne: "" } }).sort({
      createdAt: 1,
    });
    res.json({ status: true, data: docs.map(publicProduct) });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const getPublicGallery = async (req, res) => {
  try {
    const docs = await GalleryModel.find().sort({ createdAt: 1 });
    res.json({ status: true, data: docs.map(publicGallery) });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const getPublicTestimonials = async (req, res) => {
  try {
    const docs = await TestimonialModel.find().sort({ createdAt: 1 });
    res.json({ status: true, data: docs.map(publicTestimonial) });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

export const getPublicSettings = async (req, res) => {
  try {
    const doc = await SettingModel.findOne();
    if (!doc) {
      return res.json({ status: true, data: null });
    }
    res.json({ status: true, data: doc.toObject() });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
