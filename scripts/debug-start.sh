#!/bin/bash

echo "Starting React App with debugging enabled..."
echo "================================================"
echo ""
echo "Debugging steps:"
echo "1. Open Chrome DevTools (F12)"
echo "2. Go to Console tab to see debug logs"
echo "3. Go to Sources tab to set breakpoints"
echo "4. Look for these key debug messages:"
echo "   - [VideoUpload] File selected"
echo "   - [AppHeader] handleVideoUpload called"
echo "   - [AppContext] setVideoSrc called"
echo "   - [AppContext] Action dispatched: SET_VIDEO_SRC"
echo "   - [useVideoFrame] Video source effect"
echo ""
echo "5. Use the Video Test Controls panel on the left to test"
echo "6. Use the Debug Panel on the right to inspect state"
echo ""
echo "================================================"

cd /Users/franky/Documents/code/labelme-full-stack/frontend
npm start
