#!/bin/bash

# Nekxuz Pre-Launch System Verification Script
# Tests all critical features before going live

echo "🚀 Nekxuz Pre-Launch System Verification"
echo "========================================"
echo ""

BASE_URL="http://localhost:3002"
RESULTS=()

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Server Health Check
echo "Test 1: Server Health Check..."
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Server is running${NC}"
    RESULTS+=("✅ Server Health Check")
else
    echo -e "${RED}❌ Server returned HTTP $HTTP_CODE${NC}"
    RESULTS+=("❌ Server Health Check")
fi
echo ""

# Test 2: Stock API - Get Stock
echo "Test 2: Checking Stock API..."
STOCK=$(curl -s "$BASE_URL/api/stock")
if echo "$STOCK" | grep -q "available"; then
    echo -e "${GREEN}✅ Stock API working${NC}"
    RESULTS+=("✅ Stock API Read")
else
    echo -e "${RED}❌ Stock API failed${NC}"
    RESULTS+=("❌ Stock API Read")
fi
echo ""

# Test 3: Stock Update - Update Stock
echo "Test 3: Testing Stock Update..."
UPDATE=$(curl -s -X POST "$BASE_URL/api/stock/update" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "f3",
    "available": 250,
    "reserved": 25,
    "sold": 100
  }')

if echo "$UPDATE" | grep -q "Stock updated successfully"; then
    echo -e "${GREEN}✅ Stock update working${NC}"
    RESULTS+=("✅ Stock Update")
else
    echo -e "${RED}❌ Stock update failed${NC}"
    RESULTS+=("❌ Stock Update")
fi
echo ""

# Test 4: Get Specific Product Stock
echo "Test 4: Getting Specific Product Stock..."
PROD_STOCK=$(curl -s "$BASE_URL/api/stock/f3")
if echo "$PROD_STOCK" | grep -q "available"; then
    echo -e "${GREEN}✅ Product stock retrieval working${NC}"
    RESULTS+=("✅ Product Stock Read")
else
    echo -e "${RED}❌ Product stock retrieval failed${NC}"
    RESULTS+=("❌ Product Stock Read")
fi
echo ""

# Test 5: Product List API
echo "Test 5: Checking Product List API..."
PRODUCTS=$(curl -s "$BASE_URL/api/products")
if echo "$PRODUCTS" | grep -q "Neem Lime"; then
    echo -e "${GREEN}✅ Product list API working${NC}"
    echo "📦 Found products: $(echo "$PRODUCTS" | grep -o '"title":"[^"]*"' | wc -l)"
    RESULTS+=("✅ Product List API")
else
    echo -e "${RED}❌ Product list API failed${NC}"
    RESULTS+=("❌ Product List API")
fi
echo ""

# Test 6: Static Assets - Images
echo "Test 6: Checking Product Images..."
IMAGE_RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/assets/cataloges/neem-lime-50/1.jpeg")
IMAGE_CODE=$(echo "$IMAGE_RESPONSE" | tail -n1)
if [ "$IMAGE_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Product image accessible${NC}"
    RESULTS+=("✅ Image Serving")
else
    echo -e "${YELLOW}⚠️  Product image HTTP $IMAGE_CODE (may be normal for browser requests)${NC}"
    RESULTS+=("⚠️  Image Serving")
fi
echo ""

# Test 7: Razorpay Configuration
echo "Test 7: Checking Razorpay Configuration..."
if [ -n "$RAZORPAY_KEY_ID" ]; then
    echo -e "${GREEN}✅ Razorpay Key ID configured${NC}"
    echo "Key ID: ${RAZORPAY_KEY_ID:0:8}..."
    RESULTS+=("✅ Razorpay Config")
else
    echo -e "${YELLOW}⚠️  Razorpay key not found in environment${NC}"
    RESULTS+=("⚠️  Razorpay Config")
fi
echo ""

# Test 8: Database Connection
echo "Test 8: Checking Database Connection..."
if [ -f "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/dev.db" ] || [ -f "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/prisma/dev.sqlite" ]; then
    echo -e "${GREEN}✅ Database file exists${NC}"
    RESULTS+=("✅ Database Connection")
else
    echo -e "${YELLOW}⚠️  Database file not found${NC}"
    RESULTS+=("⚠️  Database Connection")
fi
echo ""

# Test 9: Static Build
echo "Test 9: Checking React Build..."
if [ -d "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/build" ] && [ -f "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/build/index.html" ]; then
    echo -e "${GREEN}✅ React build exists${NC}"
    RESULTS+=("✅ React Build")
else
    echo -e "${RED}❌ React build not found${NC}"
    RESULTS+=("❌ React Build")
fi
echo ""

# Summary
echo "========================================"
echo "📊 TEST SUMMARY"
echo "========================================"
for result in "${RESULTS[@]}"; do
    echo "$result"
done
echo ""

# Count results
PASS_COUNT=$(printf '%s\n' "${RESULTS[@]}" | grep -c "✅")
TOTAL_COUNT=${#RESULTS[@]}

echo "Passed: ${PASS_COUNT}/${TOTAL_COUNT}"
echo ""

if [ $PASS_COUNT -eq $TOTAL_COUNT ]; then
    echo -e "${GREEN}🎉 ALL SYSTEMS GO - READY FOR LAUNCH!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests need attention before launch${NC}"
    exit 1
fi
