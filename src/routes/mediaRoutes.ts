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
router.post('/media', fileUploadValidation, createMedia);
router.get('/media', getAllMedia);
router.get('/media/:id', getMediaById);
router.get('/media/:id/file', serveOriginalFile);
router.get('/media/:id/thumbnail', serveThumbnail);

export default router;