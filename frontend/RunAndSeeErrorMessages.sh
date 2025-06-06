#!/bin/bash
npm start &
NPM_PID=$!

# Wait for user input
read -n 1 -s -r -p "Press any key to continue after testing..."
echo ""

# Kill the npm start process
kill $NPM_PID 2>/dev/null || true
echo "✅ Development server stopped"
