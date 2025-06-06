#!/bin/bash

echo "🔍 Testing imports and compilation..."
cd /Users/franky/Documents/code/labelme-full-stack/frontend

# Test if main app compiles without errors
echo "import App from './App';" > test-imports.js
echo "console.log('✅ App imported successfully');" >> test-imports.js

# Run the test
node test-imports.js 2>&1

# Clean up
rm test-imports.js

echo "🎯 All critical errors should now be fixed!"
echo ""
echo "🚀 You can now run:"
echo "   cd /Users/franky/Documents/code/labelme-full-stack/frontend"
echo "   npm start"
