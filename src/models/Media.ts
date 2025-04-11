import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  originalFilename: string;
  uploadTimestamp: Date;
  mimeType: string;
  width?: number;
  height?: number;
  originalUrl: string;
  thumbnailUrl: string;
}

const MediaSchema: Schema = new Schema({
  originalFilename: { type: String, required: true },
  uploadTimestamp: { type: Date, default: Date.now },
  mimeType: { type: String, required: true },
  width: { type: Number },
  height: { type: Number },
  originalUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true }
});

export default mongoose.model<IMedia>('Media', MediaSchema);