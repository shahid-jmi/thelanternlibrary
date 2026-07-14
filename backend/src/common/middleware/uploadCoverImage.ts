import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import ValidationError from '../errors/ValidationError.js';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(new ValidationError('Only JPG, PNG, or WEBP images are allowed'));
      return;
    }

    cb(null, true);
  },
}).single('coverImage');

const uploadCoverImage = (req: Request, res: Response, next: NextFunction): void => {
  upload(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }

    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      next(new ValidationError('Image must be 2MB or smaller'));
      return;
    }

    next(err);
  });
};

export default uploadCoverImage;
