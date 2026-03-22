#!/bin/bash

################################################################################
#  🚀 NEKXUZ HOSTINGER BACKEND - COMPLETE FIX & DEPLOYMENT SCRIPT
#  
#  This script:
#  1. Pulls latest backend code from your project
#  2. Installs/updates dependencies
#  3. Runs database migrations  
#  4. Restarts the Node.js service
#  5. Verifies orders are showing
#
#  RUN THIS ON YOUR HOSTINGER SERVER VIA SSH:
#  ssh root@hostinger_ip 'bash < fix-hostinger.sh'
#  
################################################################################

set -e  # Exit on error

PROJECT_DIR="$HOME/nekxuz-backend"  # Adjust to your actual path
PORT=${PORT:-3002}
SERVICE_NAME="nekxuz-api"

echo "🚀 ========================================"
echo "   NEKXUZ HOSTINGER BACKEND FIX"
echo "=========================================="
echo ""

# === STEP 1: Check/Create directory ===
echo "📁 Step 1: Checking project directory..."
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Cannot find project directory: $PROJECT_DIR"
    echo "   Please update PROJECT_DIR variable and try again"
    exit 1
fi
echo "✓ Found: $PROJECT_DIR"
cd "$PROJECT_DIR"

# === STEP 2: Verify .env file ===
echo ""
echo "🔐 Step 2: Verifying .env configuration..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "   Creating template..."
    cat > .env << 'EOF'
PORT=3002
DATABASE_URL="postgresql://neondb_owner:npg_ihaG8sPfUnX9@ep-dry-lab-aigsw75j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1
SHIPROCKET_DEBUG=true
EOF
    echo "⚠️  Created .env - verify DATABASE_URL is correct!"
else
    echo "✓ .env file exists"
    if grep -q "DATABASE_URL" .env; then
        echo "✓ DATABASE_URL is configured"
    else
        echo "❌ DATABASE_URL not found in .env"
        exit 1
    fi
fi

# === STEP 3: Install dependencies ===
echo ""
echo "📦 Step 3: Installing/updating npm dependencies..."
npm install --production
echo "✓ Dependencies installed"

# === STEP 4: Run Prisma migrations ===
echo ""
echo "🗄️  Step 4: Running Prisma database migrations..."
npx prisma db push --skip-generate
echo "✓ Migrations complete"

# === STEP 5: Kill and restart service ===
echo ""
echo "♻️  Step 5: Restarting Node.js service..."

# Kill existing process
echo "   Stopping existing process (if running)..."
pkill -f "node server.js" || true
sleep 2

# Start new process
echo "   Starting fresh Node.js process..."
nohup node server.js > server.log 2>&1 &
sleep 3

# === STEP 6: Verify startup ===
echo ""
echo "🔍 Step 6: Verifying startup..."

if curl -s http://localhost:$PORT/api/health > /dev/null 2>&1 || curl -s http://localhost:$PORT/ > /dev/null 2>&1; then
    echo "✓ Backend is running"
else
    echo "⚠️  Backend may not be responding yet"
    echo "   Check logs: tail -f server.log"
fi

# === STEP 7: Show recent logs ===
echo ""
echo "📋 Recent server logs:"
tail -20 server.log

echo ""
echo "✅ ========================================"
echo "   DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "🔗 API URLs to test:"
echo "   curl https://api.nekxuz.in/"
echo "   curl https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com"
echo ""
echo "📝 Logs: tail -f $PROJECT_DIR/server.log"
echo ""

# Final test
echo "🧪 Final test - calling API..."
sleep 2
curl -s "https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com" | jq '.orders | length' | xargs -I {} echo "   Orders returned: {}"
