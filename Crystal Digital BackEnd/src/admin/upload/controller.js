import multer from "multer";
import { ALLOWED_FOLDERS, uploadImage } from "../../claudinery/claudineryService.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      const error = new Error(
        "Unsupported file type. Allowed: JPG, PNG, WebP, AVIF, GIF."
      );
      error.status = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

export const uploadImageHandler = upload.single("image");

export const uploadImageController = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: false,
      message: "No image file provided. Send it as multipart/form-data under the 'image' field.",
    });
  }

  const folder = ALLOWED_FOLDERS.includes(req.body?.folder)
    ? req.body.folder
    : undefined;

  const uploaded = await uploadImage(req.file.buffer, {
    folder,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  return res.status(201).json({ status: true, data: uploaded });
};

export const uploadErrorHandler = (error, _req, res, next) => {
  if (!error) {
    return next();
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        status: false,
        message: "Image is larger than the 5MB limit.",
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
