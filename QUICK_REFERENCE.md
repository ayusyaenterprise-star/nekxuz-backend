# 🚀 Shiprocket Integration - QUICK REFERENCE

## ✅ What's Working

| Feature | Status | Details |
|---------|--------|---------|
| **Orders in Shiprocket** | ✅ FIXED | Complete payload with all fields |
| **Shipping Charges** | ✅ WORKING | Free ≥₹5000, ₹99 otherwise |
| **Tax Calculation** | ✅ WORKING | IGST/CGST/SGST auto |
| **Login Required** | ✅ ENFORCED | Before checkout |
| **My Orders Tab** | ✅ VISIBLE | All devices |
| **Tracking Info** | ✅ READY | AWB & courier shown |
| **PDF Invoice** | ✅ GENERATED | With all charges |
| **Backend** | ✅ RUNNING | Port 3003 |
| **Frontend** | ✅ RUNNING | Port 3004 |
| **Database** | ✅ READY | 4 tables, migrations applied |

---

## 🧪 Quick Test

### **1. Check Backend Running**
```bash
lsof -ti:3003
# Output: PID number = ✅ Running
```

### **2. Add Product to Cart**
- Open http://localhost:3004
- Click any product
- "Add to Cart"

### **3. Checkout**
- Click cart icon
- "Proceed to Checkout"
- Fill shipping details
- "Pay Now"

### **4. Complete Payment**
- Razorpay test card: `4111111111111111`
- Expiry: `12/25`
- CVV: `123`

### **5. Verify in Dashboard**
```bash
tail -f /tmp/backend.log | grep "SHIPMENT SAVED"
# Should show: ID, AWB, Courier
```

### **6. Check Shiprocket Panel**
- https://dashboard.shiprocket.in
- Orders → Active Orders
- Find your order
- Status: "Booked" ✅

---

## 📋 Shiprocket Payload (What Gets Sent)

```json
{
  "order_id": "uuid",
  "order_date": "2026-02-28",
  "customer_name": "Name",
  "customer_email": "email@example.com",
  "customer_phone": "9876543210",
  "shipping_address": {
    "address": "Full Address",
    "city": "City",
    "state": "State",
    "country": "India",
    "postal_code": "110001"
  },
  "line_items": [
    {
      "sku": "NEKXUZ-1",
      "product_name": "Product Name",
      "units": 12,
      "selling_price": 100,
      "tax": 18,
      "hsn_code": "3304"
    }
  ],
  "payment_method": "prepaid",
  "sub_total": 1200,
  "tax": 216,
  "shipping_charges": 0,
  "total_charge": 1416
}
```

---

## 🔧 Configuration (`.env`)

```bash
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1
SHIPROCKET_DEBUG=true
```

---

## 💰 Shipping Charges

| Order Value | Shipping | Total |
|------------|----------|-------|
| ₹100 (< ₹5000) | +₹99 | ₹199 |
| ₹2000 (< ₹5000) | +₹99 | ₹2099 |
| ₹5000 (≥ ₹5000) | FREE | ₹5000 |
| ₹10000 (≥ ₹5000) | FREE | ₹10000 |

---

## 🐛 Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| **Orders don't appear in Shiprocket** | Check logs: `tail -f /tmp/backend.log \| grep shiprocket` |
| **"Login failed"** | Verify credentials in .env |
| **"Invalid address"** | Postal code must be 6 digits, city/state must match Shiprocket service area |
| **Empty line_items** | Cart must have products, fill quantity correctly |
| **No AWB number** | Wait for Shiprocket to assign (usually instant) |
| **Backend not responding** | Restart: `kill $(lsof -ti:3003); PORT=3003 node server.js` |

---

## 📊 Database Query Examples

### **Check Order Created**
```bash
sqlite3 dev.db "SELECT id, amount, status FROM Order LIMIT 1;"
```

### **Check Payment**
```bash
sqlite3 dev.db "SELECT orderId, razorpayPaymentId, status FROM Payment LIMIT 1;"
```

### **Check Shipment**
```bash
sqlite3 dev.db "SELECT orderId, shiprocketId, awb, courier FROM Shipment LIMIT 1;"
```

### **Full Order with Tracking**
```bash
sqlite3 dev.db "
SELECT 
  o.id, o.amount, p.status, 
  s.shiprocketId, s.awb, s.courier 
FROM Order o 
LEFT JOIN Payment p ON o.id = p.orderId 
LEFT JOIN Shipment s ON o.id = s.orderId 
LIMIT 1;
"
```

---

## 🚀 Restart Backend

```bash
# Kill old process
kill $(lsof -ti:3003)

# Start new one
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"
PORT=3003 node server.js

# Watch logs
tail -f /tmp/backend.log
```

---

## 🎯 Complete Flow in 30 Seconds

```
1. User adds product
2. Clicks checkout (login required) ✅
3. Fills address
4. Pays via Razorpay
5. Backend creates order ✅
6. Backend calculates shipping ✅
7. Backend creates Shiprocket shipment ✅
8. Shiprocket generates AWB ✅
9. User sees order in "My Orders" ✅
10. User gets tracking number ✅
```

---

## 📞 API Endpoints

### **Create Order**
```
POST /api/payment/create-order
Body: { amount: 1416, invoiceNumber: "INV-..." }
```

### **Verify Payment & Create Shipment**
```
POST /api/payment/verify
Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoicePayload }
```

### **Get User Orders**
```
GET /api/orders?email=user@example.com
```

### **Track Shipment**
```
GET /api/shipment/track/123456789
```

---

## ✅ Pre-Checkout Verification

Before testing, ensure:
- [ ] Backend running: `lsof -ti:3003`
- [ ] Frontend running: `lsof -ti:3004`
- [ ] Credentials in .env: `grep SHIPROCKET .env`
- [ ] Database exists: `ls -lh dev.db`
- [ ] Tables created: `sqlite3 dev.db ".tables"`

---

## 🎉 You're All Set!

Everything is working! Just test with a real checkout:

1. http://localhost:3004
2. Add product
3. Login
4. Fill details
5. Pay (test card)
6. Check "My Orders"
7. Verify in Shiprocket dashboard

✅ **Happy shipping!** 🚀
