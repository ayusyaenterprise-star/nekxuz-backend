# 🚀 RENDER ENVIRONMENT SETUP - STEP BY STEP

## Goal
Set environment variables for live Razorpay payments on your Render backend.

---

## Step-by-Step Instructions

### STEP 1: Open Render Dashboard
```
1. Go to: https://dashboard.render.com
2. Login with your credentials
3. You should see your services list
```

Expected Screen:
```
┌─────────────────────────────────────────┐
│ Render Dashboard                        │
├─────────────────────────────────────────┤
│ Services                                │
│                                         │
│ 📦 nekxuz-backend    (Node.js, Running) │
│ 📦 postgres-neon     (PostgreSQL)       │
└─────────────────────────────────────────┘
```

---

### STEP 2: Click on nekxuz-backend Service
```
1. Find your backend service in the list
2. Click on: "nekxuz-backend"
3. You'll see the service details page
```

Expected Result:
```
┌──────────────────────────────────────────┐
│ nekxuz-backend                           │
│ Service Status: Running ✅                │
│                                          │
│ [Details] [Logs] [Settings] [Events]     │
└──────────────────────────────────────────┘
```

---

### STEP 3: Go to Settings Tab
```
1. Click on: [Settings] tab (left navigation)
2. Scroll down to: "Environment"
3. You should see existing variables
```

Expected Layout:
```
┌─────────────────────────────────────────┐
│ Settings                                │
├─────────────────────────────────────────┤
│ Display Name                            │
│ Service Status                          │
│ ...other settings...                    │
│                                         │
│ ENVIRONMENT                             │
│ ┌─────────────────────────────────────┐ │
│ │ Key              | Value             │ │
│ ├──────────────────┼──────────────────┤ │
│ │ NODE_ENV         | production        │ │
│ │ DATABASE_URL     | postgres://...    │ │
│ │ [Add New]                            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### STEP 4: Add Razorpay Key ID
```
1. Click: [Add New] button in Environment section
2. In "Key" field, enter:     RAZORPAY_KEY_ID
3. In "Value" field, enter:   rzp_live_SMqkVvPnni1H3X
4. Click: [Save] or [Add]
```

Visual:
```
┌─────────────────────────────────────────┐
│ Add Environment Variable                │
├─────────────────────────────────────────┤
│                                         │
│ Key:   [RAZORPAY_KEY_ID____________]    │
│                                         │
│ Value: [rzp_live_SMqkVvPnni1H3X_____]   │
│                                         │
│                    [Save] [Cancel]      │
└─────────────────────────────────────────┘
```

---

### STEP 5: Add Razorpay Secret Key
```
1. Click: [Add New] again
2. In "Key" field, enter:     RAZORPAY_KEY_SECRET
3. In "Value" field, enter:   Yv4Bd637j5fjHGJ7hrPe1vDV
4. Click: [Save] or [Add]
```

Visual:
```
┌─────────────────────────────────────────┐
│ Add Environment Variable                │
├─────────────────────────────────────────┤
│                                         │
│ Key:   [RAZORPAY_KEY_SECRET_________]   │
│                                         │
│ Value: [Yv4Bd637j5fjHGJ7hrPe1vDV____]   │
│                                         │
│                    [Save] [Cancel]      │
└─────────────────────────────────────────┘
```

---

### STEP 6: Verify Both Variables Are Added
After adding both, your Environment section should show:

```
ENVIRONMENT
┌──────────────────────────┬─────────────────────────────┐
│ Key                      │ Value                       │
├──────────────────────────┼─────────────────────────────┤
│ NODE_ENV                 │ production                  │
│ DATABASE_URL             │ postgres://...              │
│ RAZORPAY_KEY_ID          │ rzp_live_SMqkVvPnni1H3X     │
│ RAZORPAY_KEY_SECRET      │ Yv4Bd637j5fjHGJ7hrPe1vDV    │
└──────────────────────────┴─────────────────────────────┘
```

✅ Both variables should be visible!

---

### STEP 7: Scroll to Top and Deploy
```
1. Scroll to the top of the Settings page
2. Look for: [Redeploy Latest Commit] button
3. Click it to trigger redeployment
```

Expected:
```
┌─────────────────────────────────────────┐
│ nekxuz-backend                          │
│ Last deployed: 22 Mar 2026 10:30        │
│                                         │
│ [Redeploy Latest Commit] [View Logs]    │
└─────────────────────────────────────────┘
```

---

### STEP 8: Watch Deployment Progress
```
1. Click: [View Logs] button
2. You'll see real-time deployment logs
3. Wait for: "Service is live on https://..."
4. Should take 2-3 minutes
```

Logs will show:
```
Starting deploy...
Building...
npm install...
Starting service...
Service is live on https://nekxuz-backend.onrender.com ✅
```

---

### STEP 9: Verify Deployment Success
```
1. Open new terminal or browser tab
2. Run or visit: https://nekxuz-backend.onrender.com
```

Expected Response:
```json
{
  "ok": true,
  "message": "Nekxuz Backend Running on Hostinger",
  "version": "2.0",
  "razorpay_mode": "PRODUCTION",  ← THIS CONFIRMS LIVE MODE!
  "endpoints": {
    "payment": "/api/payment",
    "verify": "/api/verify",
    "orders": "/api/orders"
  },
  "timestamp": "2026-03-22T10:35:00.000Z"
}
```

✅ **If you see `"razorpay_mode": "PRODUCTION"` - Live payments are READY!**

---

## From Terminal (Optional Verification)

```bash
# Check backend is running with live config
curl https://nekxuz-backend.onrender.com

# Should return PRODUCTION mode
```

Expected output:
```
{"ok":true,"razorpay_mode":"PRODUCTION",...}
```

---

## 🎯 Summary

| Step | Action | Status |
|------|--------|--------|
| 1 | Open Render Dashboard | ⏳ |
| 2 | Click nekxuz-backend | ⏳ |
| 3 | Go to Settings | ⏳ |
| 4 | Add RAZORPAY_KEY_ID | ⏳ |
| 5 | Add RAZORPAY_KEY_SECRET | ⏳ |
| 6 | Verify both variables | ⏳ |
| 7 | Click Redeploy | ⏳ |
| 8 | Wait 2-3 minutes | ⏳ |
| 9 | Verify endpoint shows PRODUCTION | ⏳ |

---

## ⚠️ If Deployment Fails

### Error: "Variable not set"
→ Make sure both key and value are filled
→ No extra spaces
→ Copy exactly as shown

### Error: "Still test mode"
→ Deployment might not be complete
→ Wait 5 minutes and check again
→ Clear browser cache (Cmd+Shift+Delete)

### Error: "Service crashed"
→ Check logs for errors
→ Verify no syntax issues in server.js
→ Keys shouldn't cause crashes (fallback exists)

---

## ✅ Next After This

1. Build React frontend locally
2. Upload to Hostinger (clear & re-upload)
3. Visit nekxuz.in
4. Test payment with real card
5. Check Razorpay dashboard for transaction

---

**Time Required:** 10 minutes
**Complexity:** Easy ✅
**Risk Level:** Low (fallback keys exist)

Last Updated: March 22, 2026
