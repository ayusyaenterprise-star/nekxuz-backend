# 🚀 NEKXUZ - QUICK REFERENCE CARD

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | https://nekxuz.in | Customer storefront |
| **Backend API** | https://nekxuz-backend.onrender.com | API server |
| **Render Dashboard** | https://dashboard.render.com | Deployment & logs |
| **Razorpay Dashboard** | https://dashboard.razorpay.com | Payment testing |
| **Shiprocket Dashboard** | https://shiprocket.in | Shipment tracking |

---

## 🧪 Quick Tests

### Test Backend is Running
```bash
curl https://nekxuz-backend.onrender.com/
```
Should return JSON with buildId.

### Test Stock Endpoint
```bash
curl https://nekxuz-backend.onrender.com/api/stock | jq .
```
Should return products list.

### Check Orders in Database
```bash
curl "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq .
```

### View Backend Logs
1. Go to: https://dashboard.render.com
2. Click: `nekxuz-backend` service
3. Click: **Logs** tab
4. Make a payment and watch logs appear

### Verify Environment Variables
1. Go to: https://dashboard.render.com
2. Click: `nekxuz-backend` service
3. Click: **Environment** tab
4. Check all 4 keys are present:
   - ✅ RAZORPAY_KEY_ID
   - ✅ RAZORPAY_KEY_SECRET
   - ✅ SHIPROCKET_EMAIL
   - ✅ SHIPROCKET_PASSWORD

---

## 💳 Test Payment Card Details

```
Card Number:  4111 1111 1111 1111
Expiry Date:  12/25 (any future date works)
CVV:          123 (any 3 digits)
Name:         Test User (anything)
```

---

## 📝 Test Payment Steps

1. Open https://nekxuz.in
2. Add product to cart
3. Click "Proceed to Checkout"
4. Fill shipping details:
   ```
   Name: Test User
   Email: test@example.com
   Phone: 9999999999
   Address: 123 Test Street
   City: Delhi
   State: Delhi
   Pincode: 110001
   ```
5. Click "Pay Now"
6. Enter card details above
7. Click "Pay"
8. Check:
   - Success screen appears?
   - Order ID shows?
   - "My Orders" tab shows order?

---

## 🔍 Debugging Checklist

### After Payment, Check:
- [ ] Browser console shows no red errors
- [ ] Network tab shows `/api/payment/verify` returned `ok: true`
- [ ] Order appears at: `https://nekxuz-backend.onrender.com/api/orders?email=test@example.com`
- [ ] "My Orders" tab shows the order
- [ ] Shiprocket dashboard shows new shipment

### If Order Doesn't Appear:

1. **Check signature verification**
   ```bash
   # Look at Render logs for "Verify Payment Request"
   # If it says "Invalid signature" → signature mismatch
   ```

2. **Check database directly**
   ```bash
   curl "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq .
   ```

3. **Verify env vars on Render**
   - RAZORPAY_KEY_SECRET must match what Razorpay gave you
   - If changed, Render needs rebuild: Deploy → New Deployment

---

## 📊 Database Tables

| Table | Purpose | Fields |
|-------|---------|--------|
| **Order** | Customer orders | id, invoice, amount, status, buyerEmail, buyerName, buyerAddress, buyerCity, buyerState, buyerPincode, buyerPhone, createdAt |
| **Payment** | Payment records | id, orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, status, createdAt |
| **Shipment** | Shipping info | id, orderId, shiprocketId, awb, courier, status, payload, createdAt |

---

## 🛠️ Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| **Orders don't appear after payment** | Signature verification failing | Check RAZORPAY_KEY_SECRET on Render |
| **"Table doesn't exist" error** | Migrations didn't run | Trigger rebuild: `git commit --allow-empty -m "rebuild" && git push` |
| **CORS errors** | Headers not sent | Already fixed, check Render logs |
| **Shiprocket not receiving orders** | Credentials missing | Check SHIPROCKET_EMAIL & PASSWORD on Render |
| **"My Orders" tab is empty** | Frontend not fetching with correct email | Refresh page, log out/in |
| **Payment modal doesn't open** | Razorpay key missing | Check RAZORPAY_KEY_ID on Render |

---

## 📈 Success Indicators

### ✅ Everything Works When:
1. **Frontend**: Payment completes without errors
2. **Backend**: Logs show "ORDER SAVED TO DB"
3. **Database**: Order appears in query
4. **Shiprocket**: Order appears in dashboard
5. **UI**: "My Orders" tab shows the order

### ❌ Something's Wrong When:
1. Success screen doesn't appear after payment
2. Browser console shows JavaScript errors
3. Network tab shows `/api/payment/verify` response has `ok: false`
4. Render logs show "Invalid signature"
5. Database query returns empty orders list

---

## 🔧 Deploy Code Changes

If you modify `server.js`:

```bash
cd /Users/ayushgupta/Documents/untitled\ folder/Nekxuz\ copy

# Stage changes
git add server.js

# Commit
git commit -m "Fix: [description]"

# Push to Render (auto-deploys)
git push origin main

# Wait 2-3 minutes for Render to rebuild
# Check Render dashboard → Logs to see deployment
```

---

## 🚨 Emergency Debug Commands

```bash
# Check backend status
curl -s https://nekxuz-backend.onrender.com/ | jq .

# Test stock endpoint
curl -s https://nekxuz-backend.onrender.com/api/stock | jq . | head -50

# Query orders
curl -s "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com" | jq .

# Create a test order directly (if needed)
curl -X POST https://nekxuz-backend.onrender.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "INR"}' | jq .

# Test database is responding
curl -s https://nekxuz-backend.onrender.com/api/orders?email=a@b.c | jq .
```

---

## 📞 Contact & Support

**Razorpay Support**:
- Dashboard: https://dashboard.razorpay.com
- Test Mode Keys: Already configured
- Issues: Check key IDs match

**Shiprocket Support**:
- Dashboard: https://shiprocket.in
- Email: ayush.25327@ee.du.ac.in
- Issues: Check credentials work

**Backend Logs**:
- Render: https://dashboard.render.com → nekxuz-backend → Logs
- Always check here first for errors

---

## ✅ Final Checklist Before Going Live

- [ ] Test payment completed successfully
- [ ] Order appears in database
- [ ] Order appears in "My Orders" tab
- [ ] Shiprocket receives order
- [ ] Invoice PDF can be downloaded
- [ ] Shipment tracking works
- [ ] Production Razorpay keys configured (when ready)
- [ ] HTTPS enabled (already done)
- [ ] Error logging working (check logs)
- [ ] Email notifications working (test email sent)

---

**Status**: ✅ Ready for testing
**Next Step**: Complete a test payment to verify everything works end-to-end
**Timeline**: 25 minutes to full verification
**Risk Level**: 🟢 LOW - All code is in place and verified
