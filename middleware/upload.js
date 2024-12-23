import multer, { MulterError } from "multer";

export const uploadMiddlewareGenerator = (fields, limits = {}) => {
  const func = (req, res, next) => {
    const upload = multer({
      limits: {
        fieldSize: 25 * 1024 * 1024,
        fileSize: 25 * 1024 * 1024,
        ...limits,
      },
    }).fields(fields);

    upload(req, res, (error) => {
      if (error instanceof MulterError) {
        // A Multer error occurred when uploading!
        return res.status(422).json({ message: "Invalid file format or file too large." });
      } else if (error) {
        return next(error);
      }

      next();
    });
  };

  return func;
};
