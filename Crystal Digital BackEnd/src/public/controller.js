import { randomUUID } from "node:crypto";
import { ProductModel } from "../admin/products/model.js";
import { CategoryModel } from "../admin/categories/model.js";
import { GalleryModel } from "../admin/gallery/model.js";
import { TestimonialModel } from "../admin/testimonials/model.js";
import { SettingModel } from "../admin/settings/model.js";
import { QuoteModel, QUOTE_EMAIL_PATTERN } from "../admin/quotes/model.js";
import { SubscriberModel, SUBSCRIBER_EMAIL_PATTERN } from "../admin/subscribers/model.js";
import { fail, mapDoc } from "../utils/crud.js";
import {
  notifyOwnerOfQuote,
  notifySubscriberOfConfirmation,
} from "../utils/notifications.js";
import { verifySubscriberToken } from "../utils/subscribeTokens.js";
import { uploadImage } from "../claudinery/claudineryService.js";
import { ALLOWED_IMAGE_MIME_TYPES } from "../middleware/imageUpload.js";

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
  customizationFields: doc.customizationFields,
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

export const getPublicCategories = async (_req, res) => {
  try {
    // Same order the admin arranged them in — this list *is* the filter pills on
    // the home and gallery pages, so the ordering is visible copy, not noise.
    const docs = await CategoryModel.find().sort({ order: 1, name: 1 });
    res.json({
      status: true,
      data: docs.map((doc) => ({ id: String(doc._id), name: doc.name, order: doc.order })),
    });
  } catch (error) {
    fail(res, error);
  }
};

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

// Reads the customer's answers to the product's customizationFields and checks
// them against the product's own definition. The product is loaded from its
// slug rather than trusting the posted labels, which is the whole point: the
// browser enforces "required" as a courtesy, this is what actually holds.
//
// Returns the pairs to store plus any per-label errors. An answer to a field the
// product does not define is dropped rather than rejected — the admin deleted the
// field between page load and submit, and that is not the customer's fault.
const readCustomization = (product, raw) => {
  // The form posts multipart, so this arrives as a JSON string rather than an
  // array. A JSON body (the contact form, or curl) gives a real array. Anything
  // else is treated as "nothing answered" rather than throwing on a bad cast.
  let rows = raw;

  if (typeof rows === "string") {
    try {
      rows = JSON.parse(rows);
    } catch {
      rows = [];
    }
  }

  const posted = new Map(
    (Array.isArray(rows) ? rows : []).map((row) => [
      field(row?.label, 120),
      field(row?.value, 1000),
    ])
  );

  const stored = [];
  const errors = {};

  for (const def of product?.customizationFields ?? []) {
    const value = posted.get(def.label) ?? "";

    if (def.required && !value) {
      errors[`customization.${def.label}`] = `${def.label} is required.`;
      continue;
    }

    // Truncated rather than rejected: a long answer is a nuisance, not an
    // attack, and the field's own maxLength is the admin's stated limit.
    stored.push({
      label: def.label,
      value: value.slice(0, def.maxLength ?? 300),
    });
  }

  return { stored, errors };
};

// Customer artwork is named randomly rather than after the file the customer
// chose. A predictable public_id ("logo-final") means anyone can enumerate the
// quote-artwork folder and read other customers' designs before they are
// publicly launched. The original name is kept on the document as `attachment`
// so the admin still recognises it.
const artworkId = () => randomUUID().replace(/-/g, "");

// Uploads the customer's artwork and writes the link onto the saved quote.
// Never throws: a Cloudinary outage must cost the artwork, never the enquiry,
// which is already in the database by the time this runs.
//
// A file that is not a raster image is skipped rather than uploaded. The route
// deliberately does not filter by mimetype (see middleware/imageUpload.js), so a
// customer who attaches a PDF keeps their quote and the admin sees the usual
// "ask them to email it" fallback.
const attachArtwork = async (doc, file) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
    console.warn(`[quotes] ${doc._id} artwork is ${file.mimetype}, not an image — skipped`);
    return doc;
  }

  try {
    const uploaded = await uploadImage(file.buffer, {
      folder: "quote-artwork",
      mimetype: file.mimetype,
      publicId: artworkId(),
      // maxWidth 0 keeps the original pixels. Artwork is judged on print
      // resolution, so the 1600px limit applied to product photos would
      // destroy the detail the admin needs to see.
      maxWidth: 0,
    });

    const updated = await QuoteModel.findByIdAndUpdate(
      doc._id,
      { attachmentUrl: uploaded.url, attachmentPublicId: uploaded.publicId },
      { returnDocument: "after" }
    );

    return updated ?? doc;
  } catch (error) {
    console.error(`[quotes] artwork upload failed for ${doc._id}:`, error.message);
    return doc;
  }
};

export const createPublicQuote = async (req, res) => {
  // Honeypot: the field is hidden from humans, so anything in it is a bot.
  // Answer 201 anyway — replying with an error tells the bot it was caught.
  //
  // This runs before the file is looked at, so a bot cannot use the honeypot
  // endpoint as free image hosting for your Cloudinary account.
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

  const productSlug = field(req.body.productSlug, 160);

  // A product-scoped quote has to resolve to a real product before its size and
  // customization rules can be checked. The general contact form posts no slug,
  // so this is skipped entirely for it rather than being an error.
  let product = null;

  if (productSlug) {
    product = await ProductModel.findOne({ slug: productSlug }).lean();

    if (!product) {
      errors.product = "That product is no longer available. Please pick another one.";
    }
  }

  if (product) {
    const size = field(req.body.size, 80);

    // Only enforced when the product actually offers sizes — a one-size product
    // must not demand one, and the sizes themselves are the admin's list, so an
    // invented size is rejected rather than stored.
    if (product.sizes.length > 0) {
      if (!size) {
        errors.size = "Please choose a size.";
      } else if (!product.sizes.includes(size)) {
        errors.size = "Please choose one of the listed sizes.";
      }
    }

    const answers = readCustomization(product, req.body.customization);
    Object.assign(errors, answers.errors);
    req.quoteCustomization = answers.stored;
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
    let doc = await QuoteModel.create({
      name,
      email,
      message,
      phone: field(req.body.phone, 40),
      product: field(req.body.product, 160),
      productSlug,
      size: field(req.body.size, 80),
      service: field(req.body.service, 120),
      quantity: field(req.body.quantity, 20),
      customization: req.quoteCustomization ?? [],
      // Taken from the uploaded part rather than a separate field, so the name
      // the admin reads always describes the image that was actually stored.
      attachment: req.file
        ? field(req.file.originalname, 160)
        : field(req.body.attachment, 160),
      status: "new",
    });

    // The artwork rides along on this same request rather than being uploaded
    // when the file was picked, so a customer who attaches a file and then
    // abandons the form leaves nothing behind on Cloudinary. The quote row is
    // written first, so the worst case is a quote with the filename and no
    // image — the state the form used to be in permanently.
    if (req.file && !req.artworkOverBudget) {
      doc = await attachArtwork(doc, req.file);
    } else if (req.file) {
      console.warn(`[artwork] over daily budget — ${doc._id} saved without its image`);
    }

    // Fire-and-forget on purpose. The quote is already saved, so a mail outage
    // must not turn a successful submission into a failed form — the owner also
    // sees every enquiry in the admin dashboard regardless. Awaited only in the
    // sense that the artwork link above is already on `doc`, so the alert can
    // include it.
    notifyOwnerOfQuote(doc);

    res.status(201).json({
      status: true,
      data: { id: String(doc._id), createdAt: doc.createdAt },
    });
  } catch (error) {
    fail(res, error, 400);
  }
};

// ── Newsletter ────────────────────────────────────────────────────────────────

// The email itself is never echoed back, and neither is the stored document. The
// one thing the response does reveal is whether the address was already
// confirmed, because otherwise somebody who is already subscribed gets told to
// "check your inbox" for a mail that will never arrive. That is the same thing
// the old localStorage form told them, so it is not a new disclosure.
export const createPublicSubscriber = async (req, res) => {
  // Honeypot, exactly as on the quote form: hidden from humans, so anything in
  // it is a bot. Answer 201 without storing anything.
  if (field(req.body.website, 200)) {
    return res.status(201).json({
      status: true,
      data: { id: null, alreadySubscribed: false },
    });
  }

  const email = field(req.body.email, 160).toLowerCase();

  if (!email) {
    return res.status(400).json({
      status: false,
      message: "Please fix the highlighted fields.",
      errors: { email: "Please enter your email address." },
    });
  }

  if (!SUBSCRIBER_EMAIL_PATTERN.test(email)) {
    return res.status(400).json({
      status: false,
      message: "Please fix the highlighted fields.",
      errors: { email: "That email address doesn't look right." },
    });
  }

  try {
    const existing = await SubscriberModel.findOne({ email });

    // Already confirmed: nothing to do and nothing to send. Silently succeeding
    // is right here — this is the path a repeat visitor takes, and an error
    // would read as "we rejected you".
    if (existing?.status === "active") {
      return res.status(201).json({
        status: true,
        data: { id: String(existing._id), alreadySubscribed: true },
      });
    }

    // Reused rather than re-inserted, because `email` is uniquely indexed: a
    // fresh row would be an E11000. This covers both "clicked subscribe twice,
    // never confirmed" and "unsubscribed, then came back" — the second sets
    // status back to pending so the confirmation link is what re-activates it.
    const doc = existing
      ? await SubscriberModel.findByIdAndUpdate(
          existing._id,
          { status: "pending", unsubscribedAt: null },
          { returnDocument: "after", runValidators: true }
        )
      : await SubscriberModel.create({ email, status: "pending" });

    // Fire-and-forget, like the owner alert: the row is saved either way, and a
    // mail outage must not read as a failed subscription. The person can always
    // submit the form again to get another link.
    notifySubscriberOfConfirmation(doc);

    res.status(201).json({
      status: true,
      data: { id: String(doc._id), alreadySubscribed: false },
    });
  } catch (error) {
    // Two identical submissions racing past the findOne above. The winner has
    // already stored the row and sent the link, so this is a success too.
    if (error.code === 11000) {
      return res.status(201).json({
        status: true,
        data: { id: null, alreadySubscribed: false },
      });
    }

    fail(res, error, 400);
  }
};

const badToken = (res) =>
  res.status(400).json({
    status: false,
    message:
      "This link is invalid or has expired. Please use the most recent email we sent you.",
  });

// Step two of the double opt-in. POSTed from a page on the site rather than
// linked straight at this endpoint: email clients auto-follow links with
// security scanners, and a GET would let those scanners confirm every
// subscription before the person ever saw it.
export const confirmPublicSubscriber = async (req, res) => {
  const email = verifySubscriberToken(field(req.body.token, 2000), "confirm");

  if (!email) {
    return badToken(res);
  }

  try {
    const doc = await SubscriberModel.findOne({ email });

    if (!doc) {
      return res.status(404).json({
        status: false,
        message: "We couldn't find that subscription. Please subscribe again.",
      });
    }

    // A confirmation link that outlived an unsubscribe must not undo the
    // unsubscribe. Re-subscribing goes through the footer form, which puts the
    // row back to pending and issues a fresh link.
    if (doc.status === "unsubscribed") {
      return res.status(409).json({
        status: false,
        message: "You unsubscribed from this list. Subscribe again to rejoin.",
      });
    }

    const confirmed = await SubscriberModel.findByIdAndUpdate(
      doc._id,
      { status: "active", confirmedAt: new Date() },
      { returnDocument: "after" }
    );

    res.json({ status: true, data: { email: confirmed.email } });
  } catch (error) {
    fail(res, error);
  }
};

// Deliberately idempotent: unsubscribing twice, or clicking a very old link, is
// a 200 rather than an error. It is a one-way request and there is nothing to
// retry.
export const unsubscribePublicSubscriber = async (req, res) => {
  const email = verifySubscriberToken(field(req.body.token, 2000), "unsubscribe");

  if (!email) {
    return badToken(res);
  }

  try {
    const doc = await SubscriberModel.findOneAndUpdate(
      { email },
      { status: "unsubscribed", unsubscribedAt: new Date() },
      { returnDocument: "after" }
    );

    if (!doc) {
      return res.status(404).json({
        status: false,
        message: "We couldn't find that subscription — you may already be off the list.",
      });
    }

    res.json({ status: true, data: { email: doc.email } });
  } catch (error) {
    fail(res, error);
  }
};
