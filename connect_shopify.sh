#!/bin/bash
cd /Users/ayushgupta/Documents/Nekxuz

echo "------------------------------------------------"
echo "Nekxuz x Shopify Integration Setup"
echo "------------------------------------------------"

# Install Shopify CLI if not present
if ! command -v shopify &> /dev/null; then
    echo "Installing Shopify CLI..."
    npm install -g @shopify/cli
fi

echo "Please log in to your Shopify Partner account..."
shopify auth login

echo "------------------------------------------------"
echo "Success! You are logged in."
echo "To complete integration, ensure your Storefront Access Token"
echo "is updated in src/App.js"
echo "------------------------------------------------"