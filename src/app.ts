import express from 'express';
import mongoose from 'mongoose';
import mediaRoutes from './routes/mediaRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.APP_PORT || 3000;

// Middleware to parse JSON requests if needed.
app.use(express.json());

// Mount the media routes.
app.use('/', mediaRoutes);

// Replace with your actual MongoDB connection string.
const mongoURL = process.env.MONGO_URL || 'mongodb://mongo:27017/mediaDB';

mongoose.connect(mongoURL)
.then(() => {
  console.log('Connected to MongoDB');
  // Start the server once the DB connection is established.
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})
.catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});