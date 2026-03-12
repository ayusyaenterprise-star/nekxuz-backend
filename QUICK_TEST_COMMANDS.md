# ⚡ LIVE PAYMENT - QUICK TEST COMMANDS

## 🟢 Backend Status Checks

### Test 1: Backend Is Running
```bash
curl https://nekxuz-backend.onrender.com/
```
**Expected**: Returns JSON with status="ok"

### Test 2: Check CORS Headers
```bash
curl -i https://nekxuz-backend.onrender.com/
```
**Expected**: See `access-control-allow-origin: *` in headers

### Test 3: Stock Endpoint
```bash
curl https://nekxuz-backend.onrender.com/api/stock | jq . | head -20
```
**Expected**: Returns list of products

---

## 💳 Payment Testing

### Test 4: Create Payment Order
```bash
curl -X POST https://nekxuz-backend.onrender.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "INR",
    "invoiceNumber": "TEST-001"
  }' | jq .
```
**Expected**:
```json
{
  "id": "order_SOdYERV1X0nGxM",
  "currency": "INR",
  "amount": 100000,
  "key_id": "rzp_test_SIJ9jKG3EVP8fp",
  "localOrderId": "LOC-1772952273361"
}
```

---

## 📦 Order Verification

### Test 5: Check Orders After Payment
```bash
curl "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq .
```
**Expected (after payment)**:
```json
{
  "ok": true,
  "orders": [
    {
      "id": 1,
      "amount": 1050,
      "status": "paid",
      "buyerEmail": "test@example.com",
      "shipment": {...}
    }
  ]
}
```

### Test 6: Check Orders (Empty)
```bash
curl "https://nekxuz-backend.onrender.com/api/orders?email=nonexistent@example.com" | jq .
```
**Expected**: `{"ok": true, "orders": []}`

---

## 📊 Render Logs

### View Live Logs
```bash
# Option 1: Use Render Dashboard
# Go to: https://dashboard.render.com
# Click: nekxuz-backend
# Click: Logs tab

# Option 2: Watch logs in real-time (if you have Render CLI)
# render logs nekxuz-backend
```

**After payment, look for**:
```
Verify Payment Request
✅ Signature verified
✅ ORDER SAVED TO DB - ID: 1
🚀 STARTING SHIPROCKET SHIPMENT CREATION
✅ SHIPROCKET RESPONSE
```

---

## 🔍 Debug Commands

### Check Backend Environment
```bash
# Check if backend is responding
curl -v https://nekxuz-backend.onrender.com/ 2>&1 | grep -E "< HTTP|access-control"
```

### Test Specific Endpoint
```bash
# Payment verify endpoint (with test data)
curl -X POST https://nekxuz-backend.onrender.com/api/payment/verify \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_test",
    "razorpay_payment_id": "pay_test",
    "razorpay_signature": "invalid_sig"
  }' | jq .
```
**Expected**: `{"ok": false, "message": "Invalid signature"}`

---

## 🎯 Post-Payment Verification

### After You Complete Payment, Run This:

**Step 1: Get order ID from success screen**
```
From frontend success screen, note the Order ID shown
Example: Order ID: 1
```

**Step 2: Check database for order**
```bash
# Replace YOUR_EMAIL with the email you used in payment
curl "https://nekxuz-backend.onrender.com/api/orders?email=YOUR_EMAIL" | jq .

# Example:
curl "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq .
```

**Step 3: Check specific order**
```bash
# Extract order ID from Step 2 response
# Example: order ID is 1, shipment_id is 12345

# You can now track it in Shiprocket using:
curl "https://nekxuz-backend.onrender.com/api/shipment/track/12345" | jq .
```

**Step 4: View Render logs**
```bash
# Go to: https://dashboard.render.com
# Service: nekxuz-backend
# Tab: Logs
# Search for: "Verify Payment Request"
# Check for "ORDER SAVED TO DB"
```

---

## 🧪 Full Test Scenario

Run this sequence to test everything:

```bash
#!/bin/bash

echo "1️⃣ Testing Backend Health..."
curl -s https://nekxuz-backend.onrender.com/ | jq .

echo -e "\n2️⃣ Testing Stock Endpoint..."
curl -s https://nekxuz-backend.onrender.com/api/stock | jq . | head -10

echo -e "\n3️⃣ Creating Payment Order..."
ORDER=$(curl -s -X POST https://nekxuz-backend.onrender.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "INR"}')
echo $ORDER | jq .
ORDER_ID=$(echo $ORDER | jq -r '.id')
echo "Order ID: $ORDER_ID"

echo -e "\n4️⃣ Checking Orders (before payment)..."
curl -s "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq .

echo -e "\n✅ Tests complete!"
echo "Now complete payment on frontend, then run:"
echo "curl \"https://nekxuz-backend.onrender.com/api/orders?email=test@example.com\" | jq ."
```

---

## 📱 Frontend Test Checklist

- [ ] Website loads: https://nekxuz.in
- [ ] Products display
- [ ] Add to cart works
- [ ] Checkout button works
- [ ] Login/auth works
- [ ] Shipping form fills properly
- [ ] "Pay Now" button appears
- [ ] Razorpay modal opens
- [ ] Test card: 4111 1111 1111 1111
- [ ] Expiry: 12/25
- [ ] CVV: 123
- [ ] Payment processes
- [ ] Success screen appears
- [ ] Order ID shows
- [ ] "My Orders" tab shows order

---

## 🎁 Useful Aliases

Add to your `.zshrc` or `.bash_profile`:

```bash
# Check if backend is up
alias backend-status='curl -s https://nekxuz-backend.onrender.com/ | jq .'

# Check orders
alias check-orders='curl -s "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq .'

# Check stock
alias check-stock='curl -s https://nekxuz-backend.onrender.com/api/stock | jq . | head -20'

# Create test order
alias create-order='curl -s -X POST https://nekxuz-backend.onrender.com/api/payment/create-order -H "Content-Type: application/json" -d "{\"amount\": 1000, \"currency\": \"INR\"}" | jq .'

# View frontend
alias open-frontend='open https://nekxuz.in'

# View Render logs
alias render-logs='open https://dashboard.render.com'

# View Razorpay dashboard
alias razorpay-dash='open https://dashboard.razorpay.com'

# View Shiprocket dashboard
alias shiprocket-dash='open https://shiprocket.in'
```

Then use simply:
```bash
backend-status
check-orders
check-stock
create-order
```

---

## 🚀 One-Liner Tests

```bash
# Test everything in sequence
curl -s https://nekxuz-backend.onrender.com/ && \
curl -s https://nekxuz-backend.onrender.com/api/stock | jq '.stock | keys | length' && \
echo "✅ All endpoints responding"
```

```bash
# Pretty print orders
curl -s "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq '.orders | map({id, amount, status, buyerEmail})'
```

```bash
# Get latest order
curl -s "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq '.orders[-1]'
```

---

## 📊 Response Formats

### Successful Order Response
```json
{
  "id": 1,
  "invoice": "invoice_pay_xxx",
  "amount": 1050,
  "currency": "INR",
  "status": "paid",
  "subtotal": 1000,
  "tax": 50,
  "shippingCharges": 0,
  "buyerName": "Test User",
  "buyerEmail": "test@example.com",
  "buyerPhone": "9876543210",
  "buyerAddress": "123 Test Street",
  "buyerCity": "Delhi",
  "buyerState": "Delhi",
  "buyerPincode": "110001",
  "shipment": {
    "shipment_id": "12345",
    "awb": "ABC123",
    "courier": "Shiprocket",
    "status": "booked"
  },
  "createdAt": "2026-03-08T10:00:00Z"
}
```

### Error Response
```json
{
  "ok": false,
  "message": "Invalid signature"
}
```

---

## 🎯 Summary

**Backend is live and working!**

Just complete the payment flow on frontend and verify with these commands:

1. Complete payment at https://nekxuz.in
2. Check orders: `curl "https://nekxuz-backend.onrender.com/api/orders?email=YOUR_EMAIL" | jq .`
3. Check Render logs: https://dashboard.render.com
4. Check Shiprocket: https://shiprocket.in
5. Verify My Orders tab shows order

**Done!** 🎉
