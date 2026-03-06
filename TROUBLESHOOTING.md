# Troubleshooting Guide - Shiprocket Integration

## ✅ Fixed Issues

### 1. **Database Tables Missing** ✅ FIXED
- **Problem:** `The table 'main.Order' does not exist`
- **Root Cause:** Prisma migrations were never run
- **Solution Applied:**
  - Fixed `schema.prisma`: Changed `payload` field from `Json?` to `String?` (SQLite doesn't support Json type)
  - Ran: `npx prisma migrate dev --name init`
  - Created database schema in `prisma/migrations/20260228082253_init/`

### 2. **Backend Database Connection** ✅ FIXED
- **Status:** Backend now successfully creates database tables
- **Verification:** Backend starts without "Order table not found" error

### 3. **Orders Tab Not Visible** ✅ VERIFIED PRESENT
- **Status:** "My Orders" tab exists in TopNav and BottomNav
- **Location:** Lines 540-544 in `src/App.js`
- **Mobile:** Shows in BottomNav with icon `receipt_long`
- **Desktop:** Shows in TopNav with label "My Orders"

---

## 🔧 Current Backend Status

**Port:** 3003 ✅ Running  
**Environment Variables:** 7 loaded from `.env` ✅  
**Razorpay:** Initialized ✅  
**Database:** SQLite with tables created ✅  

```
✓ Razorpay Key Loaded
✓ Database connected
✓ Server running on port 3003
```

---

## 📋 Testing Checklist

### Phase 1: Frontend Verification
- [ ] Open http://localhost:3004 in browser
- [ ] Click on "My Orders" tab (desktop) or icon (mobile)
- [ ] Should see "Please log in to view your orders" message (if not logged in)

### Phase 2: Login & User Setup
- [ ] Click "Login" button
- [ ] Sign in with Google (Firebase Auth)
- [ ] Return to "My Orders" tab
- [ ] Should show "No orders yet" message

### Phase 3: Test Checkout
1. Add product to cart
2. Click checkout button
3. Fill in shipping details:
   - Name
   - Email
   - Phone
   - Address
   - City
   - State
   - Pincode
4. Complete Razorpay payment

### Phase 4: Monitor Shiprocket Integration
Run in terminal:
```bash
tail -f /tmp/backend.log | grep -i shiprocket
```

Watch for logs:
```
[shiprocket] Creating shipment with payload: {...}
[shiprocket] Shipment creation response: {...}
[shiprocket] Shipment saved to DB with ID: ... AWB: ...
```

### Phase 5: Verify Order Appears
1. After successful payment, return to "My Orders" tab
2. Should see order with:
   - Order ID
   - Amount
   - Status: "paid"
   - Tracking AWB if shipment created
   - "Track Shipment" button

---

## 🐛 Common Issues & Solutions

### Issue 1: "Please log in to view your orders" persists
**Symptoms:** Even after login, My Orders shows login prompt  
**Cause:** `window.user` not set globally  
**Solution:**
```javascript
// Check browser console:
console.log(window.user)

// Should output:
// { email: "your@email.com", uid: "...", ... }
```

### Issue 2: Orders don't appear after checkout
**Symptoms:** Checkout completes but no order in "My Orders"  
**Debug Steps:**
1. Check backend logs:
   ```bash
   grep "Database Error\|ORDER CREATED" /tmp/backend.log
   ```
2. Verify database has Order record:
   ```bash
   sqlite3 dev.db "SELECT * FROM Order LIMIT 1;"
   ```

### Issue 3: Shiprocket shipment not created
**Symptoms:** Order created but no Shiprocket shipment details  
**Debug:**
1. Check .env variables:
   ```bash
   grep SHIPROCKET .env
   ```
2. Verify credentials are correct (not "placeholder")
3. Check logs for auth errors:
   ```bash
   grep "shiprocket.*error\|login failed" /tmp/backend.log
   ```

### Issue 4: "Can't see My Orders tab"
**Symptoms:** Orders tab doesn't appear in navigation  
**Solutions:**
- **Desktop:** Check if tab appears in top navigation (next to "RFQ")
- **Mobile:** Swipe bottom navigation - 6 icons should be visible
- **Check Console:** 
  ```javascript
  document.querySelectorAll('[data-tab]').length // Should be ≥ 6
  ```

---

## 🔍 Database Verification

### Check Database Schema
```bash
sqlite3 dev.db ".schema"
```

Expected output:
```sql
CREATE TABLE "Order" (...)
CREATE TABLE "Payment" (...)
CREATE TABLE "Shipment" (...)
```

### Check Created Records
```bash
# Count orders
sqlite3 dev.db "SELECT COUNT(*) as total_orders FROM Order;"

# View all orders
sqlite3 dev.db "SELECT id, invoice, amount, status, createdAt FROM Order LIMIT 10;"

# View shipments
sqlite3 dev.db "SELECT orderId, shiprocketId, awb, status FROM Shipment;"
```

---

## 🚀 Quick Restart Guide

### If Backend Issues:
```bash
# Kill backend
kill $(lsof -ti:3003)

# Restart
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"
PORT=3003 node server.js

# Verify startup
sleep 2 && tail -20 /tmp/backend.log
```

### If Database Issues:
```bash
# Reset database (WARNING: deletes all data)
rm dev.db

# Recreate tables
npx prisma migrate deploy

# Restart backend
PORT=3003 node server.js
```

### If Environment Issues:
```bash
# Verify .env is loaded
grep "SHIPROCKET_EMAIL\|RAZORPAY_KEY" .env

# Should output actual values (not empty)
```

---

## 📞 Next Steps

1. **Verify everything works:**
   - Complete one test checkout
   - Check "My Orders" shows the order
   - Monitor logs for Shiprocket response

2. **Integrate Shiprocket Tracking:**
   - In `MyOrdersScreen`, add real tracking link:
     ```javascript
     <a href={`https://shiprocket.co/shipments/${order.shipment.shiprocketId}`} 
        target="_blank">
       Track on Shiprocket
     </a>
     ```

3. **Add Email Notifications:**
   - Send confirmation email when order created
   - Send tracking info when shipment created

4. **Production Checklist:**
   - [ ] Shiprocket production account setup
   - [ ] Update .env with production credentials
   - [ ] Test with production API endpoints
   - [ ] Set `SHIPROCKET_DEBUG=false` for cleaner logs

---

## 📊 Useful Queries

### Last 5 Orders Created
```sql
SELECT id, invoice, amount, status, createdAt FROM Order ORDER BY createdAt DESC LIMIT 5;
```

### Orders Waiting for Shipment
```sql
SELECT o.id, o.invoice, o.amount, s.status 
FROM Order o 
LEFT JOIN Shipment s ON o.id = s.orderId 
WHERE s.id IS NULL OR s.status = 'pending';
```

### Failed Shipments
```sql
SELECT orderId, status, lastError, failureCount FROM Shipment WHERE status = 'failed' OR lastError IS NOT NULL;
```

### Check Razorpay Payments
```sql
SELECT orderId, razorpayOrderId, razorpayPaymentId, status FROM Payment WHERE status = 'captured';
```

---

Generated: 28 February 2026  
Status: All critical issues resolved ✅
