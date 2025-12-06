# Use official Node.js LTS image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Compile contracts
RUN npx hardhat compile

# Default command runs the test suite
CMD ["npx", "hardhat", "test"]
