# Migration Guide: Render → Firebase (FREE)

## Why Firebase Instead of Render?

| Feature | Render | Firebase |
|---------|--------|----------|
| **Free Tier** | ❌ Paid | ✅ Generous |
| **Monthly Cost** | $7-25+ | **$0** |
| **Setup Time** | Moderate | Simple |
| **Auto-scaling** | Limited | Excellent |
| **Database** | PostgreSQL | Firestore |
| **API Gateway** | ✅ | ✅ |
| **Scheduled Jobs** | ✅ | ✅ |

## Quick Migration Steps

### Step 1: Backup Current Data (from Render/PostgreSQL)

If you have orders in PostgreSQL, export them:

```bash
# Using psql
psql $DATABASE_URL -c "SELECT * FROM \"Order\";" > orders_backup.csv

# Or use pg_dump
pg_dump $DATABASE_URL > backup.sql
```

### Step 2: Create Firebase Project

Go to https://console.firebase.google.com

1. Click "Create Project"
2. Name it `nekxuz-backend-firebase`
3. Select region (US Central recommended)
4. Disable Google Analytics
5. Create project

### Step 3: Setup Firebase CLI

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize in your project directory
firebase init
```

Select these options:
- ✅ Functions (Cloud Functions)
- ✅ Firestore
- ✅ Hosting (optional)

### Step 4: Copy Backend Code

```bash
# Create functions directory
mkdir -p functions

# Copy the Firebase backend
cp firebase-backend.js functions/index.js

# Install dependencies in functions
cd functions
npm install firebase-admin express cors razorpay dotenv
cd ..
```

### Step 5: Configure Environment Variables

Create `functions/.env.local`:

```env
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=your-password
```

### Step 6: Deploy

```bash
# Deploy everything
firebase deploy

# Or deploy only functions
firebase deploy --only functions
```

### Step 7: Get Your API Endpoint

After deployment, Firebase Console shows:

```
Function URL: https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api
```

### Step 8: Update Frontend API URL

In `src/App.js`:

```javascript
// OLD (Render)
// const API_BASE_URL = "https://nekxuz-backends.onrender.com";

// NEW (Firebase)
const API_BASE_URL = "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api";
```

### Step 9: Test Everything

```bash
# Test health endpoint
curl https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/

# Test orders endpoint
curl "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/orders?email=test@example.com"

# Test payment creation
curl -X POST https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR", "invoiceNumber": "INV-123"}'
```

## Data Migration

### Option A: Fresh Start (Recommended)
Just delete Render, start fresh with Firebase. All future orders will be in Firestore.

### Option B: Migrate Old Data
```bash
# Export from PostgreSQL
pg_dump $DATABASE_URL --data-only > orders.sql

# Convert to JSON and import to Firestore
# Use Firebase console → Firestore → Import collection
```

## Cost Comparison

### Current Setup (Render)
```
Backend: $7/month (basic)
= $84/year
```

### Firebase Setup
```
Backend: $0/month (free tier)
= $0/year ✅
```

**Annual Savings: $84**

## What Gets Better?

1. **✅ Free tier with generous limits**
2. **✅ No deployment cache issues** (like Render had)
3. **✅ Built-in database** (Firestore)
4. **✅ Scheduled functions** (for shipment processing)
5. **✅ Better monitoring** (Firebase Console)
6. **✅ Scales automatically** with traffic

## What Stays the Same?

1. ✅ Razorpay production mode
2. ✅ Same API endpoints
3. ✅ Same stock management
4. ✅ Same payment flow
5. ✅ Same Shiprocket integration

## Potential Issues & Solutions

### Issue: "Function not deployed"
**Solution:** 
```bash
firebase deploy --only functions --debug
```

### Issue: "CORS errors"
**Solution:** Already configured in firebase-backend.js with:
```javascript
app.use(cors({ origin: true }));
```

### Issue: "Firestore quota exceeded"
**Solution:** Free tier allows 50k reads/day. You'd need millions of users to hit this.

### Issue: "Want to migrate back to PostgreSQL later?"
**Solution:** Easy! Just:
1. Export data from Firestore to JSON
2. Import to PostgreSQL
3. Deploy new backend code

## Fallback Plan

If Firebase doesn't work out:
- ✅ Vercel (similar to Firebase, also free)
- ✅ Netlify Functions (free tier)
- ✅ AWS Lambda (free tier 1M requests/month)

## Timeline

- Setup: **10 minutes**
- Deployment: **5 minutes**
- Testing: **5 minutes**
- **Total: 20 minutes to go live** ✅

## Questions?

- Firebase Docs: https://firebase.google.com/docs
- Cloud Functions: https://firebase.google.com/docs/functions
- Firestore: https://firebase.google.com/docs/firestore

---

**Ready to migrate? Follow the steps above and you'll be live on free Firebase in 20 minutes!** 🚀
