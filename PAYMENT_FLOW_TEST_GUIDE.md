# 🔍 PAYMENT FLOW - TESTING GUIDE

## Quick Diagnosis

Your frontend IS calling `/api/payment/verify` correctly. The problem is likely one of these:

### ❌ Problem #1: Invalid Razorpay Signature
**Symptom**: Backend returns `{"ok": false, "message": "Invalid signature"}`
**Cause**: Signature verification failing - mismatch between:
- `razorpay_order_id` 
- `razorpay_payment_id`
- `razorpay_signature`

**Test**:
1. Open browser DevTools (F12)
2. Go to "Network" tab
3. Complete a test payment on https://nekxuz.in
4. Look for POST to `/api/payment/verify`
5. Check the request body - are all 3 fields present?

### ❌ Problem #2: Razorpay Credentials Missing
**Symptom**: Orders created in database but NOT in Shiprocket
**Cause**: Environment variables missing on Render:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

**Fix**: Check Render dashboard → Environment variables

### ❌ Problem #3: Shiprocket Credentials Missing
**Symptom**: Orders created in database but shiprocket field returns `{ success: false, packages: [] }`
**Cause**: Missing Shiprocket credentials on Render:
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`

**Fix**: Check Render dashboard → Environment variables

### ✅ Problem #4: Everything Works (Most Likely)
**Symptom**: After payment:
- Order appears in database ✓
- Invoice PDF generated ✓
- Shiprocket shipment created ✓
- Frontend shows success screen ✓

**Why orders don't show in UI**: Frontend `/api/orders` endpoint might not be filtering correctly

---

## Test Payment Flow (Step by Step)

### Step 1: Verify Backend Responds
```bash
curl -s https://nekxuz-backend.onrender.com/api/orders?email=test@example.com | jq .
```

**Expected response:**
```json
{
  "ok": true,
  "orders": []
}
```

If you get `Table 'main.Order' does not exist` → Migrations haven't run yet.

### Step 2: Check Environment Variables on Render

Log into Render dashboard:
1. Click `nekxuz-backend` service
2. Click "Environment" tab
3. Verify these are set:
   - ✅ `RAZORPAY_KEY_ID=rzp_test_xxxxx` (test key)
   - ✅ `RAZORPAY_KEY_SECRET=xxxxx`
   - ✅ `SHIPROCKET_EMAIL=your_email@example.com`
   - ✅ `SHIPROCKET_PASSWORD=your_password`

If ANY are missing → Payment won't work properly

### Step 3: Check Backend Logs on Render

On Render dashboard:
1. Click `nekxuz-backend` service
2. Click "Logs" tab
3. Make a test payment on frontend
4. Look for these logs:

**✅ Success flow:**
```
Verify Payment Request
✅ Signature verified
💾 SAVING ORDER TO DATABASE
✅ ORDER SAVED TO DB - ID: 1
🚀 STARTING SHIPROCKET SHIPMENT CREATION
✅ SHIPROCKET RESPONSE: {...}
✅ PDF Generated and saved as: invoice_pay_xxx.pdf
```

**❌ Failure flow:**
```
Verify Payment Request
Invalid signature  ← Problem here!
```

### Step 4: Complete Test Payment

1. Go to https://nekxuz.in
2. Add product to cart
3. Click "Proceed to Checkout"
4. Fill shipping details
5. Click "Pay Now"
6. Use test card: **4111 1111 1111 1111**
7. Any future date (e.g., 12/25)
8. Any CVV (e.g., 123)
9. Press "Pay"

### Step 5: Check Browser Console
After payment, in browser DevTools → Console, look for:

**✅ Success:**
```
💳 Payment success response: {
  razorpay_order_id: "order_xxx",
  razorpay_payment_id: "pay_xxx",
  razorpay_signature: "sig_xxx"
}
✅ Verification response received
🔍 PAYMENT VERIFICATION RESPONSE:
Full response: {ok: true, invoice: "invoice_pay_xxx", orderId: 1, ...}
final.ok: true
✅ SETTING ORDER SUCCESS WITH: {...}
✅ State updated, success screen should now be visible!
```

**❌ Failure:**
```
❌ Payment verification failed: Invalid signature
```
OR
```
❌ Verification error: ...
```

### Step 6: Check Database Orders
After successful payment:
```bash
curl -s "https://nekxuz-backend.onrender.com/api/orders?email=YOUR_EMAIL" | jq .
```

**Expected:**
```json
{
  "ok": true,
  "orders": [
    {
      "id": 1,
      "amount": 1050,
      "status": "paid",
      "buyerEmail": "your_email@gmail.com",
      "shipment": {
        "shipment_id": "1234567",
        "awb": "ABC123",
        "courier": "Shiprocket",
        "status": "booked"
      },
      ...
    }
  ]
}
```

---

## Debugging Checklist

### Frontend Checks
- [ ] Razorpay is being called correctly (`handler` function exists)
- [ ] Payment details (order_id, payment_id, signature) are being passed
- [ ] `/api/payment/verify` endpoint is being called
- [ ] Network tab shows request being sent to backend
- [ ] Browser console doesn't show CORS errors

### Backend Checks
- [ ] Render logs show signature verification passing
- [ ] Render logs show "ORDER SAVED TO DB"
- [ ] Environment variables are set
- [ ] Database migrations have run
- [ ] Shiprocket credentials are correct

### Database Checks
- [ ] Order table exists and has records
- [ ] Orders have correct buyer email
- [ ] Shipment table has records (if Shiprocket credentials set)

---

## Common Error Messages & Fixes

### Error: "Invalid signature"
**Cause**: Razorpay signature doesn't match
**Fix**: 
1. Check `RAZORPAY_KEY_SECRET` is correct in .env
2. Use test credentials if in development
3. Ensure order is created with backend (not skipped step 1)

### Error: "The table 'main.Order' does not exist"
**Cause**: Prisma migrations haven't run
**Fix**: Already fixed in previous deployment. If still occurring:
```bash
# Trigger rebuild on Render by pushing empty commit
git commit --allow-empty -m "Trigger rebuild"
git push origin main
# Wait 2-3 minutes for Render to rebuild
```

### Error: "CORS error on /api/payment/verify"
**Cause**: CORS headers not set (should be fixed)
**Fix**: Already fixed. If still occurring, verify CORS middleware is in server.js

### Orders appear in database but not in frontend UI
**Cause**: Frontend order list fetch not using correct email
**Fix**: Check that frontend passes `email` parameter:
```javascript
fetch(`${API_BASE_URL}/api/orders?email=${userEmail}`)
```

---

## What Should Happen (Complete Flow)

```
1. Frontend adds items to cart ✓

2. User clicks "Pay Now"
   └─ Frontend: POST /api/payment/create-order
   └─ Backend: Creates Razorpay order
   └─ Returns: { id: "order_xxx", key_id: "rzp_test_xxx", ... }

3. Razorpay payment modal opens ✓

4. User enters card details and completes payment
   └─ Card charged
   └─ Razorpay verifies payment

5. Razorpay returns to frontend with payment details
   └─ handler() function called with:
      - razorpay_order_id
      - razorpay_payment_id  
      - razorpay_signature

6. Frontend: POST /api/payment/verify
   └─ Sends: {
       razorpay_order_id,
       razorpay_payment_id,
       razorpay_signature,
       invoicePayload: { ...items, buyer info... }
     }

7. Backend (/api/payment/verify)
   └─ ✅ Verifies Razorpay signature
   └─ ✅ Creates ORDER in database
   └─ ✅ Calls Shiprocket API (if credentials set)
   └─ ✅ Creates SHIPMENT in database
   └─ ✅ Generates PDF invoice
   └─ Returns: {
       ok: true,
       invoice: "invoice_pay_xxx",
       orderId: 1,
       shipment: { shipment_id: "123", awb: "ABC", ... }
     }

8. Frontend receives success response
   └─ Shows "Order placed successfully"
   └─ Displays order ID, tracking info
   └─ Allows invoice download

9. User checks "Orders" tab
   └─ Sees order with status "paid"
   └─ Sees tracking info (if Shiprocket enabled)
   └─ Can download invoice

10. Shiprocket receives order
    └─ Creates shipment entry
    └─ Assigns AWB (Air Waybill)
    └─ Picks up package
    └─ Tracks in real-time
```

---

## Next Steps

1. **Complete a test payment** on https://nekxuz.in with test card
2. **Check Render logs** for payment verification logs
3. **Query database** to see if order was created
4. **Share any error messages** you see in:
   - Browser console (DevTools → Console)
   - Render logs (Render dashboard → Logs)
   - Response body (DevTools → Network tab → /api/payment/verify response)

---

**The system is ready. Let's verify it's working!**
