# 🔧 EXACT COMMANDS TO RUN ON HOSTINGER

## CONFIRMED ISSUE

The API endpoint on Hostinger returns **empty orders for ALL emails**, even though:
- ✅ The database has 4 orders
- ✅ Hostinger backend IS running (responds with status 200)
- ✅ Email parameter IS being received correctly
- ❌ Query returns 0 results for all emails

**This means:** Hostinger backend is using a **different/empty database** or **old code without Prisma**.

---

## 🚀 IMMEDIATE FIXES (Pick One)

### FIX #1: Quick Restart (Try First - 2 minutes)

```bash
# SSH into Hostinger server
ssh root@your_hostinger_ip

# Navigate to backend
cd /path/to/backend_hostinger

# Kill old process
pkill -f "node server.js"
sleep 1

# Restart
PORT=3002 node server.js &

# Wait and test
sleep 3
curl https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com

# If still empty, continue to Fix #2
```

---

### FIX #2: Update Dependencies & Database (5 minutes)

```bash
# SSH into Hostinger
ssh root@your_hostinger_ip

# Navigate
cd /path/to/backend_hostinger

# Update npm packages
npm install

# Run Prisma migrations
npx prisma db push --skip-generate

# Kill and restart
pkill -f "node server.js"
sleep 1

PORT=3002 node server.js &

# Test
sleep 3
curl https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com

# Should now show 4 orders!
```

---

### FIX #3: Verify Database Connection (Find The Real Issue)

```bash
# SSH into Hostinger
ssh root@your_hostinger_ip

# Navigate to backend
cd /path/to/backend_hostinger

# Check current .env
cat .env

# Look for DATABASE_URL line - it should be:
# DATABASE_URL="postgresql://neondb_owner:npg_ihaG8sPfUnX9@ep-dry-lab-aigsw75j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# If it's WRONG or MISSING, update it:
nano .env
# (Edit the file, then press Ctrl+X, Y, Enter to save)

# Then restart:
pkill -f "node server.js"
sleep 1
PORT=3002 node server.js &

# Test
sleep 3
curl https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com
```

---

### FIX #4: Complete Redeployment (Nuclear Option - 10 minutes)

```bash
# SSH into Hostinger
ssh root@your_hostinger_ip

# Stop current process
pkill -f "node server.js"

# Remove node_modules
cd /path/to/backend_hostinger
rm -rf node_modules package-lock.json

# Fresh install
npm install --production

# Ensure .env is correct
cat .env | grep DATABASE_URL
# Should show the Neon database URL

# Run migrations
npx prisma generate
npx prisma db push

# Start fresh
PORT=3002 node server.js &

# Verify logs
tail -20 server.log

# Test
sleep 3
curl https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com
```

---

## 🔍 DIAGNOSTIC COMMANDS

### Check if backend is running
```bash
ps aux | grep "node server.js"
```

### Check logs
```bash
# Real-time logs
tail -f /path/to/backend_hostinger/server.log

# Last 50 lines
tail -50 /path/to/backend_hostinger/server.log

# Search for errors
grep -i "error\|failed\|connection" /path/to/backend_hostinger/server.log
```

### Test database connection directly
```bash
# From Hostinger server, test database
psql "postgresql://neondb_owner:npg_ihaG8sPfUnX9@ep-dry-lab-aigsw75j-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" -c "SELECT COUNT(*) FROM \"Order\";"

# Should show: 4 (the number of orders)
```

### Test API locally (from Hostinger)
```bash
# Test from server itself
curl http://localhost:3002/api/orders?email=infodevayushenterprise@gmail.com

# Or via HTTPS
curl https://api.nekxuz.in/api/orders?email=infodevayushenterprise@gmail.com
```

---

## 📋 CHECKLIST WHILE TROUBLESHOOTING

- [ ] .env file exists and has DATABASE_URL
- [ ] DATABASE_URL points to Neon database
- [ ] node_modules folder exists (npm install was run)
- [ ] Node.js process is running (ps aux | grep node)
- [ ] Port 3002 is open/listening (netstat -tuln | grep 3002)
- [ ] Database is accessible from server
- [ ] API responds (curl localhost:3002/)
- [ ] Orders endpoint returns data (curl localhost:3002/api/orders?email=...)

---

## 🆘 IF NOTHING WORKS

Run this complete diagnostic:

```bash
#!/bin/bash
cd /path/to/backend_hostinger

echo "=== ENVIRONMENT ==="
echo "Node version:"
node --version
echo ""

echo "=== .ENV FILE ==="
cat .env | head -20
echo ""

echo "=== DEPENDENCIES ==="
ls -la | grep node_modules
echo ""

echo "=== RUNNING PROCESSES ==="
ps aux | grep node
echo ""

echo "=== NETWORK ==="
netstat -tuln | grep 3002
echo ""

echo "=== DATABASE TEST ==="
npm test 2>&1 | head -30
echo ""

echo "=== LAST 20 LOG LINES ==="
tail -20 server.log
```

Then share the output - it will show exactly what's wrong!

---

## ✅ SUCCESS INDICATORS

After running any fix, you should see:

**API Response (with 4 orders):**
```json
{
  "ok": true,
  "orders": [
    {
      "id": "pay_SN0urhii26JnJQ",
      "amount": 139,
      "status": "paid",
      ...
    },
    ...
  ]
}
```

**Website (when logged in):**
- Go to Account > My Orders
- See 4 orders with amounts: ₹164, ₹139, ₹139, ₹139

**Logs (in server.log):**
```
[/api/orders] Received email: "infodevayushenterprise@gmail.com"
[/api/orders] Database returned 4 orders
```

---

## 📞 GETTING HELP

If you get stuck:

1. Run **FIX #2** (Update Dependencies)
2. Check **Diagnostic Commands** to find the error
3. Share the output of the last command with relevant error messages

The issue is **100% related to database connectivity or outdated code on Hostinger**.
