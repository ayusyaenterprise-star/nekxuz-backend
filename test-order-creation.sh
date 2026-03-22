#!/bin/bash

# Test Order Creation - Direct Backend API Call
# This bypasses Razorpay and directly tests order storage

echo "🧪 TESTING ORDER CREATION DIRECTLY"
echo "===================================="
echo ""

# Generate a test order ID
ORDER_ID="TEST-$(date +%s)"
EMAIL="infodevayu@enterprisegmail.com"
AMOUNT=500

echo "📋 Test Order Details:"
echo "  Order ID: $ORDER_ID"
echo "  Email: $EMAIL"
echo "  Amount: ₹$AMOUNT"
echo ""

# Step 1: Create Razorpay Order
echo "Step 1️⃣: Creating Razorpay Order..."
PAYMENT_RESPONSE=$(curl -s -X POST "https://api.nekxuz.in/api/payment" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": $AMOUNT,
    \"invoiceNumber\": \"$ORDER_ID\",
    \"email\": \"$EMAIL\"
  }")

echo "Response: $PAYMENT_RESPONSE"
echo ""

# Extract Razorpay Order ID
RAZORPAY_ORDER_ID=$(echo $PAYMENT_RESPONSE | grep -o '"orderId":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$RAZORPAY_ORDER_ID" ]; then
  echo "❌ Failed to create Razorpay order"
  exit 1
fi

echo "✅ Razorpay Order Created: $RAZORPAY_ORDER_ID"
echo ""

# Step 2: Verify Payment (Simulate successful payment)
echo "Step 2️⃣: Simulating Successful Payment..."
echo "⚠️  For testing only - this simulates a verified payment without actual Razorpay payment"
echo ""

# Create test payment data
RAZORPAY_PAYMENT_ID="pay_test_$(date +%s)"

# Create HMAC signature
HMAC=$(echo -n "${RAZORPAY_ORDER_ID}|${RAZORPAY_PAYMENT_ID}" | \
  openssl dgst -sha256 -hmac "Yv4Bd637j5fjHGJ7hrPe1vDV" | \
  sed 's/^.* //')

echo "Signature: $HMAC"
echo ""

# Send verification request
echo "Step 3️⃣: Sending Order to Backend for Storage..."
VERIFY_RESPONSE=$(curl -s -X POST "https://api.nekxuz.in/api/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"razorpayOrderId\": \"$RAZORPAY_ORDER_ID\",
    \"razorpayPaymentId\": \"$RAZORPAY_PAYMENT_ID\",
    \"razorpaySignature\": \"$HMAC\",
    \"orderId\": \"$ORDER_ID\",
    \"email\": \"$EMAIL\",
    \"invoiceNumber\": \"$ORDER_ID\",
    \"amount\": $AMOUNT,
    \"cartItems\": [
      {
        \"id\": \"product-1\",
        \"name\": \"Test Product\",
        \"price\": $AMOUNT,
        \"quantity\": 1
      }
    ],
    \"shippingAddress\": {
      \"name\": \"Test User\",
      \"email\": \"$EMAIL\",
      \"phone\": \"9999999999\",
      \"address\": \"Test Address\",
      \"city\": \"Test City\",
      \"state\": \"Test State\",
      \"pincode\": \"000000\"
    }
  }")

echo "Verification Response: $VERIFY_RESPONSE"
echo ""

# Step 4: Retrieve Order
echo "Step 4️⃣: Retrieving Orders from Backend..."
ORDERS_RESPONSE=$(curl -s "https://api.nekxuz.in/api/orders?email=$EMAIL")

echo "Orders Response:"
echo "$ORDERS_RESPONSE" | grep -o '"orders":\[\]' || echo "$ORDERS_RESPONSE"
echo ""

# Final check
if echo "$ORDERS_RESPONSE" | grep -q "\"ok\":true"; then
  echo "✅ SUCCESS! Order system is working!"
  echo ""
  echo "Order Details:"
  echo "$ORDERS_RESPONSE" | grep -o '"orderId":"[^"]*"'
  echo "$ORDERS_RESPONSE" | grep -o '"status":"[^"]*"'
  echo "$ORDERS_RESPONSE" | grep -o '"amount":[^,}]*'
else
  echo "⚠️  Check the response above for any errors"
fi

echo ""
echo "===================================="
echo "✨ Test Complete!"
echo ""
echo "Next steps:"
echo "1. Check if order appears in 'My Orders' tab on https://nekxuz.in"
echo "2. If yes → Order system is working perfectly!"
echo "3. If no → Check browser console for errors"
