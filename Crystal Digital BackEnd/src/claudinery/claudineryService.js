// The only place the Cloudinary SDK is talked to (the folder name typo in
// "claudinery" is deliberate/kept). The env vars are read at import time, so a
// newly added CLOUDINARY_* key needs a server restart to take effect — and with
// none set, isConfigured is false and every operation answers no-ops/503s
// instead of throwing SDK errors.
import { v2 as cloudinary } from "cloudinary";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

export const isConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const ROOT_FOLDER = "crystal-digital";

// Folder whitelist for caller-supplied `folder` values; anything else lands in
// "misc". Keeps a caller from writing into an arbitrary Cloudinary path.
export const ALLOWED_FOLDERS = ["products", "gallery", "testimonials", "quote-artwork"];

const MAX_WIDTH = 1600;

// Only [a-z0-9_-] survives. A caller-supplied public_id becomes part of a URL that
// anyone can request, so anything that could carry a path separator, a query
// string or a percent-escape is stripped rather than escaped.
const SAFE_ID = /[^a-z0-9_-]+/g;

// Uploads one image and returns { url, publicId, width, height, bytes, format }.
// Throws an error carrying `.status` (503 when unconfigured, 400/502 when
// Cloudinary refuses) so callers can answer it directly.
export const uploadImage = async (
  buffer,
  { folder, filename, mimetype, publicId, maxWidth = MAX_WIDTH } = {}
) => {
  if (!isConfigured) {
    const error = new Error(
      "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
    error.status = 503;
    throw error;
  }

  const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "misc";
  const type = mimetype && mimetype.startsWith("image/") ? mimetype : "image/png";

  // A caller-supplied public_id wins over the filename. That is how customer
  // artwork gets an unpredictable name instead of "logo-final.png", which would
  // be guessable by anyone enumerating the folder.
  const explicitId = String(publicId ?? "").toLowerCase().replace(SAFE_ID, "-").replace(/^-+|-+$/g, "");

  const name =
    explicitId ||
    (filename || "file").replace(/\.[^/.]+$/, "").toLowerCase().replace(SAFE_ID, "-") ||
    "file";

  // Sent as a base64 data URI, NOT as a Buffer and NOT through upload_stream:
  // cloudinary@2.11.0 calls path.basename() on a Buffer argument (throws
  // ERR_INVALID_ARG_TYPE) and its upload_stream callback path fails with
  // "TypeError: callback is not a function". This is the only combination
  // verified working — do not "fix" it back to a stream or a raw buffer.
  const dataUri = `data:${type};base64,${buffer.toString("base64")}`;

  let result;

  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder: `${ROOT_FOLDER}/${safeFolder}`,
      public_id: name,
      resource_type: "image",
      overwrite: false,
      // maxWidth: 0 means "keep the original pixels". Customer artwork uses
      // that: a print-ready logo is routinely wider than MAX_WIDTH and silently
      // downscaling it would destroy the exact detail the admin needs to judge.
      ...(maxWidth ? { transformation: [{ width: maxWidth, crop: "limit" }] } : {}),
    });
  } catch (error) {
    const wrapped = new Error(
      error.error?.message || error.message || "Cloudinary rejected the upload"
    );
    wrapped.status = error.http_code === 401 || error.http_code === 403 ? 502 : 400;
    wrapped.cloudinaryError = true;
    throw wrapped;
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
  };
};

// Destroys one asset. Never throws: a failed cleanup is logged and returned as
// { error }, or { skipped } when unconfigured/unknown — the caller has already
// finished the user-facing part of its job by then.
export const deleteImage = async (publicId) => {
  if (!isConfigured || !publicId) {
    return { skipped: true };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
    return { error: error.message };
  }
};
