# Critical Issue: Database Persistence

## 🔴 **The Real Problem**

Even with the schema fixed, orders won't persist on Render because:

**SQLite stores data in a file (`dev.sqlite`)**
- Render's free tier has an **ephemeral filesystem**
- This means the file is **DELETED when the service restarts**
- Service restarts automatically every 15 minutes due to inactivity OR daily

```
Timeline:
9:00 AM - You place order ✅ (saved to dev.sqlite)
9:15 AM - Service restarts ❌ (dev.sqlite file DELETED)
9:15 AM - Orders are gone! ❌
```

## ✅ **Solution: Use Persistent Storage**

### Option 1: Render Disk (Recommended - Easiest)
- Adds persistent volume to Render service
- **Cost**: $10/month for 1GB (cheapest option)
- **Setup**: 5 minutes
- **Steps**:
  1. Go to Render Dashboard
  2. Select nekxuz-backend service
  3. Click "Environment" → "Disk"
  4. Add disk: `/data` mount, 1GB
  5. Update DATABASE_URL to `/data/dev.sqlite`

### Option 2: PostgreSQL (Better - Production Ready)
- Render offers free PostgreSQL instance
- **Cost**: FREE (with limitations)
- **Setup**: 10 minutes
- **Better for**: Production, scalability
- **Steps**:
  1. Create PostgreSQL database on Render
  2. Get connection string
  3. Update .env: `DATABASE_URL="postgresql://..."`
  4. Push code, migrations run automatically

### Option 3: Firebase Realtime Database
- Store orders in Firebase instead of SQLite
- **Cost**: FREE tier (usually sufficient)
- **Setup**: 10 minutes
- **Benefit**: Already using Firebase for auth

## 🚀 **Immediate Fix (Option 1: Render Disk)**

### Step-by-Step Guide

**1. Go to Render Dashboard**
   - URL: https://dashboard.render.com
   - Select your nekxuz-backend service

**2. Add Persistent Disk**
   - Click "Environment"
   - Scroll to "Disk"
   - Click "Add Disk"
   - Mount path: `/data`
   - Size: 1 GB (plenty for your needs)
   - Click "Add"

**3. Update DATABASE_URL in Render**
   - In Render dashboard, go to "Environment"
   - Find "DATABASE_URL"
   - Change from: `file:./dev.sqlite`
   - Change to: `file:/data/dev.sqlite`
   - Click "Save"

**4. Service will auto-redeploy**
   - Wait 2-3 minutes for redeploy
   - Check logs for: "✔ Generated Prisma Client"

**5. Test Orders Now Persist**
   - Place order → Successful ✅
   - Service restarts → Data still there ✅
   - Orders show in "My Orders" ✅

### Cost Analysis
```
SQLite on ephemeral disk: FREE but data lost daily ❌
Render Disk (1GB):        $10/month (data persists) ✅
PostgreSQL on Render:     FREE (with limitations)   ✅
```

## 📋 **Why This is Critical**

Current flow (BROKEN):
```
Payment received → Order saved to dev.sqlite
→ Service restarts → dev.sqlite DELETED
→ Order retrieval from /api/orders returns empty ❌
```

Fixed flow (WORKING):
```
Payment received → Order saved to /data/dev.sqlite (on persistent disk)
→ Service restarts → /data/dev.sqlite still there ✅
→ Order retrieval from /api/orders returns saved orders ✅
```

## 🎯 **What You Need to Do**

### Immediate (Next 5 minutes):
1. Go to Render Dashboard
2. Select nekxuz-backend service
3. Add Persistent Disk at `/data`
4. Update DATABASE_URL to `/data/dev.sqlite`
5. Wait for redeploy

### Then Test:
1. Place test payment
2. Check "My Orders" - should show order ✅
3. Restart service (manually trigger restart)
4. Check "My Orders" again - order still there ✅
5. Check Shiprocket - order received ✅

## 📊 **What Will Change**

### Before (Ephemeral):
```
Dev.sqlite location: /tmp/... (gets deleted)
Persistence:        ❌ No (data lost on restart)
Database size:      10-50 MB
```

### After (With Disk):
```
Dev.sqlite location: /data/dev.sqlite (persistent)
Persistence:        ✅ Yes (data survives restarts)
Database size:      Unlimited (up to 1GB)
```

## ✨ **Additional Benefits**

With persistent disk, you can:
- ✅ View order history even after service restarts
- ✅ Accumulate order data over time
- ✅ Generate reports
- ✅ Use SQLite admin tools to inspect data
- ✅ Backup database easily

## 🔄 **If Using PostgreSQL Instead**

Skip the disk setup and instead:

1. **Create PostgreSQL on Render**:
   - Dashboard → Databases → New PostgreSQL
   - Name: `nekxuz-db`
   - Region: Same as backend
   - PostgreSQL Version: 15 (or latest)
   - Size: Free tier
   - Create

2. **Get Connection String**:
   - Copy the "External Database URL"
   - Format: `postgresql://user:password@host:port/dbname`

3. **Update Render Environment**:
   - Dashboard → nekxuz-backend → Environment
   - Set `DATABASE_URL` = the PostgreSQL URL
   - Save

4. **Update Provider in Schema** (if needed):
   - In `prisma/schema.prisma`, change:
     ```prisma
     datasource db {
       provider = "postgresql"  // Changed from "sqlite"
       url      = env("DATABASE_URL")
     }
     ```
   - Push to GitHub
   - Render redeploys automatically

5. **Test**:
   - Place order
   - Check "My Orders" - should work
   - Restart service
   - Check again - data persists

---

## 🎓 **Technical Details**

### Why SQLite on Ephemeral Filesystem Fails

```
Render's ephemeral filesystem:
- Files stored in /tmp or service directory
- Gets wiped when service stops/restarts
- Happens daily (free tier) or on updates
- Perfect for cache, NOT for data

SQLite needs:
- Persistent file location
- Data to survive service restarts
- Backup capability
```

### Why Disk/PostgreSQL Works

```
Render Disk:
- Persistent block storage
- Mounted at specified path
- Data survives restarts ✅
- Mounted volume = /data

PostgreSQL:
- Separate managed database service
- Automatically persistent ✅
- Automatic backups ✅
- Better for production ✅
```

---

## 🚨 **Important Note**

**Your orders are currently being saved to Render's ephemeral filesystem!**

Even if we fix the code perfectly, they will disappear within 24 hours unless you set up persistent storage.

**URGENT ACTION REQUIRED**: Add Render Disk or PostgreSQL before production launch!

---

**Timeline**:
- Now: Orders placed but lost on restart ❌
- After disk setup: Orders persist ✅
- After going live: All order history preserved ✅

**Recommendation**: Use Render Disk for immediate fix ($10/month), upgrade to PostgreSQL later for better scalability.

