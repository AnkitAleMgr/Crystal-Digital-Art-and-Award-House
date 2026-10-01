import { ALLOWED_FOLDERS, uploadImage } from "../../claudinery/claudineryService.js";
import {
  singleImage,
  uploadErrorHandler,
} from "../../middleware/imageUpload.js";

export const uploadImageHandler = singleImage("image");

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
