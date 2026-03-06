# 🎯 ACTION REQUIRED: Update App.js API Base URL

## Current Status
✅ Backend folder created: `backend_hostinger/`  
✅ Has Razorpay API  
✅ Has Shiprocket API  
✅ All credentials configured  

**NEXT STEP**: Connect frontend to backend

---

## What to Do

### Find in your `src/App.js`:
Line 9-10 currently shows:
```javascript
// --- Configuration ---
const apiKey = ""; // Gemini API Key
```

### Update to add API_BASE_URL:
```javascript
// --- Configuration ---
const API_BASE_URL = "https://nekxuz-backend-oqcn.onrender.com"; // Your backend URL
const apiKey = ""; // Gemini API Key
```

**Options for API_BASE_URL:**

**Option A (Recommended - Using Render):**
```javascript
const API_BASE_URL = "https://nekxuz-backend-oqcn.onrender.com";
```

**Option B (Using Hostinger Backend):**
```javascript
const API_BASE_URL = "https://nekxuz.in/api";  // Or your API subdomain
```

---

## Then Use It in Your Code

Whenever you make API calls, use `API_BASE_URL`:

**Before:**
```javascript
fetch("https://your-api-url/create-order", {...})
```

**After:**
```javascript
fetch(`${API_BASE_URL}/create-order`, {...})
```

---

## Your Razorpay & Shiprocket Keys

**These are already in your backend** (`backend_hostinger/.env`):

```
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV

SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1

DATABASE_URL=postgresql://neondb_owner:npg_ihaG8sPfUnX9@ep-dry-lab-aigsw75j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Frontend doesn't need these** - Backend handles all API interactions!

---

## Complete the Setup

1. ✅ Backend folder created with all APIs
2. ✅ Razorpay integrated
3. ✅ Shiprocket configured  
4. ⏳ **Update API_BASE_URL in App.js** ← DO THIS NOW
5. ⏳ Rebuild: `npm run build`
6. ⏳ Verify: `./verify_design.sh`
7. ⏳ Deploy: `scp -r build_hostinger/* ...`

---

**Ready to update App.js?** Add that one line and rebuild! 🚀
