#!/bin/bash

echo "🧪 TESTING TEST ORDER ENDPOINT"
echo "======================================"
echo ""

ORDER_ID="TEST-ORDER-$(date +%s)"
EMAIL="infodevayu@enterprisegmail.com"
AMOUNT=500

echo "📋 Creating Test Order..."
echo "  Order ID: $ORDER_ID"
echo "  Email: $EMAIL"
echo "  Amount: ₹$AMOUNT"
echo ""

# Call test-order endpoint
RESPONSE=$(curl -s -X POST "https://api.nekxuz.in/api/test-order" \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"email\": \"$EMAIL\",
    \"amount\": $AMOUNT,
    \"cartItems\": [
      {
        \"id\": \"test-product-1\",
        \"name\": \"Test Product\",
        \"price\": $AMOUNT,
        \"quantity\": 1
      }
    ],
    \"shippingAddress\": {
      \"name\": \"Test User\",
      \"email\": \"$EMAIL\",
      \"phone\": \"9999999999\",
      \"address\": \"Test Address, Mumbai\",
      \"city\": \"Mumbai\",
      \"state\": \"Maharashtra\",
      \"pincode\": \"400001\"
    }
  }")

echo "✅ Response from backend:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Test order created successfully!"
  echo ""
  echo "Now retrieving order..."
  echo ""
  
  # Retrieve the order
  ORDERS=$(curl -s "https://api.nekxuz.in/api/orders?email=$EMAIL")
  echo "📦 Orders Retrieved:"
  echo "$ORDERS" | python3 -m json.tool 2>/dev/null || echo "$ORDERS"
  
  echo ""
  echo "✨ SUCCESS! Order created and stored!"
  echo ""
  echo "Next: Go to https://nekxuz.in and check the 'My Orders' tab"
  echo "Your test order should appear there!"
else
  echo "❌ Failed to create test order"
  echo "Response: $RESPONSE"
fi
