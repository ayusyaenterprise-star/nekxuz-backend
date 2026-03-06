# 📁 How to Find Hidden .env File on Hostinger

## Problem
The `.env` file doesn't appear in Hostinger File Manager because it's **hidden** (files starting with `.` are hidden by default).

---

## Solution 1: Show Hidden Files in Hostinger File Manager (Easiest)

### Steps:

1. **Log into Hostinger Control Panel**
   - https://hpanel.hostinger.com/

2. **Go to File Manager**
   - Click: File Manager

3. **Navigate to backend folder**
   - Go to: `/public_html/backend/`

4. **Show Hidden Files**
   - Look for **Settings** icon (gear icon) in top-right
   - Click it
   - Enable: "Show hidden files" OR "Show dotfiles"
   - Now you should see `.env` file!

5. **Click .env to edit**
   - Right-click on `.env`
   - Select: "Edit"

6. **Update DATABASE_URL**
   - Find: `DATABASE_URL="file:./dev.db"`
   - Replace with: `DATABASE_URL="postgresql://..."`
   - Save

---

## Solution 2: Create New .env File (If not found)

If `.env` doesn't exist after showing hidden files:

### Steps:

1. **Create new file in File Manager**
   - In: `/public_html/backend/`
   - Click: "Create new file"
   - Name it: `.env` (with the dot at start)

2. **Add this content** (copy-paste exactly):

```
PORT=3002

# Razorpay
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV

# Shiprocket
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1
SHIPROCKET_DEBUG=true

# Database - CHANGE THIS!
DATABASE_URL="postgresql://default:PASSWORD@dpg-xxx.render.ondigitalocean.com:5432/database"
```

3. **Replace the DATABASE_URL with your actual Render connection string**

4. **Save file**

---

## Solution 3: Via SSH Terminal (Technical)

If you have SSH access:

```bash
ssh ayusyaenterprise@nekxuz.in
cd /public_html/backend
cat .env
# This will show the contents

# Or edit it:
nano .env
# Then press Ctrl+X, Y, Enter to save
```

---

## Where to Get Render PostgreSQL URL

1. Go to: https://render.com/dashboard
2. Click on your PostgreSQL database
3. In "Connections" section, copy "External Database URL"
4. Looks like: `postgresql://default:abc123xyz@dpg-xxx.render.ondigitalocean.com:5432/nekxuz_db`

---

## Updated .env Template

Use this template and fill in your Render URL:

```
PORT=3002

# Razorpay LIVE Keys
RAZORPAY_KEY_ID=rzp_live_SMqkVvPnni1H3X
RAZORPAY_KEY_SECRET=Yv4Bd637j5fjHGJ7hrPe1vDV

# Shiprocket Credentials
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1
SHIPROCKET_DEBUG=true

# PostgreSQL Database (from Render)
DATABASE_URL="postgresql://default:PASSWORD@dpg-xxx.render.ondigitalocean.com:5432/database_name"
```

---

## Quick Checklist

- [ ] Opened Hostinger File Manager
- [ ] Navigated to `/public_html/backend/`
- [ ] Enabled "Show hidden files"
- [ ] Found `.env` file
- [ ] Edited it
- [ ] Changed DATABASE_URL to PostgreSQL
- [ ] Saved file
- [ ] Restarted backend (or wait 1-2 min)
- [ ] Placed test order
- [ ] Order appeared in "My Orders" ✅

---

## If .env Still Not Visible

**Try this via SSH**:

```bash
ssh ayusyaenterprise@nekxuz.in
cd /public_html/backend
ls -la
# Should show: .env file

cat .env
# Shows current content
```

If you see `.env` via SSH but not in File Manager, it's definitely a "show hidden files" issue.

---

**Action**: Enable "Show hidden files" in Hostinger File Manager and find `.env`! 🔍
