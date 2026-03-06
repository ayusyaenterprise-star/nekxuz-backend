#!/bin/bash

# Nekxuz Hostinger Automated Deploy Script
# Usage: ./deploy-hostinger.sh

set -e

# Configuration
REMOTE_USER="u875570433"
REMOTE_HOST="89.117.27.154"
REMOTE_PORT="65002"
REMOTE_PATH="/home/${REMOTE_USER}/public_html"
LOCAL_BUILD="./build_hostinger"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Nekxuz Hostinger Deployment"
echo "================================"

# Check if build exists
if [ ! -d "$LOCAL_BUILD" ]; then
    echo "❌ Error: $LOCAL_BUILD not found"
    echo "📝 Run: npm run build && cp -r build build_hostinger"
    exit 1
fi

# Calculate size
BUILD_SIZE=$(du -sh "$LOCAL_BUILD" | cut -f1)
echo "📦 Build size: $BUILD_SIZE"
echo "📁 Files: $(find $LOCAL_BUILD -type f | wc -l)"

# Create backup on remote
echo "📦 Creating backup on Hostinger..."
ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST "cd /home/$REMOTE_USER && mv public_html public_html.backup.$TIMESTAMP || true"

# Upload build
echo "⬆️  Uploading to Hostinger..."
scp -r -P $REMOTE_PORT "$LOCAL_BUILD"/* "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"

# Verify
echo "✅ Verifying deployment..."
ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST "ls -lh /home/$REMOTE_USER/public_html/index.html"

echo ""
echo "================================"
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Test your site:"
echo "   https://nekxuz.in"
echo ""
echo "📊 Check health:"
echo "   curl https://nekxuz-backend-oqcn.onrender.com/api/health"
echo ""
echo "🔄 Rollback if needed:"
echo "   ssh -p 65002 $REMOTE_USER@$REMOTE_HOST"
echo "   mv public_html.backup.$TIMESTAMP public_html"

