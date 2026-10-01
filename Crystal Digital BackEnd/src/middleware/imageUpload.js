import multer from "multer";

// The one definition of "what counts as an acceptable image upload" and how big
// it may be. Both upload entry points — the admin's /admin/upload and the public
// POST /api/quotes — build their multer instance from here, so the allowlist and
// the size cap cannot drift apart between an admin image and a customer's
// artwork.
//
// SVG is deliberately absent. It is a script-injection vector: an <svg> can carry
// <script>, and anything that renders it (a browser tab, some image proxies,
// email clients) would execute it. The raster formats below have no equivalent.

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const upload = multer({
  // memoryStorage, not disk: the buffer is handed straight to Cloudinary and
  // nothing should be written to the server's filesystem. The trade-off is RAM
  // held for the length of one request, which is why the size cap is enforced
  // here rather than left to Cloudinary.
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      const error = new Error("Unsupported file type. Allowed: JPG, PNG, WebP, AVIF, GIF.");
      error.status = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

// Same size cap, but no type filter, so the caller can decide what to do with a
// file it does not like.
//
// This exists for POST /api/quotes. Rejecting the whole submission because the
// artwork was a PDF would throw away a real enquiry over its attachment — and a
// PDF is a perfectly normal thing for a customer to send artwork as. The quote
// controller takes the file, checks the mimetype itself, and stores the quote
// with the filename alone if it is not an image.
const anyFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
});

export const singleImage = (field) => upload.single(field);

export const singleAnyFile = (field) => anyFile.single(field);

// Error handler for the public quote route, where an unusable attachment must
// NOT cost the customer their enquiry.
//
// uploadErrorHandler answers 4xx, which is right for /admin/upload — but on a
// quote it would mean a 6MB logo or an over-cap stream discards the name, email
// and message along with it. This logs the reason, marks the request and carries
// on to the controller, which saves the quote with the filename only.
//
// The text fields survive because the browser appends them to the FormData
// before the file, so multer has already parsed them by the time the file stream
// is aborted.
export const artworkUploadFallback = (error, req, _res, next) => {
  if (!error) {
    return next();
  }

  // A partial req.file would be uploaded with truncated bytes.
  delete req.file;
  req.artworkUploadError = error.message;

  console.warn(`[quotes] artwork not stored: ${error.message}`);

  next();
};

export const uploadErrorHandler = (error, _req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        status: false,
        message: `Image is larger than the ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))}MB limit.`,
      });
    }

    return res.status(400).json({
      status: false,
      message: `Upload failed: ${error.message}`,
    });
  }

  if (error.status) {
    return res.status(error.status).json({
      status: false,
      message: error.cloudinaryError
        ? `Cloudinary rejected the upload: ${error.message}`
        : error.message,
    });
  }

  console.error("Upload error:", error);

  return res.status(500).json({
    status: false,
    message: "Image upload failed",
  });
};
