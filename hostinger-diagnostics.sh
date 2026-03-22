#!/bin/bash

# 🔍 QUICK HOSTINGER DIAGNOSTICS
# Run this to understand why API returns empty orders

echo "📡 Nekxuz Hostinger API Diagnostics"
echo "===================================="
echo ""

# Test 1: Check if backend is running
echo "1️⃣  Backend Status:"
if curl -s https://api.nekxuz.in/ | grep -q "Nekxuz Backend"; then
    echo "   ✓ Backend is responding"
    curl -s https://api.nekxuz.in/ | jq '.'
else
    echo "   ❌ Backend not responding"
fi

echo ""

# Test 2: Check orders endpoint
echo "2️⃣  Orders Endpoint:"
RESPONSE=$(curl -s "https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com")
echo "   Response: $RESPONSE" | jq '.'
ORDER_COUNT=$(echo "$RESPONSE" | jq '.orders | length')
echo "   Orders returned: $ORDER_COUNT"

echo ""

# Test 3: Check if backend logs are accessible
echo "3️⃣  Backend Logs:"
if [ -f "server.log" ]; then
    echo "   Latest 10 lines:"
    tail -10 server.log
else
    echo "   ⚠️  Log file not found"
    echo "   Try: ps aux | grep 'node server'"
fi

echo ""

# Test 4: Database connectivity
echo "4️⃣  Database Check:"
if command -v psql &> /dev/null; then
    echo "   psql found, checking connection..."
    # Won't work without password, so skip actual query
    echo "   ℹ️  Use your credentials to check"
else
    echo "   psql not installed, skipping"
fi

echo ""
echo "✅ Diagnostics complete"
echo ""
echo "📝 For detailed logs, run:"
echo "   tail -f /path/to/server.log"
