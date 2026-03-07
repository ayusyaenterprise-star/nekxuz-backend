# 🚀 STEP-BY-STEP DEPLOYMENT GUIDE

**For**: Nekxuz B2B E-Commerce Platform  
**Deploying To**: Render (Backend) + Hostinger (Frontend)  
**Last Updated**: 7 March 2026

---

## PHASE 1: RENDER BACKEND DEPLOYMENT

### Step 1.1: Prepare Your Repository

```bash
# Go to project directory
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"

# Check if .gitignore exists and has node_modules
cat .gitignore

# Add to .gitignore if not present
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo "build/" >> .gitignore
```

### Step 1.2: Create .env.example (for production setup)

```bash
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@host/database

# Razorpay (Get from: https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# Shiprocket (Get from: https://dashboard.shiprocket.in)
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=your-password
SHIPROCKET_PICKUP_LOCATION_ID=1
SHIPROCKET_DEBUG=false

# Server
PORT=3002
NODE_ENV=production
EOF
```

### Step 1.3: Create Render PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Choose:
   - Name: `nekxuz-db`
   - Database: `nekxuz`
   - User: `nekxuz_user`
   - Region: Choose closest to India
4. Click "Create Database"
5. Copy the connection string (you'll need this in Step 1.6)

### Step 1.4: Push Code to GitHub

```bash
# If not already in git
git init
git add .
git commit -m "Nekxuz v1.0 - Production Ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nekxuz-backend.git
git push -u origin main
```

### Step 1.5: Deploy Backend on Render

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Fill in:
   - **Name**: `nekxuz-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma migrate deploy`
   - **Start Command**: `node server.js`
   - **Branch**: main

### Step 1.6: Add Environment Variables in Render

In Render dashboard, go to "nekxuz-backend" service:

1. Click "Environment"
2. Add each variable:

```
DATABASE_URL = postgresql://nekxuz_user:password@... (from Step 1.3)
RAZORPAY_KEY_ID = rzp_live_xxxxx (from Razorpay dashboard)
RAZORPAY_KEY_SECRET = your-secret-key
SHIPROCKET_EMAIL = your-email@example.com
SHIPROCKET_PASSWORD = your-password
SHIPROCKET_PICKUP_LOCATION_ID = 1
NODE_ENV = production
PORT = 3002
```

3. Click "Deploy"

### Step 1.7: Verify Backend is Running

```bash
# After deployment completes (5-10 minutes)
curl https://nekxuz-backend.onrender.com/api/health

# Should return or show no error (means server is running)
```

**Get your Render API URL**: https://nekxuz-backend.onrender.com  
(You'll need this for frontend configuration)

---

## PHASE 2: PREPARE FRONTEND FOR DEPLOYMENT

### Step 2.1: Update API Base URL

```bash
# Edit src/App.js
# Find this line (around line 2)
const API_BASE_URL = 'http://localhost:3002';

# Replace with:
const API_BASE_URL = 'https://nekxuz-backend.onrender.com';
```

### Step 2.2: Build Frontend for Production

```bash
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"

# Clean previous build
rm -rf build/

# Build for production
npm run build

# Result: build/ folder created with optimized files
# Size should be ~3-5 MB
```

### Step 2.3: Prepare for Hostinger Upload

```bash
# Navigate to build folder
cd build/

# List files to verify
ls -la

# Should contain:
# - index.html
# - static/ (folder with JS, CSS)
# - favicon.ico
# - Other assets
```

---

## PHASE 3: HOSTINGER FRONTEND DEPLOYMENT

### Step 3.1: Login to Hostinger

1. Go to https://hpanel.hostinger.com
2. Login with your credentials
3. Select your domain

### Step 3.2: Upload Build Files

**Method 1: Using File Manager (Recommended)**

1. Click "File Manager"
2. Navigate to `public_html` folder
3. Delete existing index.html and old files
4. Upload all files from `build/` folder:
   ```
   - index.html
   - static/ (folder)
   - favicon.ico
   - manifest.json
   ```

**Method 2: Using FTP**

```bash
# Using lftp
lftp -u username:password ftp.yoursite.com
cd public_html
rm -rf *
put -r build/*
exit
```

### Step 3.3: Configure .htaccess for React Router

1. In File Manager, create new file `.htaccess` in `public_html`
2. Add this content:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Step 3.4: Configure CORS on Backend (if needed)

In Render environment variables, add if not present:

```
FRONTEND_URL=https://yourdomain.com
```

Then in server.js, update CORS:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3002'
  ],
  credentials: true
}));
```

---

## PHASE 4: VERIFICATION & TESTING

### Test 4.1: Check Backend APIs

```bash
# Test payment creation endpoint
curl -X POST https://nekxuz-backend.onrender.com/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}'

# Test stock endpoint
curl https://nekxuz-backend.onrender.com/api/stock
```

### Test 4.2: Check Frontend

1. Open https://yourdomain.com
2. Should see Nekxuz homepage
3. No console errors (F12 → Console tab)

### Test 4.3: Test Full Payment Flow

1. **Add Product to Cart**
   - Click on any product
   - Click "Add to Cart"

2. **Go to Checkout**
   - Click cart icon
   - Click "Proceed to Checkout"

3. **Fill Details**
   - Name: Test User
   - Phone: 9876543210
   - Address: Test Address
   - City: Delhi
   - State: Delhi
   - Pincode: 110001

4. **Pay**
   - Click "Pay Now"
   - Razorpay modal opens
   - Use test card: 4111 1111 1111 1111
   - Expiry: 12/25, CVV: 123

5. **Verify Success**
   - Success modal appears
   - Shows Order ID, Payment ID, Amount
   - "Invoice Copy" button works
   - Can see order in "My Orders"

### Test 4.4: Database Verification

```bash
# Connect to Render PostgreSQL
# (You'll get connection details from Render dashboard)

# Check tables created
\dt

# Should show:
# - users
# - orders
# - order_items
# - invoices
```

---

## PHASE 5: GO LIVE CHECKLIST

### Before Going Live

- [ ] All environment variables set in Render
- [ ] PostgreSQL database created and migrated
- [ ] .env file NOT in git repository
- [ ] Build files uploaded to Hostinger
- [ ] .htaccess configured for React routing
- [ ] SSL certificate active (Hostinger auto-enables)
- [ ] Test payment flow works end-to-end
- [ ] Invoice downloads working
- [ ] Order tracking working
- [ ] Backend API accessible from frontend

### After Going Live

- [ ] Monitor Render logs for errors
- [ ] Check payment transactions daily
- [ ] Verify orders appear in database
- [ ] Test invoice generation
- [ ] Monitor Shiprocket shipments
- [ ] Set up automated backups

---

## PHASE 6: TROUBLESHOOTING

### Issue: "Cannot POST /api/payment/create-order"

**Solution**:
```bash
# Check if backend is running
curl https://nekxuz-backend.onrender.com/

# Check Render logs
# Render Dashboard → nekxuz-backend → Logs
```

### Issue: Frontend shows blank page

**Solution**:
1. Check browser console (F12)
2. Look for CORS errors
3. Verify API_BASE_URL in App.js is correct
4. Clear browser cache: Ctrl+Shift+Del

### Issue: "Database error" in orders

**Solution**:
```bash
# Check DATABASE_URL in Render environment
# Make sure it includes the correct password
# Format: postgresql://user:password@host/database
```

### Issue: Payments work locally but not on production

**Solution**:
1. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Render
2. Make sure using live keys (rzp_live_), not test keys
3. Check Razorpay dashboard for API logs

### Issue: Shiprocket orders not creating

**Solution**:
1. Verify SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD
2. Check Shiprocket token is valid
3. Check Render logs: `Render Dashboard → Logs → "Shiprocket"`

---

## PHASE 7: OPTIMIZATION & MONITORING

### Set Up Error Monitoring

```bash
# Install Sentry (optional but recommended)
npm install --save @sentry/node

# Add to server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

### Monitor API Performance

1. Go to Render Dashboard
2. Select nekxuz-backend service
3. Go to "Metrics" tab
4. Monitor CPU, Memory, Network

### Database Backups

1. Render → nekxuz-db → Backups
2. Enable automated daily backups
3. Test restore process monthly

---

## IMPORTANT FILES TO KEEP SAFE

```
/backup/
├── .env (DO NOT SHARE!)
├── Nekxuz_COMPLETE_BACKUP_YYYYMMDD.tar.gz
├── database-backup.sql
└── Razorpay_API_Keys.txt
```

---

## USEFUL LINKS

- **Render Dashboard**: https://dashboard.render.com
- **Hostinger Panel**: https://hpanel.hostinger.com
- **Razorpay Dashboard**: https://dashboard.razorpay.com
- **Shiprocket Dashboard**: https://dashboard.shiprocket.in
- **GitHub**: https://github.com/YOUR_USERNAME/nekxuz-backend
- **Your Live Site**: https://yourdomain.com

---

## ESTIMATED TIMELINE

- **Backend Deployment (Render)**: 15-20 minutes
- **Database Setup**: 5 minutes
- **Frontend Build**: 5-10 minutes
- **Upload to Hostinger**: 10 minutes
- **Configuration**: 10 minutes
- **Testing**: 15-20 minutes
- **Total**: ~1 hour

---

## SUCCESS INDICATORS

✅ You'll know deployment is successful when:

1. Backend API responds: `https://nekxuz-backend.onrender.com/api/stock`
2. Frontend loads: `https://yourdomain.com`
3. No console errors when opening site
4. Can add product to cart
5. Can complete test payment
6. Order appears in database
7. Invoice downloads successfully
8. Order appears in "My Orders" page
9. Tracking information displays

---

**Date**: 7 March 2026  
**Nekxuz Version**: 1.0.0  
**Status**: READY FOR PRODUCTION DEPLOYMENT ✅

If you get stuck at any step, check the troubleshooting section!

