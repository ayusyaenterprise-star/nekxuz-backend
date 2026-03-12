# 🚀 Frontend Deployment Guide - How to Deploy the Fix

## Status Summary

✅ **Backend**: Fully operational at `https://nekxuz-backend.onrender.com`  
✅ **Frontend Code**: Fixed in `src/App.js` (line 4230)  
✅ **Connection Issue**: RESOLVED (changed `/api/stock` to full URL)  
⏳ **Next Step**: Deploy fixed code to Hostinger

---

## Step-by-Step Deployment

### Step 1: Verify Your Frontend Project Structure

```
nekxuz copy/
├── public/
│   └── index.html
├── src/
│   ├── App.js          ← FIXED (line 4230)
│   ├── index.js
│   ├── index.css
│   └── assets/
├── package.json
├── package-lock.json
└── ... (other files)
```

### Step 2: Build the Frontend

Run this command in your project directory:

```bash
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"
npm install
npm run build
```

This creates a `build/` folder with optimized production code.

**Expected Output**:
```
> react-scripts build

Creating an optimized production build...
Compiled successfully!

File sizes after gzip:
  50.2 kB  build/static/js/main.xxxxx.js
  ...

The build folder is ready to be deployed.
```

### Step 3: Upload to Hostinger

#### Option A: Using Hostinger File Manager (Easy)

1. Go to **Hostinger Control Panel** → **File Manager**
2. Navigate to `/public_html/` folder
3. Delete existing files (or backup first)
4. Upload all files from the `build/` folder:
   - Drag and drop all files into `/public_html/`
   - Or use "Upload" button

#### Option B: Using FTP (If you have FTP credentials)

1. Download an FTP client (e.g., FileZilla)
2. Connect with your Hostinger FTP credentials:
   - **Host**: Your Hostinger server address
   - **Username**: Your FTP username
   - **Password**: Your FTP password
3. Navigate to `/public_html/`
4. Upload all files from `build/` folder

#### Option C: Using Hostinger Git Integration (If available)

1. Push code to GitHub
2. Connect your GitHub repo to Hostinger
3. Deploy from control panel

### Step 4: Verify Deployment

1. Go to `https://nekxuz.in`
2. Open **Developer Tools** (F12 / Right-click → Inspect)
3. Click **Network** tab
4. **Reload** the page
5. Look for requests with `onrender.com` in the URL:
   - ✅ Should see: `https://nekxuz-backend.onrender.com/api/stock`
   - ✅ Should see: `https://nekxuz-backend.onrender.com/api/orders`

### Step 5: Test Functionality

- [ ] Products load on the homepage
- [ ] Can add items to cart
- [ ] Cart updates correctly
- [ ] Can proceed to checkout
- [ ] Payment page loads
- [ ] Razorpay modal appears
- [ ] No errors in console

---

## What Changed in the Code

### File: `src/App.js`
**Line 4230**

**Before (❌ Broken)**:
```javascript
const response = await fetch('/api/stock', {
  headers: { 'Content-Type': 'application/json' },
  credentials: 'omit'
});
```

**After (✅ Fixed)**:
```javascript
const response = await fetch(`${API_BASE_URL}/api/stock`, {
  headers: { 'Content-Type': 'application/json' },
  credentials: 'omit'
});
```

**Why**: The hardcoded `/api/stock` was looking for the endpoint on the frontend server (nekxuz.in), not the backend (onrender.com).

---

## Build Artifacts

After running `npm run build`, you'll have:

```
build/
├── index.html              ← Main HTML file
├── static/
│   ├── css/               ← Compiled CSS files
│   ├── js/                ← Compiled JavaScript files
│   └── media/             ← Images, fonts, etc
├── manifest.json
└── robots.txt
```

**All of these files** go into `/public_html/` on Hostinger.

---

## Troubleshooting Deployment

### Issue: "Cannot GET /" on Hostinger

**Solution**: Make sure `index.html` is in the `/public_html/` folder, not in a subfolder.

### Issue: Products don't load after deployment

**Solution**: 
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check Network tab for failed requests to onrender.com

### Issue: "Failed to fetch" errors

**Solution**:
1. Check that `API_BASE_URL` in code is exactly: `https://nekxuz-backend.onrender.com`
2. No trailing slash: ❌ `https://nekxuz-backend.onrender.com/`
3. Backend must be running: ✅ `curl https://nekxuz-backend.onrender.com/`

### Issue: Products load but Razorpay doesn't appear

**Solution**:
1. Check Razorpay script is loaded (Network tab → search for "razorpay")
2. Check console for JavaScript errors (F12 → Console tab)
3. Verify Razorpay key is correct in backend

---

## Pre-Deployment Checklist

- [ ] Code fix applied to `src/App.js`
- [ ] Ran `npm install` successfully
- [ ] Ran `npm run build` successfully
- [ ] `build/` folder created
- [ ] `build/index.html` exists
- [ ] Have Hostinger access (File Manager or FTP)
- [ ] Backup existing files (optional but recommended)

---

## Post-Deployment Verification

- [ ] Frontend loads at `https://nekxuz.in`
- [ ] No console errors (F12 → Console)
- [ ] Products visible on homepage
- [ ] Network requests go to `onrender.com` (F12 → Network)
- [ ] Cart works
- [ ] Checkout page opens
- [ ] Razorpay payment modal appears
- [ ] Can proceed with test payment

---

## Test Card for Payment

Once deployed, test a payment with:
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: 12/25
- **CVV**: 123
- **Email**: test@example.com

---

## Backend Status (Already Running)

✅ Backend is live at: `https://nekxuz-backend.onrender.com`

Quick check:
```bash
curl https://nekxuz-backend.onrender.com/

# Output should show:
# {"status":"ok","corsMiddleware":"ENABLED",...}
```

---

## Summary

1. ✅ Issue identified: Hardcoded relative path in stock fetch
2. ✅ Issue fixed: Changed to use full backend URL
3. ✅ Backend verified: All endpoints responding
4. ⏳ Pending: Build and deploy to Hostinger
5. ⏳ Next: Test at https://nekxuz.in

**Estimated Time**: 5-10 minutes to build and deploy

---

## Need Help?

Run this command to test backend connectivity:
```bash
./test_frontend_backend_connection.sh
```

All tests should show ✅ if backend is ready.

---

**Let me know once you've deployed to Hostinger and I can help verify the connection is working! 🚀**
