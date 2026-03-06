# Database Migration Troubleshooting Guide

## 🔴 Current Issue

Error message shows Render is still loading OLD SQLite schema instead of new PostgreSQL schema.

```
Error validating datasource `db`: the URL must start with the protocol `file:`
provider = "sqlite"
```

This means Render hasn't picked up the schema change yet.

---

## ✅ What We Just Did

1. **Force pushed a change** to GitHub to trigger new deploy
2. **Render will now redeploy** with latest code (including PostgreSQL schema)

---

## 📋 CRITICAL: Verify DATABASE_URL in Render

You mentioned "pasted exact external url" but we need to **confirm it's correct format**.

### The PostgreSQL URL should look EXACTLY like this:

```
postgresql://user:password@dpg-xxxxx.onrender.com:5432/nekxuz
```

**Key parts**:
- Starts with `postgresql://` (NOT `file://`)
- Contains `:password@host:port/dbname`
- Example: `postgresql://admin:abc123@db.onrender.com:5432/nekxuz`

### Verify in Render Dashboard:

1. Go: https://dashboard.render.com
2. Click on your **PostgreSQL database** (`nekxuz-db`)
3. Copy **"External Database URL"** (the full thing)
4. Go back to **`nekxuz-backend`** service
5. Click **"Environment"** tab
6. Find `DATABASE_URL`
7. **Compare** - should match exactly

---

## 🎯 Next Steps

### Step 1: Wait for Redeploy (2-3 minutes)

We just pushed a change to trigger redeploy.

Watch: https://dashboard.render.com → nekxuz-backend → Logs

Look for:
```
Building...
Fetching Prisma schema from repository
✔ Generated Prisma Client
Running migrations: 20260304045239_add_orders_payments_shipments
✔ Migrations applied successfully
🗄️ Database: PostgreSQL (from Render)
Nekxuz Server running on port 10000
State: Live ✓
```

### Step 2: Verify DATABASE_URL Format

If redeploy completes but still shows SQLite error:

1. Go to Render backend → Environment
2. Click on `DATABASE_URL` value
3. Check it starts with `postgresql://` (not `file://`)
4. If not correct, paste the correct PostgreSQL URL from database page
5. Click Save

### Step 3: Test Again

```bash
curl "https://nekxuz-backend.onrender.com/api/orders?email=test@example.com"
```

Should return:
```json
{"ok":true,"orders":[]}
```

---

## 🔍 Debugging: If Still Failing

### Check 1: Verify Render has latest code

In Render backend → Logs, look for:
```
Cloning repository: https://github.com/ayusyaenterprise-star/nekxuz-backend
Checking out commit: ec10675
```

**If you see old commit** → Render has cache issue, try:
- Render dashboard → nekxuz-backend → "Redeploy"
- Or delete service and recreate

### Check 2: Verify DATABASE_URL is PostgreSQL

In Render backend → Environment, check:
```
DATABASE_URL = postgresql://...
```

**NOT**:
```
DATABASE_URL = file://... ❌
```

### Check 3: Test Database Connection Directly

Once service is Live, check logs for:
```
✅ DATABASE CONNECTED - 0 total orders in database
```

If you see:
```
❌ DATABASE CONNECTION FAILED
```

Then PostgreSQL credentials are wrong.

---

## 📞 What to Report Back

Once you've waited 2-3 minutes for redeploy, tell me:

1. **Redeploy completed?** (YES/NO)
2. **Status shows "Live ✓"?** (YES/NO)
3. **Logs show "🗄️ Database: PostgreSQL"?** (YES/NO)
4. **API test returns `{"ok":true,"orders":[]}`?** (YES/NO)

---

## ✨ Expected Final Result

```
✅ Render backend deployed
✅ PostgreSQL database connected
✅ Migrations applied (Order, Payment, Shipment tables created)
✅ API returns orders (empty array initially)
✅ Ready to accept orders
```

---

**Timeline**:
- NOW: You read this
- 2-3 min: Redeploy completes
- 30 sec: You test API
- 5 min: We confirm everything works
- 10 min: Place first order
- 15 min: Order shows in "My Orders"
- 20 min: System LIVE! 🚀

