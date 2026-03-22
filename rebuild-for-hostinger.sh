#!/bin/bash

# 🔧 Nekxuz Frontend Rebuild Script for Hostinger
# This script rebuilds the React app with the correct API URL

cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"

echo "📦 Installing React build tools..."
npm install --save-dev react-scripts react react-dom

echo "🔨 Building frontend with API URL: https://api.nekxuz.in"
npm run build

echo "✅ Build complete! New 'build' folder created."
echo "📤 Next step: Upload the 'build' folder contents to Hostinger public_html"
