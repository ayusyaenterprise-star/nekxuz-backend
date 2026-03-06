# 🚀 QUICK START GUIDE - NEKXUZ PRODUCTION

## START THE SERVER IN 30 SECONDS

### Step 1: Navigate to Project
```bash
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"
```

### Step 2: Start Backend Server
```bash
node server.js
```

**Expected Output:**
```
[dotenv@17.3.1] injecting env...
Razorpay Initialized with Key ID: rzp_test...
Nekxuz Server running on port 3002
Razorpay Key Loaded: rzp_test...
```

### Step 3: Access the Application
```
🌐 Frontend: http://localhost:3002
🔌 Backend API: http://localhost:3002/api
```

---

## ✅ VERIFY ALL SYSTEMS

### Test 1: Server is Running
```bash
curl http://localhost:3002
# Should return HTML page
```

### Test 2: Stock API Works
```bash
curl http://localhost:3002/api/stock
# Should return JSON with all products' stock
```

### Test 3: Product List Works
```bash
curl http://localhost:3002/api/products
# Should return all products including updated Neem Lime with new image
```

### Test 4: Update Stock
```bash
curl -X POST http://localhost:3002/api/stock/update \
  -H "Content-Type: application/json" \
  -d '{"productId":"f3","available":500,"reserved":50,"sold":100}'
# Should return: "Stock updated successfully"
```

---

## 🛍️ TEST CUSTOMER FLOW

### 1. Browse Products
Visit: `http://localhost:3002`
- See all products
- Check stock availability (real-time)
- View professional product images

### 2. Add to Cart & Checkout
- Select product quantity
- Add to cart
- Proceed to checkout
- Enter billing details

### 3. Make Payment
- Click "Pay with Razorpay"
- Use test card: `4111 1111 1111 1111`
- Password: `123` (any password)
- OTP: `123456` (any OTP)

### 4. Order Confirmation
- Invoice generated automatically
- Download receipt as PDF
- Order saved in database
- Shipment created in Shiprocket

### 5. Track Order
- Get shipment tracking link
- Real-time status updates
- AWB number provided

---

## 👨‍💼 TEST ADMIN OPERATIONS

### Update Stock (Admin Panel)
```bash
# Update f3 (Neem Lime) stock
curl -X POST http://localhost:3002/api/stock/update \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "f3",
    "available": 250,
    "reserved": 25,
    "sold": 100
  }'
```

### Check Current Stock
```bash
# See all stock
curl http://localhost:3002/api/stock

# See specific product stock
curl http://localhost:3002/api/stock/f3
```

### Get All Orders
```bash
curl http://localhost:3002/api/orders
```

### Download Invoice
```bash
curl -O http://localhost:3002/api/invoice/download/invoice_123
```

### Track Shipment
```bash
curl http://localhost:3002/api/shipment/track/shipment_id_123
```

---

## 🔄 MAIN FEATURES VERIFICATION

### ✅ Feature 1: Real-Time Stock Updates
1. Open `http://localhost:3002` in browser
2. Note stock quantity on product card
3. Run stock update command above
4. Refresh browser (Cmd+R)
5. Stock quantity updates ✅

### ✅ Feature 2: Invoice Generation
1. Complete payment on checkout
2. Invoice auto-generated with:
   - Ayusya Enterprise as seller
   - GST calculation
   - Professional PDF format
3. Download available via `/api/invoice/download/{id}` ✅

### ✅ Feature 3: Order Tracking
1. After payment, order creates shipment
2. Get tracking via `/api/shipment/track/{id}`
3. Real-time status updates from Shiprocket
4. Customer receives tracking link ✅

---

## 📊 DATABASE CHECK

### View Stock Data
```bash
cat "stock.json"
# Shows all product stock levels
```

### Check Prisma Database
```bash
# Connect to database
npx prisma studio

# Or run migrations
npx prisma migrate dev
```

---

## 🆘 TROUBLESHOOTING

### Server Won't Start
```bash
# Check if port 3002 is in use
lsof -i :3002

# Kill process if needed
kill -9 <PID>

# Then restart
node server.js
```

### Stock Not Updating
```bash
# Verify stock.json exists
ls -la stock.json

# Check file permissions
chmod 644 stock.json

# Restart server
node server.js
```

### Invoice Not Generating
```bash
# Check database connection
npx prisma db push

# Check Razorpay credentials in .env
cat .env | grep RAZORPAY
```

### Images Not Loading
```bash
# Verify image exists
ls public/assets/cataloges/neem-lime-50/1.jpeg

# Check path formatting (no spaces)
# Should be: /assets/cataloges/neem-lime-50/1.jpeg
# NOT: /assets/cataloges/neem lime-50/1.jpeg
```

---

## 📱 MOBILE TESTING

Test on mobile devices:
```
http://192.168.x.x:3002
(Replace x.x with your computer's local IP)
```

Check responsive design:
- ✅ Navigation works on mobile
- ✅ Product cards display correctly
- ✅ Checkout form is mobile-friendly
- ✅ Payment modal is readable
- ✅ Invoice view works on mobile

---

## 🔐 PRODUCTION SETTINGS

Before going live, update:

### 1. Environment Variables (.env)
```bash
# Use PRODUCTION Razorpay keys (not test keys)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Use PRODUCTION Shiprocket credentials
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
SHIPROCKET_CHANNEL_ID=xxxxx

# Set production mode
NODE_ENV=production
PORT=3002
```

### 2. Use PM2 for Deployment
```bash
npm install -g pm2

# Start with PM2
pm2 start server.js --name "nekxuz" --env production

# Make it restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 logs nekxuz
```

### 3. Enable HTTPS
```bash
# Get SSL certificate from Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com

# Configure nginx reverse proxy
# See detailed guide in LAUNCH_READY.md
```

---

## 📈 MONITOR PERFORMANCE

### Check Server Health
```bash
# CPU and Memory usage
top -p <PID>

# Or with Node.js
npm install -g node-inspector
node --inspect server.js
```

### View API Logs
```bash
# All API requests are logged to console
# Format: [timestamp] METHOD /endpoint
# Example: [2026-03-02T10:30:00.000Z] GET /api/stock
```

---

## 🎯 NEXT STEPS

1. ✅ Verify server starts without errors
2. ✅ Test all three features work
3. ✅ Verify images display correctly
4. ✅ Test payment flow with test card
5. ✅ Check invoice generates
6. ✅ Verify tracking works
7. ✅ Update .env with production credentials
8. ✅ Deploy to production server
9. ✅ Setup monitoring and alerts
10. ✅ Launch to customers! 🚀

---

## 📞 API REFERENCE

### Quick API List
```
GET  http://localhost:3002/                    → Frontend
GET  http://localhost:3002/api/stock           → Get all stock
GET  http://localhost:3002/api/stock/f3        → Get f3 stock
POST http://localhost:3002/api/stock/update    → Update stock
GET  http://localhost:3002/api/products        → Get products
GET  http://localhost:3002/api/orders          → Get orders
POST http://localhost:3002/api/payment/create-order     → Create Razorpay order
POST http://localhost:3002/api/payment/verify           → Verify payment
GET  http://localhost:3002/api/invoice/download/{id}   → Download invoice
GET  http://localhost:3002/api/shipment/track/{id}     → Track shipment
POST http://localhost:3002/api/shipment/cancel/{id}    → Cancel shipment
POST http://localhost:3002/api/calculate-shipping      → Calculate shipping
```

---

## 🎉 YOU'RE READY!

Everything is set up and ready to go live!

**Current Status:**
- ✅ Backend: Ready
- ✅ Frontend: Built
- ✅ Database: Connected
- ✅ APIs: Tested
- ✅ Integrations: Active
- ✅ Features: Complete

**🟢 GO LIVE WHEN READY!**

---

**Last Updated:** March 2, 2026
**Version:** 1.0
**Status:** ✅ PRODUCTION READY
