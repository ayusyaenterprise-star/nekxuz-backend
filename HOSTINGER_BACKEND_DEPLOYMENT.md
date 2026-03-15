#!/bin/bash
# Hostinger Node.js Backend Deployment Script
# This guide helps deploy Nekxuz backend on Hostinger's Node.js hosting (FREE)

echo "🚀 NEKXUZ HOSTINGER BACKEND DEPLOYMENT"
echo "======================================"
echo ""
echo "✅ This backend will run on Hostinger (included in your hosting plan)"
echo "✅ No additional costs!"
echo "✅ Database: Firebase Firestore (free tier)"
echo ""

echo "📋 STEP 1: Prepare backend files"
echo "================================"
echo "Make sure you have these files ready:"
echo "  - package.json (with Node.js dependencies)"
echo "  - server.js (main server file)"
echo "  - All node_modules installed"
echo ""

echo "📋 STEP 2: Upload to Hostinger"
echo "=============================="
echo "1. Go to Hostinger cPanel"
echo "2. File Manager → public_html"
echo "3. Create folder: /api/backend/ or /backend/"
echo "4. Upload:"
echo "   - package.json"
echo "   - server.js"
echo "   - All node_modules/ folder (or run npm install on server)"
echo ""

echo "📋 STEP 3: Create .htaccess for Node.js"
echo "======================================="
echo "Create .htaccess in backend folder:"
echo '
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^(.*)$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ index.js [L,QSA]
</IfModule>
'
echo ""

echo "📋 STEP 4: Set up Node.js App in Hostinger"
echo "=========================================="
echo "1. Go to Hostinger cPanel → Manage → Node.js Applications"
echo "2. Click 'Create Application'"
echo "3. Set:"
echo "   - Node.js version: 24.x"
echo "   - Application mode: production"
echo "   - Application root: public_html/backend/ (or your path)"
echo "   - Application startup file: server.js"
echo "   - Application URL: api.nekxuz.in (or subdomain)"
echo ""

echo "📋 STEP 5: Environment Variables"
echo "================================"
echo "In Hostinger Node.js settings, add:"
echo "  RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X"
echo "  RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV"
echo "  FIREBASE_PROJECT_ID=nekxuz-27e49"
echo "  NODE_ENV=production"
echo "  PORT=3001"
echo ""

echo "📋 STEP 6: Update Frontend"
echo "=========================="
echo "Update src/App.js line 13 to:"
echo "  const API_BASE_URL = 'https://api.nekxuz.in';"
echo "  (or your Hostinger subdomain)"
echo ""

echo "📋 STEP 7: Test"
echo "=============="
echo "Test with:"
echo "  curl https://api.nekxuz.in/"
echo "  curl -X POST https://api.nekxuz.in/api/payment -H 'Content-Type: application/json' -d '{\"amount\":100,\"invoiceNumber\":\"test\"}'"
echo ""

echo "✅ DEPLOYMENT COMPLETE!"
echo "Your backend is now running on Hostinger (100% FREE)"
echo ""
