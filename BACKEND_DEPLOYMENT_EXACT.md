# 🚀 BACKEND DEPLOYMENT - EXACT STEPS

## What to Upload

**NOT the whole repo** - Just the backend files!

### Backend Files Location (on your Mac):
```
/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/
├── server.js ← UPLOAD THIS
├── package.json ← UPLOAD THIS
├── .env ← UPLOAD THIS
├── prisma/ ← UPLOAD THIS FOLDER
├── node_modules/ ← UPLOAD THIS FOLDER (or npm install on server)
└── [other backend files]
```

---

## WHERE to Upload

### Option 1: Create /backend/ Subfolder (RECOMMENDED)

**Structure**:
```
/public_html/
├── index.html (frontend)
├── static/ (frontend)
├── assets/ (frontend)
└── backend/ ← Create this folder
    ├── server.js
    ├── package.json
    ├── .env
    ├── prisma/
    ├── node_modules/
    └── [other files]
```

**Steps**:
1. Log into Hostinger File Manager
2. Go to: `/public_html/`
3. Create new folder: `backend`
4. Upload all backend files INTO this `backend/` folder
5. Result: `/public_html/backend/server.js` ✅

---

### Option 2: Upload to Root /public_html/ (NOT RECOMMENDED)

```
/public_html/
├── index.html (frontend file)
├── server.js (backend file) ← CONFLICT!
├── package.json
├── static/
└── assets/
```

**Problem**: Mixes frontend and backend files
- Hard to manage
- Confusion between frontend and backend package.json
- **Avoid this** ❌

---

## Step-by-Step Upload Guide

### Method 1: Hostinger File Manager (Easiest)

**Step 1: Create backend folder**
```
1. Log into: https://hpanel.hostinger.com/
2. File Manager
3. Go to: /public_html/
4. Right-click → Create Folder
5. Name: backend
6. Press Enter
```

**Step 2: Upload files into backend folder**
```
1. Open the backend folder (double-click)
2. You're now in: /public_html/backend/
3. Upload files:
   - Drag & drop server.js
   - Drag & drop package.json
   - Drag & drop .env
   - Drag & drop prisma/ folder
   - Create node_modules/ or let npm install create it
```

**Step 3: Verify**
```
/public_html/backend/ should contain:
✅ server.js
✅ package.json
✅ .env
✅ prisma/
```

---

### Method 2: SFTP/SCP from Mac

**Create backend folder and upload**:
```bash
# Connect to Hostinger
sftp username@nekxuz.in

# Navigate to public_html
cd /public_html

# Create backend folder
mkdir backend

# Go into backend folder
cd backend

# Upload all backend files
put server.js
put package.json
put .env
put -r prisma/
put -r node_modules/

# Verify
ls -la

# Exit
bye
```

**Or using SCP**:
```bash
# From your Mac terminal:
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"

# Upload backend files to /public_html/backend/
scp server.js username@nekxuz.in:/public_html/backend/
scp package.json username@nekxuz.in:/public_html/backend/
scp .env username@nekxuz.in:/public_html/backend/
scp -r prisma/ username@nekxuz.in:/public_html/backend/
scp -r node_modules/ username@nekxuz.in:/public_html/backend/
```

---

## What to Upload - EXACT FILE LIST

From your local directory:
```
/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/
```

**UPLOAD THESE**:
```
✅ server.js
✅ package.json
✅ .env
✅ prisma/ (entire folder)
✅ node_modules/ (entire folder with dependencies)
✅ routes/ (if exists)
✅ Any other backend files
```

**DO NOT UPLOAD**:
```
❌ node_modules/ (OPTIONAL - can run npm install on server)
❌ build/ (frontend build - goes to /public_html/ root)
❌ src/ (frontend source - not needed)
❌ .git/ (version control)
❌ package-lock.json (optional, but recommended)
```

---

## After Upload - Configure Environment

### Update .env on Hostinger

The .env on your Mac has **SQLite** (wrong):
```
DATABASE_URL="file:./dev.db"
```

**Change to PostgreSQL on Render**:
```
PORT=3002
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

**How to update**:
1. File Manager → /public_html/backend/
2. Right-click `.env` → Edit
3. Change DATABASE_URL to PostgreSQL connection string
4. Save

---

## After Upload - Install Dependencies

**Option A: Via npm (if Node.js installed)**
```bash
# SSH into Hostinger
ssh username@nekxuz.in

# Go to backend folder
cd /public_html/backend

# Install dependencies
npm install

# Start backend
npm start
```

**Option B: If node_modules already uploaded**
```bash
# Just start backend
npm start
```

---

## Verify Upload Success

**In Hostinger File Manager**:
```
/public_html/backend/
├── server.js ✅
├── package.json ✅
├── .env ✅
├── prisma/ ✅
├── node_modules/ ✅
└── [other files] ✅
```

**Test backend**:
```bash
# SSH into Hostinger
ssh username@nekxuz.in
cd /public_html/backend
npm start

# Should see: "Server running on port 3002"
```

---

## Update .htaccess (IMPORTANT!)

After backend is in `/public_html/backend/`, create `.htaccess`:

**Location**: `/public_html/.htaccess`

**Content**:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Proxy /backend/ to Node.js on port 3002
  RewriteCond %{REQUEST_URI} ^/backend/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^backend/(.*)$ http://localhost:3002/$1 [P,L]
  
  # React routing for frontend
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>

<IfModule mod_proxy.c>
  ProxyRequests Off
  <Proxy *>
    Order allow,deny
    Allow from all
  </Proxy>
</IfModule>
```

---

## Final Structure (After Upload)

```
/public_html/
├── index.html (Frontend - React)
├── static/ (Frontend styles & JS)
├── assets/ (Frontend images)
├── .htaccess (Proxy configuration)
├── test_checkout.html
└── backend/ (Backend - Node.js)
    ├── server.js
    ├── package.json
    ├── .env
    ├── prisma/
    ├── node_modules/
    └── routes/ (if exists)
```

---

## Test After Upload

```bash
# Test frontend
curl https://nekxuz.in/
# Should return: HTML (React app)

# Test backend API
curl https://nekxuz.in/backend/api/products
# Should return: JSON (product list)
```

---

## Summary

| Step | Action | Where |
|------|--------|-------|
| 1 | Create `backend/` folder | `/public_html/` |
| 2 | Upload backend files | `/public_html/backend/` |
| 3 | Update `.env` with PostgreSQL | `/public_html/backend/.env` |
| 4 | Create `.htaccess` with proxy | `/public_html/.htaccess` |
| 5 | Run `npm install` (if needed) | `/public_html/backend/` |
| 6 | Start backend | `npm start` from `/public_html/backend/` |
| 7 | Test API | `https://nekxuz.in/backend/api/products` |

---

## Next Action

1. **Create `/public_html/backend/` folder** in Hostinger
2. **Upload backend files** into that folder
3. **Update `.env`** with PostgreSQL connection
4. **Create `.htaccess`** with proxy rules
5. **Start backend** with `npm start`
6. **Test** API endpoints

Ready? Let me know! 🚀
