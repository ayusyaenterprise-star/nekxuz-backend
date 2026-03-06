# 🚀 RENDER BACKEND DEPLOYMENT FIX

## Problem Analysis

❌ **Error**: `Error: Cannot find module 'razorpay'`  
❌ **Root Cause**: Render is trying to run `src/server.js` instead of `/server.js`  
❌ **Why**: The start command or file path is misconfigured

---

## Solution: Fix Render Configuration

### Step 1: Fix render.yaml (Already Created)
I've created a `render.yaml` file that explicitly tells Render:
- ✅ Use `node server.js` (not `src/server.js`)
- ✅ Use Node 18.x runtime
- ✅ Set proper environment variables
- ✅ Production mode

### Step 2: Ensure Correct server.js in Root

Your root `server.js` should be the **complete backend** (1199 lines with Razorpay & Shiprocket).

**Check you have:**
```
/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/
├── server.js               ← Full backend code (1199 lines)
├── package.json            ← Has razorpay dependency
├── .env                    ← Has RAZORPAY_KEY_ID, etc.
└── prisma/                 ← Database schema
```

### Step 3: Verify .env Has All Credentials

Your root `.env` should have:
```
PORT=3002
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1
DATABASE_URL=postgresql://...
```

---

## How to Deploy to Render

### Method 1: Using GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"
   git add .
   git commit -m "Fix: Add render.yaml and backend deployment config"
   git push origin main
   ```

2. **In Render Dashboard**
   - Go to https://dashboard.render.com/
   - Select your web service: "nekxuz-backend"
   - Click "**Redeploy**"
   - Wait for deployment
   - Check logs for success

3. **What Render Does**
   - Pulls latest from GitHub
   - Runs `npm install` (installs razorpay)
   - Runs `node server.js`
   - Sets environment variables
   - Service goes live

### Method 2: If Still Having Issues

If Render still shows the error:

**Check Render Dashboard Settings:**
1. Go to Service Settings
2. Under "Build & Deploy" → "Build Command": Should be empty or `npm install`
3. Under "Start Command": Should be `node server.js`
4. Under "Root Directory": Should be empty (default is `/`)

**If it says `src/server.js`:**
- Change it to `server.js`
- Click "Save"
- Click "Redeploy"

---

## Complete Render Setup Guide

### What to Set in Render Dashboard

| Setting | Value |
|---------|-------|
| **Name** | nekxuz-backend |
| **Runtime** | Node |
| **Build Command** | npm install |
| **Start Command** | node server.js |
| **Node Version** | 18.x |
| **Root Directory** | (leave empty) |
| **Region** | Auto or closest to you |

### Environment Variables to Add

```
PORT=3002
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1
DATABASE_URL=postgresql://neondb_owner:npg_ihaG8sPfUnX9@ep-dry-lab-aigsw75j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## What Those Warnings Mean

The warnings you saw are **NOT errors**. They're deprecation notices from old dependencies:

```
warning react-scripts > css-minimizer-webpack-plugin > cssnano > cssnano-preset-default > postcss-svgo > svgo > stable@0.1.8
```

This means:
- ⚠️ Some libraries use outdated packages
- ✅ But the build still succeeds
- ✅ The app still runs fine
- ℹ️ Future versions will fix these

**Solution**: Ignore these warnings. They don't affect functionality.

---

## Verify Backend is Working

After deployment, test your backend:

```bash
# Check if backend is running
curl https://nekxuz-backend-oqcn.onrender.com/health

# Should return something like:
# {"status":"ok","timestamp":"2026-03-07T..."}
```

Or test Razorpay endpoint:
```bash
curl -X POST https://nekxuz-backend-oqcn.onrender.com/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 10000, "currency": "INR"}'
```

---

## If Deployment Still Fails

### Check Render Logs
1. Go to Render Dashboard → Your Service
2. Click "Logs" tab
3. Look for actual errors (not warnings)
4. Common issues:
   - ❌ `Cannot find module X` → Missing dependency
   - ❌ `Invalid DATABASE_URL` → Wrong connection string
   - ❌ `Cannot find server.js` → Wrong start command

### Quick Fixes

**If error says "Cannot find module 'razorpay'":**
```bash
# Your package.json is correct, just redeploy
# Render didn't run npm install properly
# Click "Redeploy" again
```

**If error says "Cannot find module 'dotenv'":**
```bash
# Add dotenv to package.json
npm install dotenv
git commit -am "Add dotenv"
git push
# Then redeploy
```

**If DATABASE_URL error:**
```bash
# Copy exact connection string from Neon
# Paste in Render → Environment Variables
# Must include all parameters: ?sslmode=require&channel_binding=require
```

---

## Your Current Setup ✅

| Item | Status |
|------|--------|
| `package.json` | ✅ Has razorpay ^2.9.6 |
| `server.js` | ✅ Complete backend (1199 lines) |
| `.env` | ✅ Has all API keys |
| `render.yaml` | ✅ Just created |
| GitHub repo | ✅ Connected to Render |

---

## Next Steps

1. **Commit & Push**
   ```bash
   git add render.yaml
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **Redeploy on Render**
   - Dashboard → nekxuz-backend
   - Click "Redeploy"
   - Watch logs for "Build successful"

3. **Verify**
   - Test: `curl https://nekxuz-backend-oqcn.onrender.com/health`
   - Or check backend in your site

4. **If Still Fails**
   - Check Render logs for specific error
   - Update Start Command to: `node server.js`
   - Check DATABASE_URL in Environment Variables

---

## Success Indicators

When deployment succeeds, you'll see:

```
==> Build successful 🎉
==> Deploying...
==> Starting service...
==> Service is live at https://nekxuz-backend-oqcn.onrender.com
```

Your backend will be ready for your frontend to call!

---

**Status**: ✅ Ready to deploy  
**Action**: Push to GitHub and redeploy on Render  
**Expected Result**: Backend live with Razorpay working  
**Date**: 7 March 2026
