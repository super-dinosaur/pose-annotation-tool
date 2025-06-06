#!/bin/bash

# Quick test script to check for compilation errors
echo "🔍 Checking for compilation errors..."

cd /Users/franky/Documents/code/labelme-full-stack/frontend

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js and npm."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server (will stop after 10 seconds)..."

# Start npm start in background
npm start &
NPM_PID=$!

# Wait for 10 seconds to see if there are compilation errors
sleep 10

# Kill the process
kill $NPM_PID 2>/dev/null

echo "✅ Check complete!"
