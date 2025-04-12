import Media from '../models/Media';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../helpers/redisClient';
import { uploadToStorage, uploadThumbnailToStorage } from '../helpers/awsStorage';

const CACHE_DURATION = 60; // seconds

export class MediaService {
  /**
   * Creates a new media record.
   * @param file The uploaded file (from Multer).
   * @returns The saved media document.
   * @throws Error if file is missing or any error occurs.
   */
  public async createMedia(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new Error('No file uploaded.');
    }

    // Destructure file properties
    const { originalname, mimetype, buffer } = file;
    const uniqueId = uuidv4();
    const originalFilename = `${uniqueId}-${originalname}`;

    // Upload the original image to S3
    const originalUrl = await uploadToStorage(buffer, originalFilename, mimetype);

    // Extract image metadata using sharp
    const metadata = await sharp(buffer).metadata();

    // Generate thumbnail (150x150)
    const thumbnailBuffer = await sharp(buffer)
      .resize(150, 150)
      .toBuffer();
    const thumbnailFilename = `${uniqueId}-thumbnail-${originalname}`;
    const thumbnailUrl = await uploadThumbnailToStorage(
      thumbnailBuffer,
      thumbnailFilename,
      mimetype
    );

    // Create a new media document in MongoDB
    const mediaDoc = new Media({
      originalFilename: originalname,
      mimeType: mimetype,
      width: metadata.width,
      height: metadata.height,
      originalUrl,
      thumbnailUrl,
    });

    const savedMedia = await mediaDoc.save();

    // Invalidate the cache for GET /media list
    await redisClient.del('media:all');

    return savedMedia;
  }

  /**
   * Retrieves all media records from MongoDB, with caching via Redis.
   */
  public async getAllMedia(): Promise<any> {
    const cacheKey = 'media:all';
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const mediaList = await Media.find();
    await redisClient.setEx(cacheKey, CACHE_DURATION, JSON.stringify(mediaList));
    return mediaList;
  }

  /**
   * Retrieves a specific media record by id, with caching.
   * @param id The media document id.
   */
  public async getMediaById(id: string): Promise<any> {
    const cacheKey = `media:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const media = await Media.findById(id);
    if (!media) {
      throw new Error('Media not found.');
    }

    await redisClient.setEx(cacheKey, CACHE_DURATION, JSON.stringify(media));
    return media;
  }

  /**
   * Returns the URL for the original image.
   * @param id The media document id.
   */
  public async getOriginalUrl(id: string): Promise<string> {
    const media = await Media.findById(id);
    if (!media) {
      throw new Error('Media not found.');
    }
    return media.originalUrl;
  }

  /**
   * Returns the URL for the thumbnail image.
   * @param id The media document id.
   */
  public async getThumbnailUrl(id: string): Promise<string> {
    const media = await Media.findById(id);
    if (!media) {
      throw new Error('Media not found.');
    }
    return media.thumbnailUrl;
  }
}