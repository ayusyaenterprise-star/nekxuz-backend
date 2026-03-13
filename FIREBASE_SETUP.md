# Firebase Free Tier Backend Setup

## Step 1: Create Firebase Project

```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init
# Select:
# - Functions
# - Firestore
# - Hosting

# Create a new Firebase project at: https://console.firebase.google.com
```

## Step 2: Update .firebaserc

Update `.firebaserc` with your Firebase project ID:

```json
{
  "projects": {
    "default": "your-firebase-project-id"
  }
}
```

Get your project ID from Firebase Console → Settings → Project ID

## Step 3: Create functions/index.js

Copy `firebase-backend.js` to `functions/index.js`:

```bash
mkdir -p functions
cp firebase-backend.js functions/index.js
```

## Step 4: Set Environment Variables

Create `functions/.env.local`:

```bash
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=your-shiprocket-password
```

## Step 5: Deploy to Firebase

```bash
# Deploy functions
firebase deploy --only functions

# Your API endpoint will be:
# https://us-central1-your-project-id.cloudfunctions.net/api

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy hosting (optional)
firebase deploy --only hosting
```

## Step 6: Update Frontend API URL

In `src/App.js`, update:

```javascript
const API_BASE_URL = "https://us-central1-your-project-id.cloudfunctions.net/api";
```

## Free Tier Limits (More than Enough!)

| Service | Limit | Your Usage |
|---------|-------|-----------|
| Cloud Functions | 2M invocations/month | ✅ Plenty |
| Firestore | 50k reads/day | ✅ Plenty |
| Firestore Storage | 1GB | ✅ Enough |
| Bandwidth | 1GB/month | ✅ Enough |
| Cloud Pub/Sub | 10GB/month | ✅ Enough |

## Cost: $0/month ✅

No credit card required for free tier!

## Key Advantages Over Render

1. **No Paid Tier Required** - Free tier is generous
2. **Better Auto-Scaling** - Automatically scales with traffic
3. **Built-in Authentication** - Firebase Auth included
4. **Realtime Database** - Firestore for real-time updates
5. **Scheduled Jobs** - Can process shipments automatically
6. **Better Monitoring** - Firebase Console is excellent

## Testing Locally

```bash
# Run locally with emulator
firebase emulators:start --only functions

# In another terminal, test:
curl http://localhost:5001/your-project-id/us-central1/api/
```

## Next Steps

1. Create Firebase project
2. Deploy functions
3. Update API URL in frontend
4. Test payment flow end-to-end
5. Done! 🚀
