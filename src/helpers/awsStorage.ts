import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Buffer } from 'buffer';

// Configure the S3 client with your region and credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Define your S3 bucket name, e.g., from an environment variable.
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'your-bucket-name';

/**
 * Uploads the original image buffer to S3 and returns its public URL.
 *
 * @param buffer - The file's buffer content.
 * @param filename - A unique filename for the file.
 * @param mimeType - The MIME type of the file.
 * @returns A Promise that resolves to the public URL of the uploaded file.
 */
export const uploadToStorage = async (
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> => {
  const key = `uploads/${filename}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  // Construct the public URL for the uploaded object.
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
};

/**
 * Uploads the thumbnail image buffer to S3 and returns its public URL.
 *
 * @param buffer - The file's thumbnail buffer content.
 * @param filename - A unique filename for the thumbnail.
 * @param mimeType - The MIME type of the thumbnail image.
 * @returns A Promise that resolves to the public URL of the uploaded thumbnail.
 */
export const uploadThumbnailToStorage = async (
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> => {
  const key = `uploads/thumbnails/${filename}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
};