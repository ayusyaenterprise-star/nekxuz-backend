# 📦 Files Ready for Upload

**Location**: `/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/deploy-ready/`
**Total Size**: 17 MB
**Ready**: ✅ YES

## Directory Structure

```
deploy-ready/
├── index.html                        (641 bytes - Main entry point)
├── asset-manifest.json              (1.4 KB - Build metadata)
├── test_checkout.html               (4.3 KB - Test page)
├── static/
│   ├── js/
│   │   ├── main.c868958c.js        (199.53 kB - React app with API URL)
│   │   ├── 453.390ab5fb.chunk.js    (1.76 kB - Code split chunk)
│   │   └── [other runtime files]
│   ├── css/
│   │   ├── main.d44b9e5a.css        (8.82 kB - Tailwind styles)
│   │   └── [other style files]
│   └── media/
│       └── [fonts and images]
└── assets/
    └── [product images from src/assets/]
```

## What's Inside

| File | Size | Purpose |
|------|------|---------|
| index.html | 641 B | Main HTML (loads React app) |
| static/js/main.*.js | 199.53 kB | React app compiled with **Hostinger API URL** ✅ |
| static/css/main.*.css | 8.82 kB | Tailwind CSS styles |
| test_checkout.html | 4.3 KB | Checkout test page |
| asset-manifest.json | 1.4 KB | Build manifest |

## Upload Instructions

### Step 1: Connect to Hostinger

**Option A - File Manager (Easiest)**
```
1. Go to: https://hpanel.hostinger.com
2. Click: "File Manager"
3. Navigate to: /public_html/
```

**Option B - SFTP**
```bash
sftp your-username@your-hostinger-host
```

**Option C - SCP**
```bash
scp -r "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/deploy-ready/"* username@host:/public_html/
```

### Step 2: Delete Old Files (Important!)

Before uploading new files, delete or backup old ones:
```
rm -rf /public_html/static/*
rm /public_html/index.html
rm /public_html/asset-manifest.json
```

### Step 3: Upload All Files

**From your Mac:**
- Copy all files from `deploy-ready/` folder
- Upload to `/public_html/` on Hostinger

**Important**: Maintain the directory structure:
- `index.html` goes to root `/public_html/`
- `static/` folder goes to `/public_html/static/`
- `assets/` folder goes to `/public_html/assets/`

### Step 4: Verify Upload

SSH into Hostinger:
```bash
ssh username@host
cd /public_html
ls -la
```

You should see:
```
-rw-r--r--  index.html
drwxr-xr-x  static/
drwxr-xr-x  assets/
-rw-r--r--  asset-manifest.json
-rw-r--r--  test_checkout.html
```

## File Permissions (Important!)

After upload, set correct permissions:

```bash
# HTML files
chmod 644 /public_html/index.html
chmod 644 /public_html/test_checkout.html

# Directories
chmod 755 /public_html/static
chmod 755 /public_html/assets

# Files inside static
chmod 644 /public_html/static/js/*
chmod 644 /public_html/static/css/*
chmod 644 /public_html/static/media/*
```

## What's Changed from Previous Build

**Previous Build** (March 3)
```
API_BASE_URL = "https://nekxuz-backend.onrender.com"
```

**New Build** ✅ (March 4 - 14:18)
```
API_BASE_URL = "https://nekxuz.in/backend"
```

**Verification**: All files in `static/js/` contain the new URL ✅

## Testing After Upload

### Test 1: Frontend Loads
```
Visit: https://nekxuz.in
Expected: Full page with products
```

### Test 2: Static Files Load
```
Press F12 in browser
Go to Network tab
Check: All files from /static/ should load (200 OK)
```

### Test 3: API Calls
```
In Console, run:
fetch('https://nekxuz.in/backend/api/products')
  .then(r => r.json())
  .then(d => console.log(d))

Expected: Products list appears
```

### Test 4: Full Payment Flow
```
1. Add product to cart
2. Click "Buy Now"
3. Enter test card: 4111 1111 1111 1111
4. Any expiry date/CVV
5. Submit
6. Order should appear in "My Orders"
```

## Troubleshooting Upload Issues

### Issue: 404 on Static Files
**Symptom**: In console, errors like:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
/static/js/main.*.js
```

**Fix**:
1. Verify `/public_html/static/` folder exists
2. Check file permissions: `chmod 755 static`
3. Check files inside: `ls -la /public_html/static/js/`

### Issue: Blank Page
**Symptom**: https://nekxuz.in shows blank page

**Fix**:
1. Clear browser cache: Ctrl+Shift+Delete
2. Hard refresh: Ctrl+F5
3. Check: `ls /public_html/index.html` exists

### Issue: API Returns 502 Bad Gateway
**Symptom**: API calls fail with 502

**Fix**:
1. Backend may have crashed
2. SSH to Hostinger
3. Run: `pm2 status`
4. Check logs: `tail -50 /public_html/backend/server.log`

### Issue: Payment Shows Old Backend URL
**Symptom**: API calls go to old Render URL

**Fix**:
1. Hard refresh browser: Shift+Ctrl+Delete cache
2. Check: In browser console: `console.log(API_BASE_URL)`
3. Should show: `https://nekxuz.in/backend`
4. If not: Rebuild wasn't uploaded, redo upload

## Rollback Plan

If anything goes wrong after upload:

```bash
# On Hostinger:
cd /public_html

# Restore from backup
if [ -d "public_html.backup" ]; then
  rm -rf *
  cp -r ../public_html.backup/* .
fi
```

## Cache Busting

If updated files don't appear:

1. **Browser Cache**
   ```
   Hard refresh: Shift+Ctrl+R or Ctrl+Shift+Delete
   ```

2. **Hostinger Cache**
   ```
   SSH to host:
   rm -rf /home/[user]/.cache/*
   ```

3. **CDN Cache** (if enabled)
   ```
   Disable in Hostinger → Performance
   ```

## Final Verification Checklist

Before declaring deployment complete:

- [ ] `https://nekxuz.in` loads completely
- [ ] No red errors in browser console (F12)
- [ ] All images load
- [ ] "Add to Cart" works
- [ ] "Buy Now" shows Razorpay popup
- [ ] Payment succeeds
- [ ] Order appears in "My Orders" tab
- [ ] Shiprocket notification received (check Shiprocket dashboard)
- [ ] Backend logs show no errors
- [ ] PostgreSQL received order data

## Quick Commands

```bash
# Test frontend loads
curl -I https://nekxuz.in
# Should show: 200 OK

# Test backend responds
curl -I https://nekxuz.in/backend
# Should show: 200 OK or backend response

# Test API endpoint
curl https://nekxuz.in/backend/api/products
# Should show: JSON product list

# SSH and check backend running
ssh username@host
ps aux | grep node
# Should show: node server.js running

# Check database connection
cd /public_html/backend
grep DATABASE_URL .env
# Should show: PostgreSQL connection string
```

## Support

**Files Location**: `/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/deploy-ready/`

**Hostinger SSH**: `ssh username@your-hostinger-host`

**Backend Logs**: `/public_html/backend/server.log`

**Database**: PostgreSQL on Render

---

**Status**: ✅ Ready to upload  
**Next Step**: Upload files to Hostinger /public_html/  
**Estimated Time**: 5 minutes to launch  

🚀 Let's go!
