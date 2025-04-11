// src/controllers/mediaController.ts
import { Request, Response, NextFunction } from 'express';
import Media from '../models/Media';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../helpers/redisClient';
import { uploadToStorage, uploadThumbnailToStorage } from '../helpers/awsStorage';

// Caching duration in seconds
const CACHE_DURATION = 60; // 1 minute

export const createMedia = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }
  try {
    const { originalname, mimetype, buffer } = req.file;
    const uniqueId = uuidv4();
    const originalFilename = `${uniqueId}-${originalname}`;

    // Upload original image using AWS SDK (see previous AWS integration example)
    const originalUrl = await uploadToStorage(buffer, originalFilename, mimetype);

    // Extract image metadata using sharp
    const metadata = await sharp(buffer).metadata();

    // Generate a 150x150 thumbnail and get its buffer
    const thumbnailBuffer = await sharp(buffer)
      .resize(150, 150)
      .toBuffer();
    const thumbnailFilename = `${uniqueId}-thumbnail-${originalname}`;
    const thumbnailUrl = await uploadThumbnailToStorage(thumbnailBuffer, thumbnailFilename, mimetype);

    // Create new Media document in MongoDB
    const mediaDoc = new Media({
      originalFilename: originalname,
      mimeType: mimetype,
      width: metadata.width,
      height: metadata.height,
      originalUrl,
      thumbnailUrl,
    });

    const savedMedia = await mediaDoc.save();
    
    // Invalidate / update any cache (if necessary) for GET /media
    await redisClient.del('media:all');

    res.status(201).json(savedMedia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while processing image.' });
  }
};

export const getAllMedia = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if the media list is cached
    const cachedData = await redisClient.get('media:all');
    if (cachedData) {
      console.log('Serving from cache.');
      res.json(JSON.parse(cachedData));
      return;
    }

    const media = await Media.find();
    // Store in Redis and set an expiration time
    await redisClient.setEx('media:all', CACHE_DURATION, JSON.stringify(media));

    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving media.' });
  }
};

export const getMediaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `media:${req.params.id}`;
    // Check if the media object is cached
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      console.log('Serving from cache.');
      res.json(JSON.parse(cachedData));
      return;
    }

    const media = await Media.findById(req.params.id);
    if (!media) {
      res.status(404).json({ error: 'Media not found.' });
      return;
    }
    // Cache the result
    await redisClient.setEx(key, CACHE_DURATION, JSON.stringify(media));

    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving media.' });
  }
};

export const serveOriginalFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      res.status(404).json({ error: 'Media not found.' });
      return;
    }
    res.redirect(media.originalUrl);
  } catch (error) {
    res.status(500).json({ error: 'Error serving original file.' });
  }
};

export const serveThumbnail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      res.status(404).json({ error: 'Media not found.' });
      return;
    }
    res.redirect(media.thumbnailUrl);
  } catch (error) {
    res.status(500).json({ error: 'Error serving thumbnail.' });
  }
};