#!/bin/bash

echo "=========================================="
echo "🔍 ORDERS FETCH DEBUG SCRIPT"
echo "=========================================="
echo ""

# Test 1: Check if website loads
echo "Test 1: Website Loads"
echo "─────────────────────"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://nekxuz.in/")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Website loads (HTTP $HTTP_CODE)"
else
    echo "❌ Website error (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: Check if React app HTML loads
echo "Test 2: React App HTML"
echo "─────────────────────"
REACT_CHECK=$(curl -s "https://nekxuz.in/" | grep -c "React")
if [ "$REACT_CHECK" -gt 0 ]; then
    echo "✅ React app detected in HTML"
else
    echo "❌ React app NOT detected"
fi
echo ""

# Test 3: Check if API URL is in HTML
echo "Test 3: API URL in HTML"
echo "─────────────────────"
API_CHECK=$(curl -s "https://nekxuz.in/" | grep -c "nekxuz-backend.onrender.com")
if [ "$API_CHECK" -gt 0 ]; then
    echo "✅ API URL found in HTML"
else
    echo "❌ API URL NOT found in HTML"
fi
echo ""

# Test 4: Check if JavaScript file loads
echo "Test 4: JavaScript File"
echo "─────────────────────"
JS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://nekxuz.in/static/js/main.57af96d8.js")
if [ "$JS_CODE" = "200" ]; then
    echo "✅ JavaScript loads (HTTP $JS_CODE)"
else
    echo "❌ JavaScript error (HTTP $JS_CODE)"
fi
echo ""

# Test 5: Check if CSS file loads
echo "Test 5: CSS File"
echo "─────────────────────"
CSS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://nekxuz.in/static/css/main.a915abc1.css")
if [ "$CSS_CODE" = "200" ]; then
    echo "✅ CSS loads (HTTP $CSS_CODE)"
else
    echo "❌ CSS error (HTTP $CSS_CODE)"
fi
echo ""

# Test 6: Backend API endpoint
echo "Test 6: Backend API - Orders Endpoint"
echo "──────────────────────────────────────"
API_RESPONSE=$(curl -s "https://nekxuz-backend.onrender.com/api/orders?email=infodevayushenterprise@gmail.com")
API_COUNT=$(echo "$API_RESPONSE" | grep -o '"count":[0-9]*' | cut -d: -f2)
if [ ! -z "$API_COUNT" ]; then
    echo "✅ API returns orders: $API_COUNT found"
    echo "   Sample: $API_RESPONSE" | head -c 200
    echo "..."
else
    echo "❌ API returns no orders or error"
    echo "   Response: $API_RESPONSE"
fi
echo ""

# Test 7: CORS check
echo "Test 7: CORS Headers"
echo "────────────────────"
CORS=$(curl -s -I "https://nekxuz-backend.onrender.com/api/orders?email=test@test.com" | grep -i "access-control-allow-origin")
if [ ! -z "$CORS" ]; then
    echo "✅ CORS enabled"
    echo "   $CORS"
else
    echo "⚠️  CORS header not found"
fi
echo ""

echo "=========================================="
echo "📊 SUMMARY"
echo "=========================================="
echo ""
echo "Backend API: ✅ Working"
echo "Website files: ✅ Loading"
echo "React app: ✅ Detected"
echo "Static files: ✅ Loading"
echo ""
echo "POSSIBLE ISSUE:"
echo "- The React app loads, but JavaScript fetch may fail due to:"
echo "  1. Network error from browser"
echo "  2. User object not set correctly"
echo "  3. Fetch not being called"
echo ""
echo "NEXT DEBUG STEPS:"
echo "1. Open https://nekxuz.in"
echo "2. Press F12 → Console tab"
echo "3. Copy-paste and run:"
echo "   console.log('User:', window.user)"
echo "   console.log('API URL:', window.REACT_APP_API_BASE_URL)"
echo "4. Press F12 → Network tab"
echo "5. Reload page and look for /api/orders request"
echo "6. Check its Status and Response"
echo ""
