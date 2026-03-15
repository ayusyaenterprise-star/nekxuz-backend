# 🚀 NEKXUZ COMPLETE HOSTINGER DEPLOYMENT GUIDE

## Current Status
- ✅ Frontend: Live at https://nekxuz.in
- ✅ Razorpay: Production mode active
- ✅ Stock System: Working
- ❌ Backend: Currently needs to be deployed to Hostinger (FREE)
- ❌ Orders: Not saving (because backend URL is not set)

## Problem
You need a FREE backend because:
- ✗ Render is now paid ($7/month)
- ✗ Firebase Cloud Functions requires paid Blaze plan
- ✗ Vercel deployment isn't working properly

## Solution: Deploy Backend to Hostinger (100% FREE)

---

## STEP 1: Access Hostinger Control Panel

1. Go to https://hpanel.hostinger.com/
2. Sign in with your Hostinger account
3. Select your domain (nekxuz.in)

---

## STEP 2: Enable Node.js Hosting

### Option A: If you have Node.js already enabled
1. Go to **Manage** → **Node.js Applications**
2. Skip to STEP 3

### Option B: If Node.js is NOT enabled
1. Go to **Services** → **Advanced**
2. Look for "Node.js Applications" or "Node.js Hosting"
3. Click **Enable** or **Activate**
4. Wait 2-5 minutes for it to activate
5. Then go to **Manage** → **Node.js Applications**

---

## STEP 3: Prepare Backend Files

Create a folder structure on your computer:
```
nekxuz-api/
├── package.json
├── server.js
├── .env (optional)
└── node_modules/ (OR let Hostinger install)
```

### Files you need:

**package.json** - Copy from your repository root
**server.js** - Copy from your repository root

OR just download from GitHub:
```bash
git clone https://github.com/ayusyaenterprise-star/nekxuz-backend.git
cd nekxuz-backend
```

---

## STEP 4: Upload Backend Files to Hostinger

### Method A: Using cPanel File Manager (RECOMMENDED)

1. Go to **Manage** → **File Manager**
2. Navigate to `public_html/`
3. Create new folder: `api` OR `backend`
4. Upload these files to that folder:
   - `package.json`
   - `server.js`
5. **Don't upload node_modules** - Hostinger will install with npm

### Method B: Using FTP/SFTP

1. Use FileZilla or similar FTP client
2. Connect to your Hostinger FTP
3. Upload files to: `/public_html/api/` or `/public_html/backend/`

---

## STEP 5: Create Node.js Application in Hostinger

1. Go to **Manage** → **Node.js Applications**
2. Click **Create Application**
3. Fill in the form:

```
Node.js Version:        24.x (or latest)
Application Mode:       production
Application Root:       /public_html/api  (or /public_html/backend)
Application Startup File: server.js
Application URL:        api.nekxuz.in (or backend.nekxuz.in)
Application Port:       3000 (let Hostinger choose)
```

4. Click **Create** or **Deploy**
5. Wait 2-5 minutes for it to start

---

## STEP 6: Set Environment Variables (if needed)

In Hostinger Node.js settings, add these variables:

```
KEY                          VALUE
RAZORPAY_KEY_ID              rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET          Yv4Bd637j5fjHGJ7hrPe1vDV
FIREBASE_PROJECT_ID          nekxuz-27e49
NODE_ENV                      production
```

Note: These values are already in server.js as defaults, so this is optional.

---

## STEP 7: Test Backend is Running

Test from your terminal:

```bash
# Test root endpoint
curl https://api.nekxuz.in/

# Expected response:
# {
#   "ok": true,
#   "message": "Nekxuz Backend Running on Hostinger",
#   "platform": "Hostinger Node.js",
#   ...
# }

# Test payment endpoint
curl -X POST https://api.nekxuz.in/api/payment \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"invoiceNumber":"test123"}'

# Expected response:
# {
#   "ok": true,
#   "orderId": "order_xxx...",
#   "amount": 10000,
#   ...
# }
```

---

## STEP 8: Update Frontend to Use Hostinger Backend

Frontend automatically detects Hostinger backend first. To verify:

1. Check `/src/App.js` line 13-23:
   ```javascript
   const BACKEND_OPTIONS = [
     "https://api.nekxuz.in",  // ✅ PRIMARY: Hostinger
     "https://nekxuz-backends.onrender.com" // ❌ FALLBACK: Old Render
   ];
   ```

2. If using custom domain, update accordingly

3. Rebuild and upload new build:
   ```bash
   npm run build
   # Upload new /build files to Hostinger
   ```

---

## STEP 9: Test Full Payment Flow

1. Go to https://nekxuz.in
2. Add product to cart
3. Proceed to checkout
4. Enter test details:
   - Email: test@example.com
   - Name: Test User
   - Address: Test Address
5. Click "Place Order"
6. Complete Razorpay payment (production mode)
7. Check "My Orders" tab - order should appear ✅

---

## TROUBLESHOOTING

### Issue: Backend not responding (404 error)

**Solution:**
1. Check Node.js Application status in Hostinger
2. Verify Application Root path is correct
3. Check server.js is uploaded
4. Restart the application:
   - Go to Node.js Applications
   - Find your app
   - Click Restart or Redeploy

### Issue: Port already in use

**Solution:**
1. Hostinger auto-assigns port
2. Check the actual port in Node.js Application settings
3. Update API_BASE_URL if needed

### Issue: Module not found error

**Solution:**
1. Make sure package.json is uploaded
2. Go to Node.js Application settings
3. Click "Install Dependencies" or "npm install"
4. Restart application

### Issue: Firebase Firestore not working

**Solution:**
1. Make sure Firebase credentials are valid
2. Verify projectId in server.js
3. Check Firebase Firestore is enabled in console
4. Ensure Firestore security rules allow writes

---

## ALTERNATIVE: If Hostinger Node.js Doesn't Work

If Hostinger's Node.js hosting isn't available or working, use **Replit (completely FREE)**:

1. Go to https://replit.com
2. Create new Replit project
3. Upload server.js and package.json
4. Click "Run"
5. Copy the provided URL
6. Update API_BASE_URL in App.js

---

## FINAL CHECKLIST

- [ ] Backend files uploaded to Hostinger
- [ ] Node.js Application created and running
- [ ] Root endpoint responds with 200 OK
- [ ] Payment endpoint accepts POST requests
- [ ] Frontend updated with correct backend URL
- [ ] Test payment completed successfully
- [ ] Order appears in "My Orders" tab
- [ ] Stock updates after purchase
- [ ] No console errors

---

## 🎉 SUCCESS!

Your entire Nekxuz platform is now:
- ✅ Frontend: https://nekxuz.in (Hostinger, FREE)
- ✅ Backend: https://api.nekxuz.in (Hostinger, FREE)
- ✅ Database: Firebase Firestore (Google, FREE tier)
- ✅ Payments: Razorpay (production, pay per transaction)
- ✅ TOTAL COST: $0/month (except Razorpay fees)

---

## Next Steps

1. Monitor backend logs in Hostinger
2. Test all features thoroughly
3. Set up automated backups for Firestore
4. Monitor Razorpay transaction dashboard
5. Setup admin panel to manage stock

For questions, contact Hostinger support or check their Node.js documentation.
