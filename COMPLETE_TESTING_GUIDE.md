# 🧪 COMPLETE TESTING GUIDE - Nekxuz E-Commerce Platform

## System Overview
✅ **Frontend**: https://nekxuz.in (Hostinger, FREE)
✅ **Backend**: https://api.nekxuz.in (Hostinger Node.js, FREE)
✅ **Payment**: Razorpay (PRODUCTION MODE)
✅ **Database**: File-based JSON (orders stored at `/data/orders.json`)

---

## PHASE 1: Backend Verification

### 1.1 Check Backend is Running
```bash
curl https://api.nekxuz.in/
```

**Expected Response:**
```json
{
  "ok": true,
  "message": "Nekxuz Backend Running on Hostinger",
  "razorpay_mode": "PRODUCTION",
  "endpoints": {
    "payment": "/api/payment",
    "verify": "/api/verify",
    "orders": "/api/orders"
  }
}
```

### 1.2 Test Payment Creation
```bash
curl -X POST https://api.nekxuz.in/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "invoiceNumber": "INV-TEST-001",
    "email": "test@example.com"
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "orderId": "order_SRcLVxPS4pthA6",
  "amount": 50000,
  "currency": "INR",
  "key_id": "rzp_live_SMqkVvPnni1H3X"
}
```

### 1.3 Test Orders Retrieval
```bash
curl "https://api.nekxuz.in/api/orders?email=infodevayu@enterprisegmail.com"
```

**Expected Response:**
```json
{
  "ok": true,
  "orders": [],
  "count": 0
}
```

---

## PHASE 2: Frontend Testing

### 2.1 Load Website
Open https://nekxuz.in in your browser

✅ Check:
- [ ] Website loads without blank page
- [ ] Product images display correctly
- [ ] Stock count shows (e.g., "2 in stock")
- [ ] Out-of-stock items show "Out of Stock" badge

### 2.2 Test Product Selection
- [ ] Click on a product
- [ ] Product modal opens
- [ ] Can increment/decrement quantity
- [ ] Stock decreases when quantity increases
- [ ] Cannot exceed available stock

### 2.3 Test Add to Cart
- [ ] Add product to cart
- [ ] Cart icon shows item count
- [ ] Can view cart items
- [ ] Cart displays correct total price

---

## PHASE 3: Checkout & Payment Flow

### 3.1 Proceed to Checkout
- [ ] Click "Checkout" or cart icon
- [ ] Checkout form appears
- [ ] Can enter email: **infodevayu@enterprisegmail.com**
- [ ] Can enter delivery address details
- [ ] Submit button is clickable

### 3.2 Payment Gateway Integration
- [ ] Razorpay checkout appears
- [ ] Test payment details shown correctly
- [ ] Amount matches your cart total

### 3.3 Complete Test Payment
Use Razorpay test card (if in TEST mode):
```
Card: 4111 1111 1111 1111
Expiry: 12/99
CVV: 123
OTP: 123456
```

OR for PRODUCTION (your current mode):
```
Use actual Razorpay payment flow
```

**✅ EXPECTED**: Payment completes successfully, you see success message

---

## PHASE 4: Order Verification

### 4.1 Check "My Orders" Tab
- [ ] Click "My Orders" after successful payment
- [ ] Your order should appear
- [ ] Shows order ID, amount, status
- [ ] Shows order date/time

### 4.2 Verify Backend Stored Order
Check via API:
```bash
curl "https://api.nekxuz.in/api/orders?email=infodevayu@enterprisegmail.com"
```

Should show your recent orders

### 4.3 Check File Storage (Server-side)
SSH into Hostinger and check:
```bash
cat ~/data/orders.json
```

Should contain your order data

---

## PHASE 5: Stock Management

### 5.1 Check Stock After Purchase
- [ ] Product stock decreased by purchased quantity
- [ ] If stock reaches 0, product shows "Out of Stock"
- [ ] Cannot add 0-stock items to cart

### 5.2 Admin Stock Update (if implemented)
- [ ] Access admin panel
- [ ] Update product stock
- [ ] Refresh frontend
- [ ] Stock count updated correctly

---

## PHASE 6: Error Handling

### 6.1 Test Empty Cart Checkout
- [ ] Clear cart
- [ ] Try to checkout
- [ ] Should show error: "Cart is empty"

### 6.2 Test Invalid Quantities
- [ ] Try quantity > available stock
- [ ] Should show error or prevent submission

### 6.3 Test Missing Email
- [ ] Try checkout without email
- [ ] Should show validation error

### 6.4 Test Network Issues
- [ ] With DevTools, throttle network to "slow 3G"
- [ ] Place order
- [ ] Should either complete or show error gracefully

---

## PHASE 7: Browser Compatibility

Test on:
- [ ] Chrome/Edge (Desktop)
- [ ] Safari (if Mac)
- [ ] Firefox
- [ ] Mobile Chrome
- [ ] Mobile Safari

Check:
- [ ] No console errors
- [ ] Responsive layout works
- [ ] Checkout works on mobile
- [ ] Payment modal displays correctly

---

## 🎯 Success Criteria

**Your system is PRODUCTION READY when:**

✅ Backend endpoint `/` returns healthy status
✅ Backend endpoint `/api/payment` creates orders
✅ Backend endpoint `/api/orders` retrieves orders
✅ Frontend loads without blank page
✅ Products display with images and stock
✅ Checkout form works
✅ Payment completes successfully
✅ Order appears in "My Orders" immediately
✅ Stock decreases after purchase
✅ No console errors

---

## 📊 Test Results Log

Document your test results:

```
Test Date: _______________
Tester: ___________________
Browser: __________________

Backend Status: ✅ ⚠️ ❌
Frontend Load: ✅ ⚠️ ❌
Payment Flow: ✅ ⚠️ ❌
Order Saved: ✅ ⚠️ ❌
Stock Updated: ✅ ⚠️ ❌

Issues Found:
1. _________________________
2. _________________________

Notes:
_________________________________
```

---

## 🚨 If Something Breaks

### Backend Not Responding
1. Check Hostinger Node.js application is running
2. Restart application in control panel
3. Check error logs in Hostinger
4. Verify `server.js` is in correct directory

### Orders Not Saving
1. Check `/data/` folder exists on server
2. Verify file permissions allow write access
3. Check `server.js` includes file storage code
4. Restart Node.js application

### Frontend Not Loading
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check if `/new_build/` files were uploaded
3. Verify domain SSL certificate is valid
4. Check browser console for errors

### Payment Not Working
1. Verify Razorpay keys are production keys
2. Check API_BASE_URL in App.js is correct
3. Test backend payment endpoint directly
4. Check Razorpay account is active

---

## ✅ READY TO LAUNCH!

Once all tests pass, your Nekxuz platform is ready for:
- 🎉 Real customer purchases
- 📦 Order fulfillment
- 💳 Real payment processing
- 📊 Sales tracking

Good luck! 🚀
