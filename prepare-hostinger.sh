#!/bin/bash
# Quick Hostinger Backend Preparation Script
# Run this to prepare files for Hostinger upload

echo "📦 Preparing Nekxuz Backend for Hostinger"
echo "=========================================="
echo ""

# Create deployment package
mkdir -p ~/Desktop/nekxuz-api-hostinger
cd ~/Desktop/nekxuz-api-hostinger

echo "✅ Copying files..."
cp /Users/ayushgupta/Documents/untitled\ folder/Nekxuz\ copy/package.json .
cp /Users/ayushgupta/Documents/untitled\ folder/Nekxuz\ copy/server.js .

# Create a simple startup script for Hostinger
cat > start.sh << 'EOF'
#!/bin/bash
npm install
node server.js
EOF

chmod +x start.sh

# Create .env template (optional)
cat > .env.example << 'EOF'
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV
FIREBASE_PROJECT_ID=nekxuz-27e49
NODE_ENV=production
PORT=3001
EOF

# Create README for Hostinger
cat > README_HOSTINGER.md << 'EOF'
# Nekxuz Backend for Hostinger

## Files in this folder:
- `package.json` - Node.js dependencies
- `server.js` - Express backend server
- `start.sh` - Startup script

## Deployment Steps:

1. Upload all files to `/public_html/api/` on Hostinger
2. Go to Node.js Applications
3. Create new app:
   - Root: /public_html/api
   - Startup File: server.js
   - Node Version: 24.x
   - URL: api.nekxuz.in

4. Test:
   curl https://api.nekxuz.in/

5. If it says module not found:
   - In Hostinger terminal or SSH, run: npm install
   - Then restart the application

## Troubleshooting:

- Check logs in Hostinger Node.js Applications
- Verify package.json and server.js are uploaded
- Make sure port is not blocked
- Restart application after changes
EOF

echo ""
echo "📁 Files prepared in: ~/Desktop/nekxuz-api-hostinger"
echo ""
echo "📋 Files included:"
ls -lh
echo ""
echo "🚀 Next steps:"
echo "1. Download all files from ~/Desktop/nekxuz-api-hostinger"
echo "2. Go to Hostinger cPanel → File Manager"
echo "3. Create folder: /public_html/api/"
echo "4. Upload all files there"
echo "5. Go to Node.js Applications → Create Application"
echo "6. Set Root to: /public_html/api"
echo "7. Set Startup File to: server.js"
echo "8. Test: curl https://api.nekxuz.in/"
echo ""
echo "✅ Done!"
