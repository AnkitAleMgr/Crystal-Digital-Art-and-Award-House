import { ProductModel } from "../admin/products/model.js";
import { GalleryModel } from "../admin/gallery/model.js";
import { TestimonialModel } from "../admin/testimonials/model.js";
import { SettingModel } from "../admin/settings/model.js";
import { QuoteModel, QUOTE_EMAIL_PATTERN } from "../admin/quotes/model.js";
import { fail, mapDoc } from "../utils/crud.js";
import { notifyOwnerOfQuote } from "../utils/notifications.js";

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
    // mapDoc, like every other route: it is what turns Mongo's _id/__v into the
    // public `id`. This one used to hand back doc.toObject() verbatim.
    res.json({ status: true, data: mapDoc(doc) });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const field = (value, max) => String(value ?? "").trim().slice(0, max);

export const createPublicQuote = async (req, res) => {
  // Honeypot: the field is hidden from humans, so anything in it is a bot.
  // Answer 201 anyway — replying with an error tells the bot it was caught.
  if (field(req.body.website, 200)) {
    return res.status(201).json({ status: true, data: { id: null, received: true } });
  }

  const name = field(req.body.name, 120);
  const email = field(req.body.email, 160).toLowerCase();
  const message = field(req.body.message, 2000);

  const errors = {};

  if (!name) {
    errors.name = "Please tell us your name.";
  }

  if (!email) {
    errors.email = "We need an email address to send your quote.";
  } else if (!QUOTE_EMAIL_PATTERN.test(email)) {
    errors.email = "That email address doesn't look right.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      status: false,
      message: "Please fix the highlighted fields.",
      errors,
    });
  }

  try {
    // Built field by field rather than spreading req.body: "status" and the
    // timestamps are server-owned, so a crafted POST cannot pre-close its own
    // quote or backdate it.
    const doc = await QuoteModel.create({
      name,
      email,
      message,
      phone: field(req.body.phone, 40),
      product: field(req.body.product, 160),
      size: field(req.body.size, 80),
      service: field(req.body.service, 120),
      quantity: field(req.body.quantity, 20),
      engrave: field(req.body.engrave, 500),
      attachment: field(req.body.attachment, 160),
      status: "new",
    });

    // Fire-and-forget on purpose. The quote is already saved, so a mail outage
    // must not turn a successful submission into a failed form — the owner also
    // sees every enquiry in the admin dashboard regardless.
    notifyOwnerOfQuote(doc);

    res.status(201).json({
      status: true,
      data: { id: String(doc._id), createdAt: doc.createdAt },
    });
  } catch (error) {
    fail(res, error, 400);
  }
};
