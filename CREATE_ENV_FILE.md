# 🆕 Create .env File on Hostinger

## The Problem
`.env` file doesn't exist on Hostinger → need to create it

## The Solution (Easy Method)

### Step 1: Get Your Render PostgreSQL URL

1. Go to: https://render.com/dashboard
2. Find your PostgreSQL database
3. Click on it
4. Copy "External Database URL"
   - Looks like: `postgresql://default:PASSWORD@dpg-xxx.render.ondigitalocean.com:5432/database_name`

**SAVE THIS URL** - you'll need it in 2 minutes!

---

### Step 2: Create .env File on Hostinger

**Method A: Via File Manager (Easiest)**

1. Log into Hostinger: https://hpanel.hostinger.com/
2. File Manager
3. Navigate to: `/public_html/backend/`
4. Look for button: **"Create new file"** or **"+"** icon
5. Click it
6. Name the file: `.env` (with the dot!)
7. Click Create

---

### Step 3: Edit .env File

1. Right-click the `.env` file you just created
2. Select: "Edit" or "Edit in text editor"
3. Paste this content:

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

# PostgreSQL Database
DATABASE_URL="postgresql://default:PASSWORD@dpg-xxx.render.ondigitalocean.com:5432/database_name"
```

---

### Step 4: Replace DATABASE_URL

**Replace THIS PART with your actual Render URL:**

❌ Current:
```
DATABASE_URL="postgresql://default:PASSWORD@dpg-xxx.render.ondigitalocean.com:5432/database_name"
```

✅ With this (from Step 1):
```
DATABASE_URL="postgresql://default:YOUR_ACTUAL_PASSWORD@dpg-YOUR_ID.render.ondigitalocean.com:5432/YOUR_DB_NAME"
```

---

### Step 5: Save File

1. Save the file in the editor
2. Done! ✅

---

## Alternative: Create via SSH (If File Manager Doesn't Work)

If file manager isn't working, use SSH:

```bash
# Connect to Hostinger
ssh ayusyaenterprise@nekxuz.in

# Go to backend folder
cd /public_html/backend

# Create and edit .env
nano .env

# Paste the content (right-click to paste)
# Then press: Ctrl+X, then Y, then Enter to save
```

---

## Verify It's Created

After creating .env:

1. Enable "Show hidden files" in File Manager
2. You should see `.env` in `/public_html/backend/`
3. If visible → Success! ✅

---

## After Saving

1. **Restart backend** (or wait 1-2 minutes for auto-reload)
2. **Place a test order**
3. **Check if order appears in "My Orders"**
4. **Done!** 🎉

---

## Troubleshooting

**Q: Still can't create .env?**
A: Use SSH method above

**Q: Don't know Render URL?**
A: Go to https://render.com/dashboard → PostgreSQL → Copy "External Database URL"

**Q: File created but showing error?**
A: Restart Node.js from Hostinger control panel

---

## File Contents Template

If you need to copy-paste:

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

# PostgreSQL Database - UPDATE THIS!
DATABASE_URL="postgresql://default:PASSWORD@dpg-xxx.render.ondigitalocean.com:5432/database_name"
```

---

**Action**: Create `.env` on Hostinger now! Tell me when done! 🚀
