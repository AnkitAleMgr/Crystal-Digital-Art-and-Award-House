import { ALLOWED_FOLDERS, uploadImage } from "../../claudinery/claudineryService.js";
import {
  singleImage,
  uploadErrorHandler,
} from "../../middleware/imageUpload.js";

// Multer step of POST /admin/upload: accepts one `image` part, type-filtered and
// capped by middleware/imageUpload.js (memory storage, nothing hits disk).
export const uploadImageHandler = singleImage("image");

// Sends the buffer to Cloudinary under a whitelisted folder (`folder` is a body
// field, so anything not in ALLOWED_FOLDERS falls back to "misc" rather than
// letting a caller pick an arbitrary path). Answers 503 when the CLOUDINARY_*
// env vars are missing instead of throwing a confusing SDK error.
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

export { uploadErrorHandler };
