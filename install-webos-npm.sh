#!/bin/bash

# Navigate to the root directory and install dependencies
echo "Running npm install in the root directory..."
npm install

# Navigate to the backend directory
echo "Changing to the backend directory..."
cd backend || { echo "Backend directory not found!"; exit 1; }

# Install backend dependencies
echo "Running npm install in the backend directory..."
npm install

# Go back to the root directory
echo "Returning to the root directory..."
cd ..

echo "Setup completed!"
