# 🔧 How to Check Backend Logs on Hostinger

## The Problem
You ran the command on your **local Mac**, but the logs are on **Hostinger server**.

## Solution: SSH into Hostinger

### Step 1: Open Terminal on Your Mac
```bash
# Terminal is already open
cd /Users/ayushgupta/Documents/untitled\ folder/Nekxuz\ copy
```

### Step 2: SSH into Hostinger
```bash
ssh username@nekxuz.in
```

Replace `username` with your Hostinger username (you can find this in Hostinger control panel)

**Example**:
```bash
ssh ayush@nekxuz.in
# Or if using domain directly
ssh ayush@your-hostinger-ip
```

### Step 3: Check Backend Logs
Once logged in (you'll see a prompt like `user@hostinger:~$`):

```bash
# Navigate to backend
cd /public_html/backend

# View last 50 lines of logs
tail -50 server.log

# Or follow logs in real-time (watch as orders come in)
tail -f server.log
# Press Ctrl+C to exit
```

---

## What to Look For in Logs

✅ **Good Logs** (system working):
```
Connected to PostgreSQL
Server running on port 3002
GET /api/products 200
POST /api/payment/create-order 200
Creating Razorpay order...
✅ Order saved to PostgreSQL
```

❌ **Bad Logs** (problems):
```
Cannot connect to PostgreSQL
ECONNREFUSED - database connection failed
provider = "sqlite"
PrismaClientInitializationError
```

---

## Alternative: Check Backend via Browser Console

If you can't SSH, try this in your browser:

1. Visit: https://nekxuz.in
2. Press: F12 (Developer Tools)
3. Go to: Network tab
4. Add a product to cart
5. Look for network requests to `/backend/api/`
6. Check if they show 200 (success) or error codes

---

## Hostinger Connection Details

**You'll need**:
- Hostinger username (check Control Panel)
- Your SSH password OR SSH key

**Find these in**:
1. Log into https://hpanel.hostinger.com/
2. Click: Account Settings
3. Look for: SSH/FTP credentials

---

## Common Hostinger SSH Commands

```bash
# Connect
ssh username@nekxuz.in

# After connected, useful commands:

# Check if Node.js is running
ps aux | grep node

# Restart backend
cd /public_html/backend
npm start

# Check environment variables
cat .env | grep DATABASE

# View all logs
tail -100 server.log

# Check database connection
npm run prisma migrate status

# Exit SSH
exit
```

---

## Quick Test

Try this exact sequence:

1. **On your Mac terminal**:
```bash
ssh username@nekxuz.in
# Replace username with your Hostinger username
```

2. **After you see the Hostinger prompt**:
```bash
cd /public_html/backend
tail -20 server.log
```

3. **You should see Node.js logs**

---

## If SSH Connection Fails

**Error: "Permission denied"**
- Wrong password or username
- Check Hostinger control panel for correct credentials

**Error: "Connection refused"**
- Hostinger SSH might be disabled
- Enable it in Hostinger control panel → SSH/FTP

**Error: "No such file or directory"**
- Backend folder might not exist
- Check: `ls -la /public_html/` (should show `backend/` folder)

---

## Next Steps

1. SSH into Hostinger
2. Navigate to `/public_html/backend`
3. Check `tail -50 server.log`
4. Report what you see!

---

**Need help with SSH?** Tell me:
- Your Hostinger username
- Any error messages you get
- Or I can guide you through Hostinger control panel to find SSH credentials
