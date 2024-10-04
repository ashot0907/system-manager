#!/bin/bash

# Run all commands with superuser privileges
sudo bash -c '
# Navigate to the backend directory
cd backend

# Start the Node server
sudo node server.js &

# Start the Express server
sudo node Express.js &

# Navigate back to the parent directory
cd ..

# Start the application on PORT 222
PORT=222 npm start &
'
