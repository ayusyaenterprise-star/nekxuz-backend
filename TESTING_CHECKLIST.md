# 🧪 Nekxuz Complete Testing Checklist

## ✅ Test 1: Razorpay Live Keys Check

**What to do:**
1. Go to https://nekxuz.in
2. Add any product to cart
3. Click "Proceed to Checkout"
4. **IMPORTANT:** Look at the payment form
   - Should show "Razorpay" logo/gateway
   - Should NOT say "TEST MODE"
   - Should show your payment options (cards, UPI, etc.)

**What to look for:**
- ✅ Real Razorpay gateway (not test)
- ✅ No "Test Mode" watermark
- ✅ Full payment options available

**If it shows TEST MODE:**
- Open browser Console (F12 → Console tab)
- Look for any error messages
- Check if API is responding correctly

---

## ✅ Test 2: Stock Management - Display & Prevention

**2A. Stock Display:**
1. Go to https://nekxuz.in
2. Browse Products
3. Click on any product
4. **Expected:** Should show "Stock: X units" or similar
5. If stock is 0, button should say "Out of Stock" (greyed out)

**2B. Out-of-Stock Prevention:**
1. Find a product with stock = 0
2. Try to add it to cart
3. **Expected:** Cannot add to cart, button is disabled
4. If you can add it, there's a bug ❌

**2C. Stock Updates After Purchase:**
1. Checkout with a product (stock = 5)
2. After successful payment
3. Go back to that product
4. **Expected:** Stock should now show 4 (reduced by 1)

---

## ✅ Test 3: Admin Portal Stock Updates

**Admin Portal Location:**
- Should be at: https://nekxuz.in/admin or similar
- Or check if there's an admin login somewhere

**To Update Stock:**
1. Login to admin portal
2. Find product management section
3. Edit a product's stock
4. Change stock value (e.g., from 10 to 15)
5. Save changes

**Verify:**
1. Logout from admin
2. Go to product on frontend
3. **Expected:** Stock should reflect the new value (15)

---

## ✅ Test 4: Order Storage in "My Orders" Tab

**Test Complete Purchase Flow:**

### Step 1: Make a Test Payment
1. Go to https://nekxuz.in
2. Add product to cart
3. Click "Proceed to Checkout"
4. Fill in details:
   - Email: `test@example.com`
   - Name: `Test User`
   - Address, phone, etc.
5. **Use TEST card:** `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
6. Click "Pay Now"

### Step 2: Check "My Orders" Tab
1. After payment succeeds
2. Click on "My Orders" tab
3. **Expected:** Your order should appear with:
   - ✅ Order ID
   - ✅ Date
   - ✅ Total Amount
   - ✅ Status: "Success" or "Completed"
   - ✅ Items list

### Step 3: Verify Order Details
- Click on the order to see full details
- Should show:
  - ✅ Razorpay Payment ID
  - ✅ Order items with quantities
  - ✅ Shipping address
  - ✅ Payment confirmation

---

## 🔍 WHERE TO CHECK IF THINGS FAIL

### If Orders Don't Appear:

**Check 1: Browser Console**
```
F12 → Console tab
Look for red errors like:
- "Failed to fetch from API"
- "404 Not Found"
- "Cors error"
```

**Check 2: Network Tab**
```
F12 → Network tab
1. Click "My Orders"
2. Look for API calls
3. Should see request to:
   https://nekxuz-backend-j1sj.vercel.app/api/orders
4. Should return 200 status
```

**Check 3: Verify Backend is Running**
```
Open in new tab: https://nekxuz-backend-j1sj.vercel.app
Should show JSON response like:
{
  "status": "ok",
  "message": "Nekxuz Backend Running on Firebase",
  "razorpay_mode": "PRODUCTION"
}
```

### If Stock Doesn't Update:

**Check the admin portal:**
1. Is stock field editable?
2. After editing, does it save?
3. Check browser console for save errors
4. Verify database is connected

**Check backend logs:**
- Vercel Dashboard → nekxuz-backend → Logs
- Look for any errors when stock updates

---

## 📊 Test Results Template

**Fill this out after testing:**

```
Date: ___________

✅ Razorpay Live Keys:
   - Shows production gateway? YES / NO
   - No test mode warning? YES / NO
   - Payment successful? YES / NO

✅ Stock Management:
   - Stock displays on product? YES / NO
   - Out-of-stock button disabled? YES / NO
   - Stock updates after purchase? YES / NO

✅ Admin Portal:
   - Can access admin? YES / NO
   - Can edit stock? YES / NO
   - Does updated stock show on frontend? YES / NO

✅ My Orders Tab:
   - Orders appear after purchase? YES / NO
   - All order details visible? YES / NO
   - Order status correct? YES / NO

⚠️  Any Issues Found:
   _________________________________
   _________________________________
```

---

## 🚨 CRITICAL CHECKS

Before going live, verify:

1. **Razorpay Mode:**
   - NOT in test mode
   - Using live keys: `rzp_live_SMqkVvPnni1H3X`

2. **Backend URL:**
   - Frontend using: `https://nekxuz-backend-j1sj.vercel.app`
   - Backend responding: YES

3. **Stock System:**
   - Initial stock loaded: YES
   - Updates after purchase: YES
   - Admin can modify: YES

4. **Payment Flow:**
   - Payment gateway shows: YES
   - Orders saved after payment: YES
   - "My Orders" tab works: YES

---

## 📞 Troubleshooting Commands

If something fails, run these in terminal:

```bash
# Test backend is accessible
curl https://nekxuz-backend-j1sj.vercel.app

# Check if orders endpoint works
curl https://nekxuz-backend-j1sj.vercel.app/api/orders?email=test@example.com

# Check app.js has correct URL
grep "API_BASE_URL" /path/to/src/App.js
```

---

## ✨ Once All Tests Pass

- ✅ Everything working = READY FOR PRODUCTION
- ❌ Something failing = Report the issue below
- ⚠️  Need clarification = Ask questions

**Report any issues you find!**
