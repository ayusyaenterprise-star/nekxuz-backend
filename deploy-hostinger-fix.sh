#!/bin/bash

# 🔧 Hostinger Backend Update & Order Sync Script
# This script fixes the orders display issue by updating Hostinger backend

echo "🚀 Nekxuz Hostinger Backend Update"
echo "===================================="
echo ""

# Step 1: Check if we can access the backend files
echo "📋 Step 1: Checking Hostinger backend files..."
if [ -d "backend_hostinger" ]; then
    echo "✓ Found backend_hostinger directory"
else
    echo "❌ Cannot find backend_hostinger directory"
    exit 1
fi

# Step 2: Verify .env has correct DATABASE_URL
echo ""
echo "📋 Step 2: Verifying database configuration..."
if grep -q "DATABASE_URL" backend_hostinger/.env; then
    echo "✓ DATABASE_URL found in .env"
    # Show masked URL for verification
    grep "DATABASE_URL" backend_hostinger/.env | sed 's/:.*@/:**@/'
else
    echo "❌ DATABASE_URL not found in backend_hostinger/.env"
    exit 1
fi

# Step 3: Install dependencies
echo ""
echo "📋 Step 3: Installing Node dependencies..."
cd backend_hostinger
npm install
if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Step 4: Run Prisma migrations
echo ""
echo "📋 Step 4: Running Prisma migrations..."
npx prisma db push --skip-generate
if [ $? -eq 0 ]; then
    echo "✓ Database migrations complete"
else
    echo "❌ Prisma migration failed"
    exit 1
fi

# Step 5: Copy orders from local DB to Hostinger (if needed)
echo ""
echo "📋 Step 5: Syncing orders to database..."
cd ..
node add-orders-prisma.js
if [ $? -eq 0 ]; then
    echo "✓ Orders synced to database"
else
    echo "⚠️  Orders may already exist or sync had issues"
fi

# Step 6: Kill existing process and restart
echo ""
echo "📋 Step 6: Restarting backend service..."
kill $(lsof -ti:3002) 2>/dev/null || true
sleep 1

cd backend_hostinger
PORT=3002 node server.js &

sleep 3
echo "✓ Backend restarted"

# Step 7: Test the API
echo ""
echo "📋 Step 7: Testing API endpoint..."
sleep 2
curl -s "https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com" | jq '.'

echo ""
echo "✅ Update complete! Check if orders now appear in the API response above."
echo ""
echo "📝 MANUAL TEST:"
echo "   1. Open https://nekxuz.shop (or your domain)"
echo "   2. Log in with: infodevayushenterprise@gmail.com"
echo "   3. Go to Account > My Orders"
echo "   4. Should see 4 orders (₹164, ₹139, ₹139, ₹139)"
