# 🛒 Nekxuz E-Commerce Platform - Complete Setup Guide

> Production-ready e-commerce platform with Razorpay payments, Shiprocket shipments, and Firebase backend

## 📊 Project Status

| Component | Status | Location |
|-----------|--------|----------|
| **Frontend (React)** | ✅ Production | Hostinger |
| **Backend (Firebase)** | ✅ Free Tier | Cloud Functions |
| **Database (Firestore)** | ✅ Free Tier | Google Cloud |
| **Payments (Razorpay)** | ✅ Live Mode | Production |
| **Shipments (Shiprocket)** | ✅ Ready | API Integration |
| **Stock Management** | ✅ Working | Inventory System |

## 🎯 Key Features

✅ **Production Razorpay Integration** - Live payment processing  
✅ **Automated Shipment Creation** - Shiprocket integration  
✅ **Accurate Stock Management** - Prevents overselling  
✅ **Order History** - Users can view past orders  
✅ **Free Backend** - Firebase with no monthly fees  
✅ **Real-time Database** - Firestore for instant updates  

## 💰 Cost Breakdown (Monthly)

| Service | Cost | Notes |
|---------|------|-------|
| Frontend Hosting | $5-15 | Hostinger |
| Backend (Firebase) | **FREE** | 2M functions/month free |
| Database (Firestore) | **FREE** | 1GB storage free |
| Razorpay | 0% | Only when processing payments |
| Shiprocket | Pay-per-shipment | ~₹25-30 per shipment |
| **Total** | **$5-15/month** | (Backend completely free!) |

## 🚀 Quick Start

### Option 1: Firebase Backend (Recommended - FREE)

```bash
# 1. Set up Firebase
npm install -g firebase-tools
firebase login
cd firebase-backend
firebase init
firebase deploy

# 2. Update frontend with Firebase URL
# Edit src/App.js line 12:
# const API_BASE_URL = "https://us-central1-YOURPROJECT.cloudfunctions.net";

# 3. Rebuild React
npm run build

# 4. Deploy to Hostinger
# Upload new_build/ folder to your hosting
```

See detailed instructions: [`firebase-backend/SETUP_GUIDE.md`](firebase-backend/SETUP_GUIDE.md)

### Option 2: Render Backend (Paid - $7+/month)

```bash
# Using existing Render deployment
# Update src/App.js line 12:
# const API_BASE_URL = "https://nekxuz-backends.onrender.com";

# Rebuild and deploy React
npm run build
```

## 📁 Project Structure

```
nekxuz/
├── src/                          # React frontend
│   ├── App.js                   # Main app (update API_BASE_URL here)
│   ├── components/              # React components
│   └── ...
├── public/                       # Static files
├── firebase-backend/             # Firebase Cloud Functions (FREE!)
│   ├── functions/index.js       # API implementation
│   ├── firebase.json            # Firebase config
│   ├── firestore.rules          # Database security
│   ├── SETUP_GUIDE.md           # Detailed setup
│   └── package.json
├── FIREBASE_MIGRATION.md        # Migration guide from Render
├── TEST_RESULTS.md              # Test verification
└── ...
```

## 🔧 Environment Variables

### Frontend (src/App.js)
```javascript
const API_BASE_URL = "https://us-central1-nekxuz-firebase.cloudfunctions.net";
// or for Render:
const API_BASE_URL = "https://nekxuz-backends.onrender.com";
```

### Backend (firebase-backend/.env)
```
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=your-password
```

## 📱 API Endpoints

### Payment Creation
```bash
POST /api/payment/create-order
Body: { amount: 100, currency: "INR", invoiceNumber: "INV-001" }
Response: { orderId: "...", amount: 10000, key_id: "..." }
```

### Payment Verification
```bash
POST /api/payment/verify
Body: { 
  razorpay_order_id: "...",
  razorpay_payment_id: "...",
  razorpay_signature: "...",
  orderData: { buyerName, buyerEmail, ... }
}
Response: { ok: true, orderId: "..." }
```

### Get Orders
```bash
GET /api/orders?email=customer@example.com
Response: { ok: true, orders: [...], count: 5 }
```

## ✅ Testing Checklist

- [ ] Frontend loads without errors
- [ ] Add product to cart
- [ ] Checkout form displays
- [ ] Payment button works
- [ ] Complete payment with Razorpay
- [ ] Order appears in "My Orders" tab
- [ ] Stock count decreases
- [ ] Shiprocket shipment created (check Shiprocket dashboard)

## 🐛 Troubleshooting

### Firebase URL not working
- Check Cloud Functions URL in Firebase Console
- Verify CORS is enabled
- Check firestore.rules permissions

### Orders not saving
- Check Firestore in Firebase Console
- Verify payment signature verification passed
- Check Cloud Functions logs

### Shiprocket not creating shipments
- Verify Shiprocket credentials in .env
- Check API token generation
- Review shipment payload structure

### Stock not updating
- Verify stock data is in Firestore
- Check frontend is querying correct collection
- Verify stock prop passed to components

## 📚 Documentation Files

- [`firebase-backend/SETUP_GUIDE.md`](firebase-backend/SETUP_GUIDE.md) - Detailed Firebase setup
- [`FIREBASE_MIGRATION.md`](FIREBASE_MIGRATION.md) - Migration from Render to Firebase
- [`TEST_RESULTS.md`](TEST_RESULTS.md) - Test verification results

## 🎓 Learn More

- [Firebase Documentation](https://firebase.google.com/docs)
- [Razorpay Integration](https://razorpay.com/docs)
- [Shiprocket API](https://www.shiprocket.in/api-docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review Firebase/Render logs
3. Test endpoints with Postman/curl
4. Verify environment variables

## 📝 Version History

- **v2.0** - Firebase backend integration (FREE!)
- **v1.0** - Initial Render deployment
- **v0.1** - Original setup

---

**Total Setup Time:** ~45 minutes  
**Monthly Cost:** $5-15 (backend FREE!)  
**Maintenance:** Minimal (managed services)  

🎉 **You're ready to launch!**
