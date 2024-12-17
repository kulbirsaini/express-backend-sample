import multer, { MulterError } from "multer";

export const uploadMiddlewareGenerator = (fields, limits = {}) => {
  const func = (req, res, next) => {
    const upload = multer({
      limits: {
        fieldSize: 10 * 1024 * 1024,
        fileSize: 10 * 1024 * 1024,
        ...limits,
      },
    }).fields(fields);

    upload(req, res, (error) => {
      if (error instanceof MulterError) {
        // A Multer error occurred when uploading!
        return res.status(422).json({ message: "An error occurred while uploading files" });
      } else if (error) {
        return next(error);
      }

      next();
    });
  };

  return func;
};
