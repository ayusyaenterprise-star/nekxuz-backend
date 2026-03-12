# 🐛 Debugging: Orders Not Showing & Shiprocket Not Receiving Orders

## Issues Identified

### 1️⃣ Database Migrations Missing ✅ FIXED
- **Problem**: Order tables didn't exist in database
- **Cause**: Prisma migrations weren't running on startup
- **Fix Applied**: Added migrations to Dockerfile and npm start script
- **Status**: ✅ FIXED - Database tables now exist

### 2️⃣ Orders Not Being Created (Still Investigating)
- **Symptom**: Orders tab is blank after payment
- **Likely Causes**:
  1. Frontend not calling `/api/payment/verify` endpoint
  2. Payment verification failing due to signature mismatch
  3. Order creation failing silently
  4. Frontend not passing correct payload structure

### 3️⃣ Shiprocket Not Receiving Orders (Depends on #2)
- **Symptom**: No shipments created
- **Dependency**: Shiprocket is called AFTER order is created in `/api/payment/verify`
- **If orders aren't created** → Shiprocket won't be called

## Payment Flow Verification

### Backend Endpoints

#### 1. Create Order (Initial)
```bash
POST /api/payment/create-order
Content-Type: application/json

{
  "amount": 1000,
  "currency": "INR",
  "invoiceNumber": "INV-001"
}
```

**Response:**
```json
{
  "id": "order_SOchRCbbH6jVvj",
  "currency": "INR",
  "amount": 100000,
  "key_id": "rzp_test_...",
  "localOrderId": "LOC-1772949274657"
}
```

**What happens**: Creates Razorpay order (NOT database order yet)

#### 2. Verify Payment (After Payment Success) - CRITICAL!
```bash
POST /api/payment/verify
Content-Type: application/json

{
  "razorpay_order_id": "order_SOchRCbbH6jVvj",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx",
  "invoicePayload": {
    "buyer": "John Doe",
    "buyerEmail": "john@example.com",
    "buyerPhone": "9876543210",
    "buyerAddress": "123 Main St",
    "buyerCity": "Delhi",
    "buyerState": "Delhi",
    "buyerPincode": "110001",
    "order_items": [
      {
        "product_id": "f1",
        "name": "Face Wash",
        "units": 2,
        "selling_price": 500,
        "manufacturer": "Real Herbal"
      }
    ],
    "shipping_charges": 50
  }
}
```

**What happens**:
1. Verifies Razorpay signature
2. Creates order in database ← **THIS IS CRITICAL**
3. Creates shipment with Shiprocket ← Depends on step 2
4. Generates invoice PDF
5. Returns order confirmation

## Troubleshooting Steps

### Step 1: Check Backend Logs
On Render dashboard:
1. Click `nekxuz-backend` service
2. Click "Logs" tab
3. Look for payment verification logs

**Expected log output when payment succeeds:**
```
Verify Payment Request
✅ Signature verified
✅ ORDER SAVED TO DB - ID: ...
✅ Buyer Email: ...
✅ Amount: ...
🚀 STARTING SHIPROCKET SHIPMENT CREATION
✅ SHIPROCKET RESPONSE: ...
```

**If NOT seeing these logs**: Frontend not calling `/api/payment/verify`

### Step 2: Check if Frontend is Calling Verify
Look at the React app code on Hostinger (nekxuz.in):
- After Razorpay payment success, frontend MUST call `/api/payment/verify`
- This is done in the Razorpay `handler` callback

**Example code (should exist in frontend):**
```javascript
const handler = async (response) => {
  try {
    // 1. Get payment details from Razorpay
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
    
    // 2. Call backend to verify payment
    const verifyRes = await fetch('https://nekxuz-backend.onrender.com/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        invoicePayload: cartData,  // Cart items, buyer info, etc.
      })
    });
    
    const result = await verifyRes.json();
    if (result.ok) {
      // Show success message
      alert('Order placed successfully!');
    } else {
      alert('Payment verification failed');
    }
  } catch (error) {
    console.error('Verification error:', error);
  }
};
```

### Step 3: Check Order in Database
If you want to verify orders were created, use:
```bash
curl -s "https://nekxuz-backend.onrender.com/api/orders?email=user@example.com" | jq .
```

**Expected response if orders exist:**
```json
{
  "ok": true,
  "orders": [
    {
      "id": 1,
      "invoice": "INV-...",
      "amount": 1050,
      "status": "paid",
      "buyerEmail": "user@example.com",
      "createdAt": "2026-03-08T...",
      ...
    }
  ]
}
```

**If `orders: []`**: No orders created (payment verify not called)

## Environment Check

### Required for Orders to Work

✅ `RAZORPAY_KEY_ID` - Check if set
✅ `RAZORPAY_KEY_SECRET` - Check if set
✅ Prisma database connection - Check if working

### Required for Shiprocket to Work

❓ `SHIPROCKET_EMAIL` - Set? Check .env
❓ `SHIPROCKET_PASSWORD` - Set? Check .env

If Shiprocket credentials missing → Orders created but shipments NOT created

## The Complete Payment Flow

```
Frontend (nekxuz.in)
    ↓
1. User adds items to cart
    ↓
2. User clicks "Checkout"
    ↓
3. Frontend calls POST /api/payment/create-order
    ↓
Backend (creates Razorpay order, returns key)
    ↓
4. Frontend shows Razorpay payment popup
    ↓
5. User completes payment in Razorpay
    ↓
6. Razorpay calls frontend handler with payment details
    ↓
7. Frontend calls POST /api/payment/verify ← **CRITICAL STEP**
    ↓
Backend (/api/payment/verify)
    ↓
8. Verify Razorpay signature
    ↓
9. Create order in database
    ↓
10. Create shipment with Shiprocket
    ↓
11. Generate invoice PDF
    ↓
12. Return success response
    ↓
Frontend
    ↓
13. Show "Order placed successfully"
    ↓
User
    ↓
14. Sees order in "Orders" tab
```

## Common Issues & Fixes

### Issue 1: Frontend Not Calling /api/payment/verify
**Symptom**: No orders created, no Shiprocket calls
**Fix**: Ensure frontend `handler` callback calls `/api/payment/verify`

### Issue 2: CORS Error on /api/payment/verify Call
**Symptom**: Frontend console shows CORS error on verify endpoint
**Fix**: Already fixed - CORS headers set for all endpoints

### Issue 3: Invalid Signature Error
**Symptom**: Backend returns "Invalid signature"
**Cause**: Razorpay signature mismatch
**Fix**: Ensure `RAZORPAY_KEY_SECRET` is correct

### Issue 4: Shiprocket Not Getting Orders
**Symptom**: Orders created in DB but no Shiprocket shipments
**Cause 1**: Shiprocket credentials missing
**Cause 2**: Shiprocket integration failing silently
**Fix**: Check logs for Shiprocket errors

## Quick Test

To verify the entire flow, manually test:

```bash
# 1. Create order
ORDER=$(curl -s -X POST https://nekxuz-backend.onrender.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "INR"}')

echo "Order created: $ORDER"

# 2. Extract order ID
ORDER_ID=$(echo $ORDER | jq -r '.id')

# 3. Simulate Razorpay signature (ONLY FOR TESTING - use real signature in production)
# In production, Razorpay provides real signature

# 4. Verify payment
curl -s -X POST https://nekxuz-backend.onrender.com/api/payment/verify \
  -H "Content-Type: application/json" \
  -d "{
    \"razorpay_order_id\": \"$ORDER_ID\",
    \"razorpay_payment_id\": \"pay_test_123\",
    \"razorpay_signature\": \"test_signature\",
    \"invoicePayload\": {
      \"buyer\": \"Test User\",
      \"buyerEmail\": \"test@example.com\",
      \"buyerPhone\": \"9999999999\",
      \"buyerAddress\": \"123 Test\",
      \"buyerCity\": \"Delhi\",
      \"buyerState\": \"Delhi\",
      \"buyerPincode\": \"110001\",
      \"order_items\": [{
        \"product_id\": \"f1\",
        \"name\": \"Test\",
        \"units\": 1,
        \"selling_price\": 100,
        \"manufacturer\": \"Test\"
      }],
      \"shipping_charges\": 0
    }
  }" | jq .
```

## Action Items

### For You (User):
1. ✅ Database migrations now running - FIXED
2. **TODO**: Verify frontend is calling `/api/payment/verify`
3. **TODO**: Check `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` in `.env`
4. **TODO**: Test full payment flow with real payment

### For Frontend Developers:
1. Verify Razorpay handler calls `/api/payment/verify`
2. Send all required fields in `invoicePayload`
3. Handle response properly
4. Show success message

---

**The backend is now ready to create orders and shipments!**

**The remaining issue is likely in the frontend payment handler not calling `/api/payment/verify`.**

Let me know if you need help debugging the frontend or if you want me to check the frontend code!
