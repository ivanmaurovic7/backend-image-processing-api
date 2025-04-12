import express from 'express';
import multer from 'multer';
import {
  createMedia,
  getAllMedia,
  getMediaById,
  serveOriginalFile,
  serveThumbnail
} from '../controllers/mediaController';
import { fileUploadValidation } from '../middlewares/fileUploadValidation';

const router = express.Router();

// Define routes according to the requirements.
router.post('/', fileUploadValidation, createMedia);
router.get('/', getAllMedia);
router.get('/:id', getMediaById);
router.get('/:id/file', serveOriginalFile);
router.get('/:id/thumbnail', serveThumbnail);

export default router;