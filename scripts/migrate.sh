#!/bin/bash

# Migration script for labelme-full-stack frontend refactoring
# This script helps migrate from the original frontend to the refactored version

set -e

echo "🚀 Starting migration to refactored frontend..."

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "frontend-refactored" ]; then
    echo "❌ Error: Please run this script from the labelme-full-stack root directory"
    echo "   Make sure both 'frontend' and 'frontend-refactored' directories exist"
    exit 1
fi

# Step 1: Backup original frontend
echo "📦 Step 1: Creating backup of original frontend..."
if [ -d "frontend.backup" ]; then
    echo "⚠️  Backup already exists. Removing old backup..."
    rm -rf frontend.backup
fi
cp -r frontend frontend.backup
echo "✅ Backup created: frontend.backup"

# Step 2: Install dependencies in refactored version
echo "📦 Step 2: Installing dependencies in refactored version..."
cd frontend-refactored
npm install
echo "✅ Dependencies installed"

# Step 3: Test the refactored version
echo "🧪 Step 3: Testing refactored version..."
echo "Starting development server... (This will open in a new terminal)"
echo "Please test the application and press any key when ready to continue..."

# Run npm start in background and capture PID
npm start &
NPM_PID=$!

# Wait for user input
read -n 1 -s -r -p "Press any key to continue after testing..."
echo ""

# Kill the npm start process
kill $NPM_PID 2>/dev/null || true
echo "✅ Development server stopped"

cd ..

# Step 4: Replace original with refactored
echo "🔄 Step 4: Replacing original frontend with refactored version..."
rm -rf frontend
mv frontend-refactored frontend
echo "✅ Migration completed!"

echo ""
echo "🎉 Migration successful!"
echo ""
echo "Next steps:"
echo "1. cd frontend"
echo "2. npm start"
echo ""
echo "📋 What was improved:"
echo "   ✨ Better code organization with feature-based structure"
echo "   🎯 Single responsibility components"
echo "   🔄 Centralized state management"
echo "   📈 Performance optimizations"
echo "   🧪 Better testability"
echo "   📚 Comprehensive documentation"
echo ""
echo "🔄 If you need to rollback:"
echo "   rm -rf frontend && mv frontend.backup frontend"
echo ""
echo "🎯 Happy coding!"
