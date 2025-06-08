#!/bin/bash

# Navigate to frontend directory
cd /Users/franky/Documents/code/labelme-full-stack/frontend

# Kill any existing node processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clear cache
rm -rf node_modules/.cache
npm cache clean --force

# Start the application
echo "Starting the application..."
npm start
