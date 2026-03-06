# 🚀 BACKEND DEPLOYMENT - COMPLETE GUIDE

## Problem Summary

✅ Frontend deployed: `/public_html/` → Works at https://nekxuz.in
❌ Backend NOT deployed: `/public_html/backend/` → **MISSING!**

When GitHub deployed the backend via `nekxuz.nekxuz.in`, it didn't create the `/backend/` subdirectory structure on Hostinger.

---

## Solution: Upload Backend Files Manually

### What to Upload

Backend files are ready in:
```
/Users/ayushgupta/Documents/untitled\ folder/Nekxuz\ copy/backend-deploy/
```

**Contains**:
- `server.js` (main backend file)
- `package.json` (dependencies)
- `.env` (configuration with DATABASE_URL)
- `prisma/` (database schema)

---

## Step-by-Step Deployment

### Step 1: Log into Hostinger Control Panel
```
https://hpanel.hostinger.com/
Click: File Manager
```

### Step 2: Navigate to /public_html/

### Step 3: Create `backend` folder
- Right-click in File Manager
- Create New Folder
- Name: `backend`

### Step 4: Upload Backend Files

**Option A: Via Hostinger File Manager (Easiest)**
```
1. Click into /public_html/backend/ folder
2. Upload these files:
   • server.js
   • package.json
   • .env
   • prisma/ folder

3. Wait for upload to complete
```

**Option B: Via SFTP (Faster)**
```bash
sftp ayusyaenterprise@nekxuz.in
cd /public_html
mkdir backend
cd backend

# Upload files
put server.js
put package.json
put .env
put -r prisma

bye
```

**Option C: Via SCP**
```bash
scp -r backend-deploy/* ayusyaenterprise@nekxuz.in:/public_html/backend/
```

---

## Step 5: Install Dependencies & Start Backend

### Via Hostinger Terminal (if available)
```bash
cd /public_html/backend
npm install
npm start
```

### Via SSH
```bash
ssh ayusyaenterprise@nekxuz.in
cd /public_html/backend
npm install
npm start

# Or use PM2 for persistent running
npm install -g pm2
pm2 start server.js --name "backend"
pm2 save
```

---

## Step 6: Verify Backend is Running

### Check 1: Can you access the backend?
```bash
curl https://nekxuz.in/backend/
# Should return some response (not 404)
```

### Check 2: Can you get API data?
```bash
curl https://nekxuz.in/backend/api/products
# Should return JSON product list
```

### Check 3: Check backend logs
```bash
ssh ayusyaenterprise@nekxuz.in
tail -50 /public_html/backend/server.log
# Look for: "Server running on port 3002"
# Look for: "Connected to PostgreSQL"
```

---

## Important Files

### server.js
- **What it is**: Main Express server
- **Purpose**: Handles all API endpoints
- **Starts on**: Port 3002

### package.json
- **What it is**: Dependencies list
- **Contents**: Express, Prisma, Razorpay, etc.
- **Requires**: `npm install` before running

### .env
- **What it is**: Environment configuration
- **Contains**: 
  - RAZORPAY_KEY_ID
  - RAZORPAY_KEY_SECRET
  - SHIPROCKET credentials
  - DATABASE_URL (PostgreSQL connection)

### prisma/
- **What it is**: Database schema files
- **Contains**:
  - schema.prisma (table definitions)
  - migrations/ (database updates)

---

## Environment Variables Check

⚠️ **CRITICAL**: Check `.env` has PostgreSQL URL!

```bash
# Should have:
DATABASE_URL="postgresql://user:pass@render-server/dbname"

# NOT:
DATABASE_URL="file:./dev.db"
```

If still SQLite, update to PostgreSQL connection string from Render.

---

## Expected Results

**After deployment, these URLs should work**:

```
Frontend:     https://nekxuz.in/ → HTML page ✅
Backend Root: https://nekxuz.in/backend/ → Some response ✅
API Endpoint: https://nekxuz.in/backend/api/products → JSON data ✅
```

**And complete flow works**:
1. User visits https://nekxuz.in
2. Adds product to cart
3. Clicks "Buy Now" → Razorpay appears
4. Completes payment
5. Order saved to PostgreSQL ✅
6. Order appears in "My Orders" tab ✅

---

## Troubleshooting

### Problem: "Cannot GET /backend/"
- **Cause**: Backend not responding
- **Fix**: Check if Node.js is running: `ps aux | grep node`

### Problem: API returns 502 Bad Gateway
- **Cause**: Backend crashed or not listening
- **Fix**: 
  1. SSH to Hostinger
  2. `cd /public_html/backend`
  3. `npm install`
  4. `npm start` (check for errors)

### Problem: "Cannot connect to PostgreSQL"
- **Cause**: DATABASE_URL is wrong
- **Fix**: Update `.env` with correct PostgreSQL URL from Render

### Problem: "provider = sqlite" error
- **Cause**: Schema still trying to use SQLite
- **Fix**: Check `prisma/schema.prisma` has `provider = "postgresql"`

---

## Files Ready to Deploy

**Location**: `/Users/ayushgupta/Documents/untitled\ folder/Nekxuz\ copy/backend-deploy/`

**What's included**:
```
backend-deploy/
├── server.js (45 KB)
├── package.json (0.7 KB)
├── .env (0.3 KB)
└── prisma/
    ├── schema.prisma
    └── migrations/
        └── [migration files]
```

**Ready to upload to**: `/public_html/backend/` on Hostinger

---

## Quick Checklist

- [ ] Log into Hostinger Control Panel
- [ ] Go to File Manager
- [ ] Create `/public_html/backend/` folder
- [ ] Upload server.js
- [ ] Upload package.json
- [ ] Upload .env
- [ ] Upload prisma/ folder
- [ ] SSH into Hostinger
- [ ] Run: `cd /public_html/backend && npm install`
- [ ] Run: `npm start` or `pm2 start server.js`
- [ ] Test: `curl https://nekxuz.in/backend/api/products`
- [ ] Verify: Returns JSON (not error)

---

## After Backend is Running

### Test Complete Flow:
1. Visit https://nekxuz.in
2. Add product to cart
3. Click "Buy Now"
4. Complete payment (test card: 4111 1111 1111 1111)
5. Check order appears in "My Orders"

### Check Backend Logs:
```bash
ssh ayusyaenterprise@nekxuz.in
tail -100 /public_html/backend/server.log
# Should show:
# - Order creation requests
# - Payment verification
# - Order saved to database
# - Shiprocket notifications
```

---

## Support

**If backend doesn't start**:
1. Check Node.js is installed: `node --version`
2. Check npm is installed: `npm --version`
3. Try: `npm install` in backend folder
4. Check for errors: `npm start` (show me the error)

**If database error**:
1. Verify DATABASE_URL in .env
2. Check PostgreSQL is running on Render
3. Try: `npx prisma db push` to sync schema

---

## Next Steps

1. **Upload backend files** to `/public_html/backend/`
2. **Run `npm install`** to install dependencies
3. **Start backend** with `npm start` or `pm2`
4. **Test API** with curl commands
5. **Test payment flow** in browser
6. **Check logs** for errors

**Ready to deploy!** 🚀
