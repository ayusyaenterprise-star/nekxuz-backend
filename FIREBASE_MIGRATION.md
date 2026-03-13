# Migration Plan: Render → Firebase

## Why Firebase?

| Feature | Render | Firebase |
|---------|--------|----------|
| **Cost (0-100 orders/month)** | $7/month+ | **FREE** |
| **Database** | PostgreSQL | Firestore |
| **Hosting** | $7/month | **FREE** |
| **Scalability** | Limited on free tier | Unlimited (within free tier) |
| **Cold Starts** | Yes (slow) | <1s with Cloud Functions |
| **Setup Time** | 30 mins | 15 mins |

## Migration Steps

### Step 1: Set Up Firebase Project (15 mins)
```bash
npm install -g firebase-tools
firebase login
firebase init
```

### Step 2: Deploy Backend to Firebase (5 mins)
```bash
cd firebase-backend
npm install
firebase deploy
```

### Step 3: Update Frontend (2 mins)
Change `src/App.js` line 12:
```javascript
// OLD (Render)
const API_BASE_URL = "https://nekxuz-backends.onrender.com";

// NEW (Firebase)
const API_BASE_URL = "https://us-central1-nekxuz-firebase.cloudfunctions.net";
```

### Step 4: Rebuild & Deploy React (5 mins)
```bash
npm run build
# Upload new_build/ to Hostinger
```

### Step 5: Test Complete Flow (10 mins)
1. Add item to cart
2. Checkout
3. Complete payment with test card
4. Verify order in "My Orders" tab
5. Check Firestore for saved order

## What Stays the Same

✅ Frontend (React) - same  
✅ Razorpay production keys - same  
✅ Shiprocket integration - same  
✅ Stock management - same  
✅ Payment flow - same  

## What Changes

❌ Backend: Render → Firebase  
❌ Database: PostgreSQL → Firestore  
❌ API URL: ends with `.onrender.com` → `.cloudfunctions.net`  

## Free Tier Limits (More than Enough)

```
Daily reads:     50,000 (you'll use ~50 per day)
Daily writes:    20,000 (you'll use ~5 per day)
Monthly storage: 1GB    (you'll use <10MB)
Functions calls: 2M/mo  (you'll use ~1,500/mo)

All FREE ✅
```

## Cost Comparison (6 months)

| Platform | Cost/Month | 6 Months |
|----------|-----------|----------|
| **Render** | $7 | **$42** |
| **Firebase** | **$0** | **$0** |
| **Savings** | | **$42** |

## Rollback Plan (If Needed)

If Firebase doesn't work:
1. Change API_BASE_URL back to Render
2. Rebuild React
3. Redeploy to Hostinger
Total time: 10 minutes

## Firebase Advantages

1. **Serverless** - No server management
2. **Auto-scaling** - Handles traffic spikes
3. **Real-time** - Firestore has real-time listeners if needed later
4. **Security** - Built-in security rules
5. **Integration** - Easy to add features (auth, storage, etc.)

## Estimated Timeline

| Phase | Time |
|-------|------|
| Firebase setup | 15 min |
| Deploy backend | 5 min |
| Update frontend | 2 min |
| Rebuild & test | 15 min |
| **Total** | **~40 mins** |

After that: **Forever FREE** 🎉
