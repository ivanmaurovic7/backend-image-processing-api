# Use an official Node.js runtime as a parent image.
FROM node:18-alpine

# Set the working directory in the container.
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available).
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the application (assuming you have a build script in package.json that compiles TypeScript).
RUN npm run build

# Expose the port the app runs on.
EXPOSE 3000

# Define the command to run your app using the built code.
CMD ["node", "dist/app.js"]