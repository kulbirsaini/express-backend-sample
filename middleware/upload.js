import multer, { MulterError } from "multer";

const MAX_VIDEO_SIZE = 25.1 * 1024 * 1024;
const MAX_IMAGE_SIZE = 1.1 * 1024 * 1024;

export const uploadMiddlewareGenerator = (fields) => {
  const func = (req, res, next) => {
    const upload = multer({
      fileFilter: (req, file, cb) => {
        if (file.fieldname === "thumbnail") {
          if (file.size > MAX_IMAGE_SIZE) {
            cb(new Error("Image must not exceed 1 MB in size."));
          }

          if (!["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"].includes(file.mimetype)) {
            cb(new Error("We support images in JPG, JPEG, PNG, GIF, and WebP formats only."));
          }
        } else if (file.fieldname === "video") {
          if (file.size > MAX_VIDEO_SIZE) {
            cb(new Error("Video must not exceed 25 MB in size."));
          }

          if (!["video/mp4"].includes(file.mimetype)) {
            cb(new Error("We support videos in MP4 format only."));
          }
        } else {
          cb(new Error("Unexpected file input."));
        }

        cb(null, true);
      },
    }).fields(fields);

    upload(req, res, (error) => {
      if (error instanceof MulterError) {
        // A Multer error occurred when uploading!
        console.error("Multer", error);
        return res.status(422).json({ message: "Invalid file format or file too large." });
      } else if (error) {
        return next(error);
      }

      next();
    });
  };

  return func;
};
