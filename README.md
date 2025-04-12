# Backend Image Processing API

## Overview

This project is a Node.js/TypeScript API for image processing that provides endpoints for image uploads, processing, storage, and retrieval. The application uses AWS S3 for file storage, MongoDB (via Mongoose) for data persistence, and Redis for caching—all wrapped in a Dockerized environment.

## Technology Stack

- **Node.js** – JavaScript runtime
- **Express.js** – Web framework for building APIs
- **TypeScript** – Typed superset of JavaScript
- **Mongoose** – MongoDB ODM (Object Data Modeling)
- **Redis** – In-memory datastore for caching
- **AWS SDK v3** – For interacting with AWS S3
- **Multer** – Middleware for handling multipart/form-data (file uploads)
- **Sharp** – High-performance image processing library
- **UUID** – For generating unique identifiers
- **dotenv** – For loading environment variables
- **nodemon** – For automatic restarts in development
- **Docker & Docker Compose** – For containerization and service orchestration

## Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **Docker** and **Docker Compose** (for containerized setup)
- An **AWS Account** (for S3 storage)
- A **MongoDB** and **Redis** instance (if not using Docker)

### AWS S3 Setup

1. **Create an AWS Account:**
   - Sign up or log in to the [AWS Management Console](https://aws.amazon.com/).

2. **Create an S3 Bucket:**
   - In the AWS Console, navigate to **S3**.
   - Click **Create bucket** and provide a **unique bucket name** (e.g., `my-image-processing-bucket`).
   - Choose an appropriate region.
   - Under **Object Ownership**, change the setting to a mode that allows ACLs (e.g., _Bucket owner preferred_) because code uses ACLs (setting `public-read` on uploaded objects).
   - Complete the bucket creation process.
   - Disable Block Public Access settings (or configuring them to allow public read access).

3. **Create an IAM User with S3 Permissions:**
   - In the AWS Console, go to **IAM** and create a new user.
   - Enable **Programmatic access**.
   - Attach a policy that grants the necessary S3 permissions. For development you can use **AmazonS3FullAccess** (for production, create a custom policy with only the permissions you require).
   - **Save the Access Key ID and Secret Access Key.**

### Environment Variables

1. **.env Setup:**
   - Create a file named `.env` at the root of the repository.
   
2. **.env.example:**
   - A `.env.example` file is included in this repository. Use it as a template for your own `.env` file.
   - When running **locally** (without Docker) you might use:
     ```env
     # MongoDB and Redis locally
     MONGO_URI=mongodb://localhost:27017/mediaDB
     REDIS_URL=redis://localhost:6379
     ```
   - When using **Docker**, update these values to reference the container service names:
     ```env
     # MongoDB and Redis in Docker Compose
     MONGO_URI=mongodb://mongo:27017/mediaDB
     REDIS_URL=redis://redis:6379
     ```
   - Example content for `.env`:
     ```env
     # AWS S3 Configuration
     AWS_ACCESS_KEY_ID=your_aws_access_key_id
     AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
     AWS_REGION=your_aws_region        # e.g., us-east-1
     AWS_S3_BUCKET_NAME=your_bucket_name
     
     # MongoDB Connection
     # For local development: mongodb://localhost:27017/mediaDB
     # For Docker: mongodb://mongo:27017/mediaDB
     MONGO_URI=mongodb://mongo:27017/mediaDB

     # Redis Connection
     # For local development: redis://localhost:6379
     # For Docker: redis://redis:6379
     REDIS_URL=redis://redis:6379

     # Node Environment
     NODE_ENV=development
     ```
     
   - Copy `.env.example` to `.env` and update the placeholder values with your actual credentials and settings.

### Install Dependencies

Run the following command to install the required Node.js packages:
```bash
npm install
```

### Build the Application
Compile the TypeScript files into the dist folder by running:
```bash
npm run build
```

### Running Instructions

#### Running in Development Mode
For development, you can run the application with live-reload using nodemon:

```bash
npm run dev
```
**Important:** When running locally (without Docker), ensure that both MongoDB and Redis are running on your machine.

MongoDB should be available at the URL specified in your .env (e.g., mongodb://localhost:27017/mediaDB).

Redis is required to run the application locally. If you are not using Docker, you must install and run a Redis server locally (default URL: redis://localhost:6379).

#### Running with Docker Compose
The repository includes a Dockerfile and a docker-compose.yml that containerize the application along with MongoDB and Redis.

Build and Start Containers:

```bash
docker compose up --build
```
Access the Application:
The API will be accessible at http://localhost:3000.
MongoDB is available internally at mongodb://mongo:27017/mediaDB.
Redis is accessible at redis://redis:6379.

#### API Endpoints
**POST /media**
Upload an image file. The request should use multipart/form-data with the key image.
Error Handling: Returns a friendly error if more than one image or a non-image file is uploaded.

**GET /media**
Returns a JSON array of metadata for all uploaded images (with Redis caching).

**GET /media/:id**
Returns JSON metadata for a specific image.

**GET /media/:id/file**
Serves or redirects to the original image file.

**GET /media/:id/thumbnail**
Serves or redirects to the thumbnail image file.