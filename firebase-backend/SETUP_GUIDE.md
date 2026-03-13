# Firebase Backend Setup Guide

## Free Tier Benefits
- ✅ **Firestore Database**: 1GB storage + 50k reads/day free
- ✅ **Cloud Functions**: 2M invocations/month free
- ✅ **Cloud Hosting**: Free tier available
- ✅ **No credit card for 12 months** on new accounts

## Step 1: Create Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new Firebase project
firebase init

# Choose:
# - Firestore Database
# - Cloud Functions (Node.js)
# - Hosting
# - Project: nekxuz-firebase (or create new)
```

## Step 2: Deploy Functions

```bash
cd firebase-backend

# Install dependencies
npm install

# Deploy to Firebase
firebase deploy --only functions,firestore:rules

# Get your Function URL (will be something like):
# https://us-central1-nekxuz-firebase.cloudfunctions.net/api
```

## Step 3: Update Frontend API URL

In `src/App.js`:
```javascript
const API_BASE_URL = "https://us-central1-nekxuz-firebase.cloudfunctions.net";
```

## Step 4: Set Environment Variables in Firebase

```bash
# Set production Razorpay keys
firebase functions:config:set razorpay.key_id="rzp_live_SMqkVvPnni1H3X"
firebase functions:config:set razorpay.key_secret="Yv4Bd637j5fjHGJ7hrPe1vDV"

# Set Shiprocket credentials
firebase functions:config:set shiprocket.email="ayush.25327@ee.du.ac.in"
firebase functions:config:set shiprocket.password="lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!"

# Deploy again with config
firebase deploy
```

## API Endpoints (Firebase)

All endpoints work the same:
```
POST   /api/payment/create-order    → Create Razorpay order
POST   /api/payment/verify          → Verify payment & save order
GET    /api/orders?email=...        → Fetch user orders
```

## Cost Estimation

| Item | Limit | Cost |
|------|-------|------|
| Firestore Reads | 50k/day | Free |
| Firestore Writes | 20k/day | Free |
| Cloud Functions | 2M invokes | Free |
| Storage | 1GB | Free |

**Your estimated usage:**
- ~100-200 orders/month = well within free tier
- Cost: **$0/month** (unless you exceed free tier significantly)

## Monitoring & Debugging

```bash
# View logs
firebase functions:log

# Emulate locally
firebase emulate:functions

# Inspect Firestore data
firebase firestore:delete
```

## Migration from Render

1. Deploy Firebase backend (this guide)
2. Update `API_BASE_URL` in frontend
3. Rebuild and redeploy React to Hostinger
4. Test payment flow end-to-end
5. Keep Render credentials but don't use it

## Next Steps

After Firebase is set up:
1. ✅ All Razorpay payments work
2. ✅ Orders saved to Firestore
3. ✅ Shiprocket shipments created
4. ✅ No monthly charges (free tier)
5. ✅ Scales infinitely within free limits
