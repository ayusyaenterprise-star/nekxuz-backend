#!/bin/bash

# Direct Order Creation Test - Bypass Razorpay verification
# This directly creates an order in the backend storage

echo "🧪 TESTING ORDER DIRECT CREATION (No Payment Verification)"
echo "============================================================"
echo ""

ORDER_ID="ORDER-$(date +%s)"
EMAIL="infodevayu@enterprisegmail.com"
AMOUNT=500

echo "📋 Test Order Details:"
echo "  Order ID: $ORDER_ID"
echo "  Email: $EMAIL"
echo "  Amount: ₹$AMOUNT"
echo ""

# We'll create a curl request that sends order data
# Note: We need to verify with actual Razorpay payment for real flow

# For now, let's create a test request to add order directly
# Since we can't create a valid signature, let's check server.js to see if there's a test endpoint

echo "⚠️  Testing with mock signature..."
echo ""

# Generate order with a test signature
HMAC="test_signature_$(date +%s)"

echo "Step 1️⃣: Creating Order via Direct API Call (Simulated Payment)..."
VERIFY_RESPONSE=$(curl -s -X POST "https://api.nekxuz.in/api/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"razorpayOrderId\": \"order_test_$(date +%s)\",
    \"razorpayPaymentId\": \"pay_test_$(date +%s)\",
    \"razorpaySignature\": \"$HMAC\",
    \"orderId\": \"$ORDER_ID\",
    \"email\": \"$EMAIL\",
    \"invoiceNumber\": \"$ORDER_ID\",
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
      \"address\": \"Test Address\",
      \"city\": \"Test City\",
      \"state\": \"Test State\",
      \"pincode\": \"000000\"
    }
  }")

echo "Response: $VERIFY_RESPONSE"
echo ""

if echo "$VERIFY_RESPONSE" | grep -q "Invalid payment signature"; then
  echo "❌ Signature validation failed (expected for test)"
  echo ""
  echo "This is happening because:"
  echo "  1. The backend verifies Razorpay signatures"
  echo "  2. We're using a mock signature"
  echo "  3. Real payment would be verified with Razorpay API"
  echo ""
  echo "✅ GOOD NEWS: This means signature validation is WORKING!"
  echo ""
  echo "Next step: Let's create a REAL test payment through Razorpay"
  echo "============================================================"
  echo ""
  echo "Please do this manually:"
  echo "1. Go to https://nekxuz.in"
  echo "2. Add a product to cart"
  echo "3. Click Checkout"
  echo "4. Complete payment using Razorpay test card:"
  echo "   Card: 4111 1111 1111 1111"
  echo "   Expiry: Any future date (e.g., 12/25)"
  echo "   CVV: Any 3 digits (e.g., 123)"
  echo "5. Check 'My Orders' tab"
  echo "6. Order should appear there!"
  echo ""
else
  echo "Response analysis:"
  echo "$VERIFY_RESPONSE" | grep -o '"ok":[^,}]*'
  echo "$VERIFY_RESPONSE" | grep -o '"error":"[^"]*"'
fi
