#!/bin/bash

# Frontend-Backend Connection Test Script
# This script tests if your frontend can connect to the Render backend

echo "════════════════════════════════════════════════════════════"
echo "  Frontend-Backend Connection Test"
echo "════════════════════════════════════════════════════════════"
echo ""

BACKEND_URL="https://nekxuz-backend.onrender.com"

echo "🔍 Testing Backend Connectivity..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Backend Health
echo "Test 1: Backend Health Check"
echo "URL: $BACKEND_URL/"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/")
if [ "$response" = "200" ]; then
  echo "✅ Status: $response (Backend is responding)"
  curl -s "$BACKEND_URL/" | jq . 2>/dev/null || curl -s "$BACKEND_URL/"
else
  echo "❌ Status: $response (Backend not responding)"
fi
echo ""

# Test 2: CORS Check
echo "Test 2: CORS Headers Check"
echo "URL: $BACKEND_URL/"
echo "Command: curl -I (showing headers)"
cors_header=$(curl -s -I "$BACKEND_URL/" | grep -i "access-control" | head -1)
if [ ! -z "$cors_header" ]; then
  echo "✅ CORS Header Found: $cors_header"
else
  echo "⚠️  No CORS headers detected"
fi
echo ""

# Test 3: Stock Endpoint
echo "Test 3: Stock Endpoint"
echo "URL: $BACKEND_URL/api/stock"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/stock")
if [ "$response" = "200" ]; then
  echo "✅ Status: $response (Stock endpoint working)"
  curl -s "$BACKEND_URL/api/stock" | jq . 2>/dev/null | head -20
  echo "... (showing first 20 lines)"
else
  echo "❌ Status: $response (Stock endpoint not working)"
fi
echo ""

# Test 4: Orders Endpoint
echo "Test 4: Orders Endpoint"
echo "URL: $BACKEND_URL/api/orders?email=test@example.com"
response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/orders?email=test@example.com")
if [ "$response" = "200" ]; then
  echo "✅ Status: $response (Orders endpoint working)"
  curl -s "$BACKEND_URL/api/orders?email=test@example.com" | jq .
else
  echo "❌ Status: $response"
fi
echo ""

# Test 5: Payment Order Creation
echo "Test 5: Payment Order Creation"
echo "URL: $BACKEND_URL/api/payment/create-order"
response=$(curl -s -X POST "$BACKEND_URL/api/payment/create-order" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "INR"}')
if echo "$response" | grep -q "order_"; then
  echo "✅ Payment order creation working"
  echo "$response" | jq .
else
  echo "⚠️  Response:"
  echo "$response" | jq . 2>/dev/null || echo "$response"
fi
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  Summary"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "If all tests show ✅, your frontend can connect to backend!"
echo ""
echo "Next Steps:"
echo "1. Deploy the fixed src/App.js to Hostinger"
echo "2. Go to https://nekxuz.in"
echo "3. Open DevTools (F12) → Network tab"
echo "4. Reload page and verify requests go to onrender.com domain"
echo "5. Check that products load without errors"
echo ""
