// src/middleware/uploadMiddleware.ts
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';

// Use memory storage (or configure as needed)
const storage = multer.memoryStorage();

// File filter to allow only image MIME types
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Pass an error to the callback – Multer will pass this error to our middleware.
    cb(new Error('Invalid file type. Only images are allowed.'));
  }
};

// Configure multer with storage, file filter, and limits (allow only 1 file)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 1 // Limit to one file only
  }
});

// Middleware function for processing a single image upload
export const fileUploadValidation = (req: Request, res: Response, next: NextFunction) => {
  // Note: We're using upload.array with a limit of one file.
  upload.array('image', 1)(req, res, (err: any) => {
    if (err) {
      // If more than one file is uploaded, Multer may return an error code for file limit
      if (err.code === 'LIMIT_FILE_COUNT') {
        res.status(400).json({
          error: 'Only one image is allowed. Please upload a single image.'
        });
        return;
      }
      // Handle file filter error or other Multer-related errors
      res.status(400).json({ error: err.message || 'File upload error.' });
      return;
    }

    // Ensure that a file was uploaded
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No image file was uploaded.' });
      return;
    }

    req.file = files[0];
    next();
  });
};