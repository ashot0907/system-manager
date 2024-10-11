#!/bin/bash

# Navigate to the 'src' directory first
cd src || { echo "Directory 'src' not found"; exit 1; }

# Get the system's IP address (adjust the interface if necessary)
IP_ADDRESS=$(ifconfig en0 | grep 'inet ' | awk '{print $2}')

# Specify the directory where the files are located (you can change this to a specific directory)
DIRECTORY="."

# Find and replace 'localhost' with the system IP in all files (force LC_ALL to handle encoding issues)
find "$DIRECTORY" -type f -exec bash -c 'LC_ALL=C sed -i.bak "s/localhost/$0/g" "$1"' "$IP_ADDRESS" {} \;

# Remove .bak files created by sed (backup files)
find "$DIRECTORY" -name "*.bak" -type f -delete

echo "All instances of 'localhost' have been replaced with $IP_ADDRESS in directory $DIRECTORY and its subdirectories."
