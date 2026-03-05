#!/bin/bash
# Navigate to project directory
cd /Users/ayushgupta/Documents/Nekxuz

# Install dependencies including the new shopify-buy package
echo "Installing dependencies..."
npm install
npm install shopify-buy

# Start the development server
echo "Starting development server..."
npm start