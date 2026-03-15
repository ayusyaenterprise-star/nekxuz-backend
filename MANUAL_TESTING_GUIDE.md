# 🧪 Manual Testing Guide - Nekxuz Features

## 🎯 Pre-Testing Setup

### Current Configuration:
- ✅ Backend: `https://nekxuz-backend-j1sj.vercel.app` (Vercel - FREE)
- ✅ Frontend API URL: Correctly set to Vercel
- ✅ Razorpay: Production mode active
- ✅ React build: Ready to deploy
- ✅ Database: Render PostgreSQL

---

## 📝 TEST 1: Basic Frontend + Stock Display

### Objective: Verify website loads and shows stock correctly

**Steps:**
1. Upload `/new_build/` to Hostinger public_html
2. Open: `https://nekxuz.in`
3. Click "Browse Products"

**Expected Results:**
```
✅ Page loads without errors
✅ Products display with images
✅ Each product shows "Stock: X units"
✅ "Stock Indicator" color changes based on quantity
✅ No console errors (F12 → Console)
```

**If stock doesn't show:**
- Open browser console (F12)
- Look for errors like "Cannot read property 'stock'"
- Check if products are loading from database

---

## 🛒 TEST 2: Add to Cart & Out-of-Stock Prevention

### Objective: Verify cart works and prevents out-of-stock purchases

**Part A: Add Product with Stock**
1. Click on any product with stock > 0
2. In the modal, click "Add to Cart"
3. Confirm product appears in cart icon (number badge increases)

**Expected:**
```
✅ Product adds to cart successfully
✅ Cart count increases
✅ Product quantity can be adjusted in cart
```

**Part B: Prevent Out-of-Stock Purchase**
1. Find a product with Stock: 0
2. Try to add it to cart
3. Button should be disabled/greyed out

**Expected:**
```
✅ "Out of Stock" button is grey/disabled
✅ Cannot click to add
✅ Clear message shows unavailable
```

**Part C: Checkout Validation**
1. Add product with Stock: 5
2. In cart, try to increase quantity to 10 (beyond stock)
3. Try to checkout

**Expected:**
```
✅ Quantity field limits to available stock
✅ Error message: "Only 5 units available"
✅ Cannot proceed to checkout with invalid quantity
```

---

## 💳 TEST 3: Razorpay Payment (Production Mode)

### Objective: Verify payment gateway works in PRODUCTION mode

**Step 1: Start Checkout**
1. Add product to cart
2. Click "Proceed to Checkout"
3. Fill payment details form

**Expected:**
```
✅ Form has fields: Email, Name, Address, Phone, City, State, Pincode
✅ All fields are required (validation works)
```

**Step 2: Verify Payment Gateway is LIVE (Not Test)**
1. Click "Proceed to Payment" button
2. Razorpay modal should open

**Expected:**
```
✅ Razorpay modal shows (NOT a test modal)
✅ Shows: "Payment powered by Razorpay"
✅ NO red "TEST MODE" watermark anywhere
✅ Shows real payment options:
   - Credit/Debit Card
   - UPI
   - Net Banking
   - Wallets
```

**Step 3: Complete Test Payment**
1. Use test card: `4111 1111 1111 1111`
2. Expiry: Any future date (e.g., 12/25)
3. CVV: Any 3 digits (e.g., 123)
4. Click "Pay"

**Expected:**
```
✅ Payment succeeds
✅ Shows "Payment Successful" message
✅ Order details appear on screen
✅ NO error messages
```

**If payment fails:**
```
Check:
1. Browser console (F12 → Console) for errors
2. Network tab - see if API calls succeed
3. Backend logs: https://vercel.com/dashboard
4. Razorpay test payment keys are correct
```

---

## 📦 TEST 4: Order Appears in "My Orders" Tab

### Objective: Verify orders are saved and retrievable

**Step 1: After Successful Payment**
1. Stay on confirmation page or go back to home
2. Click "My Orders" tab
3. Enter the email used in checkout

**Expected:**
```
✅ Order appears in the list
✅ Shows:
   - Order ID
   - Date
   - Total Amount
   - Order Status: "Success" or "Completed"
   - Product name and quantity
```

**Step 2: Click on Order for Details**
1. Click the order in the list
2. View full details

**Expected:**
```
✅ Shows full order information:
   - Order ID
   - Payment ID (from Razorpay)
   - Items with quantities
   - Total amount
   - Shipping address
   - Customer email
   - Order date and time
   - Payment status: "Paid"
```

**If order doesn't appear:**
```
Troubleshoot:
1. F12 → Network tab → Look for /api/orders call
2. Check response status (should be 200)
3. Browser console for errors
4. Verify backend is accessible:
   https://nekxuz-backend-j1sj.vercel.app/api/orders?email=YOUR_EMAIL
```

---

## ⚙️ TEST 5: Admin Portal - Stock Management

### Objective: Verify admin can update stock and frontend reflects changes

**Step 1: Access Admin Portal**
1. Look for admin login/portal on website
   - Might be: `/admin`, `/dashboard`, or admin link in header
2. Login with admin credentials

**Expected:**
```
✅ Admin portal loads
✅ Can see product management section
✅ Can see stock fields for products
```

**Step 2: Update Stock**
1. Find the product you just ordered
2. Change stock value (e.g., from 5 to 8)
3. Save changes

**Expected:**
```
✅ Stock field is editable
✅ Can save changes without errors
✅ Confirmation message shows
```

**Step 3: Verify Frontend Updates**
1. Go to home page (not logged in as admin)
2. Refresh page or navigate to products
3. Find the product you just updated
4. Check the stock value

**Expected:**
```
✅ Stock shows the NEW value (8)
✅ This happens within 1-2 seconds
✅ If you ordered 1 unit earlier:
   - Old stock: 5
   - After purchase: 4
   - After admin update: 8 (override)
```

**If stock doesn't update:**
```
Check:
1. Is admin update actually saving to database?
2. Is frontend refreshing product data?
3. Browser cache - might be showing old data
   - F12 → Application → Clear site data
   - Refresh page
```

---

## 📊 TEST 6: Complete Flow - Full Journey

### One complete user journey to test everything

**Scenario: Customer buys product**

```
1. Browse site → ✅ Loads, shows products with stock
2. Add product to cart → ✅ Cart updates
3. Verify stock prevents overflow → ✅ Can't exceed available
4. Proceed to checkout → ✅ Form validates
5. Complete payment → ✅ Razorpay payment succeeds
6. Order appears in My Orders → ✅ Immediately visible
7. Admin updates stock → ✅ Frontend reflects change

RESULT: ✅ ALL SYSTEMS WORKING
```

---

## 🔧 DEBUGGING: If Something Fails

### Check Browser Console (F12)
```
Errors to look for:
- "Failed to fetch" → Backend unreachable
- "404 Not Found" → Wrong API URL
- "CORS error" → Backend CORS misconfigured
- "Cannot read property" → Frontend bug
```

### Check Network Tab (F12 → Network)
```
1. Make an action (add to cart, checkout, etc.)
2. Look for API calls to: https://nekxuz-backend-j1sj.vercel.app/api/*
3. Check response status:
   - 200 = Success ✅
   - 400-499 = Client error ❌
   - 500+ = Server error ❌
```

### Check Backend Directly
```
Open in new tab: https://nekxuz-backend-j1sj.vercel.app

Should return JSON:
{
  "status": "ok",
  "message": "Nekxuz Backend Running...",
  "razorpay_mode": "PRODUCTION"
}

If error → Backend is down
```

### Vercel Logs
```
1. Go to: https://vercel.com/dashboard
2. Click nekxuz-backend project
3. Go to "Logs" tab
4. Look for error messages
5. Check timestamps match your test time
```

---

## ✅ SUCCESS CHECKLIST

After all tests, confirm:

```
FEATURE CHECKLIST:
☐ Website loads without errors
☐ Products display with images
☐ Stock shows on each product
☐ Out-of-stock products can't be purchased
☐ Cart adds/removes items correctly
☐ Checkout form validates inputs
☐ Razorpay payment gateway appears (LIVE, not test)
☐ Payment succeeds with test card
☐ Order appears in "My Orders" tab
☐ Order shows all correct details
☐ Admin can update stock
☐ Updated stock appears on frontend
☐ No console errors during any action
☐ No network errors in Network tab

RAZORPAY VERIFICATION:
☐ No "TEST MODE" watermark
☐ Shows production payment options
☐ Payment succeeds immediately
☐ No test restrictions

DATABASE VERIFICATION:
☐ Orders save after payment
☐ Stock decreases after purchase
☐ Admin can modify stock
☐ Frontend reads latest data
```

---

## 🎯 NEXT STEPS

**If ALL TESTS PASS:** ✅
- Congrats! Your system is working perfectly
- You can accept real customer payments
- Stock management is live
- Admin portal is functional

**If SOME TESTS FAIL:** ⚠️
- Take a screenshot of the error
- Note the test number that failed
- Share the error details for debugging
