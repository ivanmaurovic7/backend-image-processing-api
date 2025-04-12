import { Request, Response, NextFunction } from 'express';
import { MediaService } from '../services/MediaService';

const mediaService = new MediaService();

export const createMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }
    const savedMedia = await mediaService.createMedia(req.file);
    res.status(201).json(savedMedia);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message || 'Server error while processing image.' });
    }
  }
};

export const getAllMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const mediaList = await mediaService.getAllMedia();
    res.json(mediaList);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving media.' });
  }
};

export const getMediaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await mediaService.getMediaById(req.params.id);
    res.json(media);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message === 'Media not found.') {
        res.status(404).json({ error: error.message });
        return;
      }
    } 
    res.status(500).json({ error: 'Error retrieving media.' });
  }
};

export const serveOriginalFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const originalUrl = await mediaService.getOriginalUrl(req.params.id);
    res.redirect(originalUrl);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message === 'Media not found.') {
        res.status(404).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Error serving original file.' });
  }
};

export const serveThumbnail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const thumbnailUrl = await mediaService.getThumbnailUrl(req.params.id);
    res.redirect(thumbnailUrl);
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      if (error.message === 'Media not found.') {
        res.status(404).json({ error: error.message });
        return;
      }
    }
    res.status(500).json({ error: 'Error serving thumbnail.' });
  }
};