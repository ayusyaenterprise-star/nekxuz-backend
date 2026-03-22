#!/bin/bash

# Test Indian Card Payment WITHOUT Real Money
# Uses Razorpay's test environment with Live keys

echo "🧪 TESTING INDIAN CARD PAYMENT"
echo "======================================"
echo ""

EMAIL="infodevayu@enterprisegmail.com"
AMOUNT=155

echo "📋 Test Details:"
echo "  Email: $EMAIL"
echo "  Amount: ₹$AMOUNT"
echo ""

# Step 1: Create Razorpay Order
echo "Step 1️⃣: Creating Razorpay Order..."
PAYMENT_RESPONSE=$(curl -s -X POST "https://api.nekxuz.in/api/payment" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": $AMOUNT,
    \"invoiceNumber\": \"TEST-$(date +%s)\",
    \"email\": \"$EMAIL\"
  }")

echo "Response: $PAYMENT_RESPONSE"
RAZORPAY_ORDER_ID=$(echo $PAYMENT_RESPONSE | grep -o '"orderId":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$RAZORPAY_ORDER_ID" ]; then
  echo "❌ Failed to create Razorpay order"
  exit 1
fi

echo "✅ Razorpay Order Created: $RAZORPAY_ORDER_ID"
echo ""
echo "Now follow these steps:"
echo "=================================="
echo ""
echo "1. Go to: https://nekxuz.in"
echo "2. Add product to cart"
echo "3. Click Checkout"
echo "4. Enter this INDIAN TEST CARD:"
echo "   Card: 4111111111111111"
echo "   Expiry: 12/25"
echo "   CVV: 123"
echo "   OTP: 123456"
echo ""
echo "5. Click Pay"
echo "6. Payment should complete WITHOUT charging real money"
echo ""
echo "=================================="
echo ""
echo "✨ If payment succeeds:"
echo "   - Check 'My Orders' tab"
echo "   - Order should appear there"
echo "   - Test is COMPLETE!"
echo ""
