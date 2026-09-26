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

export const ALLOWED_FOLDERS = ["products", "gallery", "testimonials"];

const MAX_WIDTH = 1600;

export const uploadImage = async (buffer, { folder, filename, mimetype } = {}) => {
  if (!isConfigured) {
    const error = new Error(
      "Image uploads are not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET."
    );
    error.status = 503;
    throw error;
  }

  const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : "misc";
  const type = mimetype && mimetype.startsWith("image/") ? mimetype : "image/png";
  const name = (filename || "file").replace(/\.[^/.]+$/, "") || "file";

  const dataUri = `data:${type};base64,${buffer.toString("base64")}`;

  let result;

  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder: `${ROOT_FOLDER}/${safeFolder}`,
      public_id: name,
      resource_type: "image",
      overwrite: false,
      transformation: [{ width: MAX_WIDTH, crop: "limit" }],
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

// Cloudinary delivery transforms belong in the URL *path*, not the query
// string. "?f_auto&q_auto" is ignored and serves the original upload; the
// working form is /image/upload/f_auto,q_auto/<version>/<public_id>.
export const deliveryUrl = (url) => {
  if (!url || !url.includes("/upload/") || url.includes("/upload/f_auto,")) {
    return url;
  }

  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};
