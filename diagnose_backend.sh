#!/bin/bash

echo "🔍 NEKXUZ BACKEND DIAGNOSTICS"
echo "============================="
echo ""

echo "1️⃣  Checking Vercel Backend:"
echo "   URL: https://nekxuz-backend-j1sj.vercel.app"
VERCEL_RESPONSE=$(curl -s "https://nekxuz-backend-j1sj.vercel.app" 2>&1)
if [[ $VERCEL_RESPONSE == *"ok"* ]]; then
    echo "   ✅ Vercel backend responding"
else
    echo "   ❌ Vercel backend not responding properly"
    echo "   Response: $(echo $VERCEL_RESPONSE | head -c 100)"
fi
echo ""

echo "2️⃣  Checking Render Backend (should be suspended):"
echo "   URL: https://nekxuz-backend.onrender.com"
RENDER_RESPONSE=$(curl -s "https://nekxuz-backend.onrender.com" 2>&1)
if [[ $RENDER_RESPONSE == *"suspended"* ]]; then
    echo "   ✅ Confirmed suspended (as expected)"
elif [[ $RENDER_RESPONSE == *"ok"* ]]; then
    echo "   ℹ️  Render backend still running!"
else
    echo "   ⚠️  Unknown status"
fi
echo ""

echo "3️⃣  Checking Orders API on Vercel:"
echo "   Testing: /api/orders?email=test@example.com"
ORDERS_RESPONSE=$(curl -s "https://nekxuz-backend-j1sj.vercel.app/api/orders?email=test@example.com" 2>&1)
if [[ $ORDERS_RESPONSE == *"ok"* ]] || [[ $ORDERS_RESPONSE == *"orders"* ]]; then
    echo "   ✅ Orders API working"
    echo "   Response: $ORDERS_RESPONSE"
elif [[ $ORDERS_RESPONSE == *"NOT_FOUND"* ]]; then
    echo "   ❌ API endpoint not found"
    echo "   Vercel might not have deployed correctly"
elif [[ $ORDERS_RESPONSE == *"suspended"* ]]; then
    echo "   ⚠️  Pointing to suspended Render backend"
else
    echo "   ❌ Unknown error"
    echo "   Response: $(echo $ORDERS_RESPONSE | head -c 200)"
fi
echo ""

echo "4️⃣  Checking Current App.js Configuration:"
grep "API_BASE_URL" "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/src/App.js" 2>/dev/null
echo ""

echo "📊 SUMMARY:"
echo "==========="
echo "Current API configuration needs to be checked and updated"
echo "Vercel backend deployment status: ?"
echo "Render backend status: SUSPENDED"
echo ""
echo "🔧 NEXT STEPS:"
echo "1. Verify Vercel backend is properly deployed"
echo "2. Ensure Database URL is set in Vercel environment"
echo "3. Update App.js to point to correct backend"
echo "4. Test orders endpoint"
