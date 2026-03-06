# URGENT: Render Cache Issue Fix

## Problem
Render is using OLD SQLite schema even though we pushed PostgreSQL version.

Error in logs:
```
provider = "sqlite"  ❌ (OLD)
```

But repository has:
```
provider = "postgresql"  ✅ (NEW)
```

This is a Docker build cache issue.

---

## Solution: Manual Redeploy on Render

### Step 1: Go to Render Dashboard
https://dashboard.render.com

### Step 2: Select nekxuz-backend Service
Click on the service name.

### Step 3: CLEAR DEPLOY CACHE & REDEPLOY

Look for:
- **"Deploys"** tab OR
- **"Environment"** tab with **"Manual Deploy"** button

**Option A: If you see "Manual Deploy" button**
1. Click **"Manual Deploy"**
2. Look for **"Clear Build Cache"** option
3. Check **"Clear build cache"** checkbox
4. Click **"Deploy"**

**Option B: If you see "Deploys" tab**
1. Click **"Deploys"** tab
2. Click the three dots (**...**) on latest deploy
3. Click **"Redeploy"**
4. OR click **"Clear build cache"** option if available

### Step 4: Wait for Redeploy (3-5 minutes)

Watch the logs. Should show:
```
Cloning from repository
Fetching code
Building image
✔ Generated Prisma Client
🗄️ Database: PostgreSQL (from Render)
Nekxuz Server running on port 10000
State: Live ✓
```

### Step 5: Test API

```bash
curl "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com"
```

Expected:
```json
{"ok":true,"orders":[]}
```

---

## Why This Works

1. **Manual deploy triggers full rebuild** (not using cache)
2. **Fresh Docker image** created from scratch
3. **Fresh schema.prisma** loaded (PostgreSQL version)
4. **Prisma Client regenerated** for PostgreSQL
5. **Migrations run** on PostgreSQL database
6. **Server connects** to PostgreSQL ✅

---

## Alternative: If Manual Deploy Doesn't Work

**Delete and Recreate Service:**
1. Go to Render dashboard
2. Click nekxuz-backend service
3. Click **"Settings"** (bottom left)
4. Scroll down, click **"Delete Service"**
5. Confirm deletion
6. Create new service from GitHub again

(This is nuclear option, do manual redeploy first)

---

## DO THIS NOW

1. **Click "Manual Deploy"** on Render
2. **Clear build cache** (if option available)
3. **Wait 3-5 minutes** for rebuild
4. **Test API** 
5. **Report back results**

We've pushed fresh code (commit 8eb3e90) with complete PostgreSQL schema. Just need Render to rebuild from scratch!

