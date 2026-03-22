# ✅ Action Plan: Fix Shiprocket Orders Not Showing

## 🎯 Root Cause Analysis

Most likely reason orders aren't reaching Shiprocket:
**❌ Environment variables NOT set on Render Dashboard!**

Even though code is deployed, without these env vars, the backend can't authenticate with Shiprocket:
- `SHIPROCKET_EMAIL`
- `SHIPROCKET_PASSWORD`
- `SHIPROCKET_PICKUP_LOCATION_ID`
- `SHIPROCKET_DEBUG`

---

## ✅ Solution (3 Simple Steps)

### STEP 1: Check Environment Variables ⏱️ (2 min)

1. Open: https://dashboard.render.com/
2. Click: **nekxuz-backend** service
3. Click: **Settings** tab (top right)
4. Scroll down to: **Environment Variables** section
5. Check if these 4 variables exist:
   - [ ] `SHIPROCKET_EMAIL`
   - [ ] `SHIPROCKET_PASSWORD`
   - [ ] `SHIPROCKET_PICKUP_LOCATION_ID`
   - [ ] `SHIPROCKET_DEBUG`

**If ANY are missing → Skip to STEP 2 NOW!**

**If ALL 4 exist → Skip to STEP 3**

---

### STEP 2: Add Missing Environment Variables ⏱️ (3 min)

Go back to Render Settings → Environment Variables

**For each missing variable, click "Add Environment Variable":**

#### Add Variable 1:
```
Key: SHIPROCKET_EMAIL
Value: ayush.25327@ee.du.ac.in
→ Click "Add"
```

#### Add Variable 2:
```
Key: SHIPROCKET_PASSWORD
Value: lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
→ Click "Add"
```

#### Add Variable 3:
```
Key: SHIPROCKET_PICKUP_LOCATION_ID
Value: 1
→ Click "Add"
```

#### Add Variable 4:
```
Key: SHIPROCKET_DEBUG
Value: true
→ Click "Add"
```

✅ **Wait:** Render auto-redeploys automatically (2-5 minutes)

---

### STEP 3: Test Payment & Verify ⏱️ (10 min)

1. **Open:** https://nekxuz.in/
2. **Add** any product to cart
3. **Click:** "Proceed to Checkout"
4. **Fill:** Your address details
5. **Click:** "Pay Now"
6. **Enter test card:** `4111111111111111`
7. **Any expiry:** e.g., 12/25
8. **Any CVV:** e.g., 123
9. **Click:** Pay
10. **Wait:** 10 seconds
11. **Check:** https://app.shiprocket.in/
12. **Look for:** Your order should appear! ✅

---

## 🎯 If It Still Doesn't Work

Follow this diagnostic:

### Option A: Check Render Logs
1. Render Dashboard → **nekxuz-backend**
2. Click: **Logs** (bottom right)
3. Make another test payment
4. **Look for in logs:**
   - `SHIPROCKET_EMAIL: ✅ SET` (or ❌ NOT SET)
   - `SHIPROCKET_PASSWORD: ✅ SET` (or ❌ NOT SET)
   - `Creating Shiprocket shipment`
   - `Shipment created in Shiprocket`
5. **Share:** What you see in logs

### Option B: Verify Shiprocket Credentials
1. Go to: https://app.shiprocket.in/
2. Try to login with:
   - Email: `ayush.25327@ee.du.ac.in`
   - Password: `lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!`
3. **If can't login:** Credentials are wrong, update them in Render
4. **If can login:** Credentials are correct

### Option C: Check Pickup Location
1. Login to Shiprocket: https://app.shiprocket.in/
2. Go to: Settings → Warehouse/Pickup Location
3. **Note:** The ID shown there
4. **In Render:** Update `SHIPROCKET_PICKUP_LOCATION_ID` if different from 1

---

## ✨ Success Indicators

After payment, you should see:

**In Nekxuz Dashboard:**
- [ ] Order appears in "My Orders"
- [ ] Shows "PAID" status
- [ ] Shows Tracking ID / Waybill number

**In Shiprocket Dashboard:**
- [ ] Order appears in your orders list
- [ ] Waybill number assigned
- [ ] Courier selected (Delhivery/DTDC/Ecom)
- [ ] Status shows "Pending" or "Ready to ship"

---

## 📝 Troubleshooting Summary

| Issue | Check | Solution |
|-------|-------|----------|
| Order in Nekxuz but not Shiprocket | Env vars? | Add them to Render |
| Getting auth errors | Credentials? | Verify at shiprocket.in |
| Pickup location error | Warehouse ID? | Check Shiprocket settings |
| Shiprocket API error | Error message? | Share error, I'll fix |
| Still not working | Logs? | Check Render logs, share output |

---

## 🎊 Timeline

| Task | Time |
|------|------|
| Check env vars | 2 min |
| Add missing vars | 3 min |
| Wait for redeploy | 5 min |
| Test payment | 5 min |
| Verify | 2 min |
| **TOTAL** | **17 min** |

---

## 🚀 Action Right Now!

### TO DO:
1. [ ] Go to Render Dashboard
2. [ ] Check if 4 env vars are set
3. [ ] Add any missing ones
4. [ ] Wait 5 minutes for redeploy
5. [ ] Make test payment
6. [ ] Check Shiprocket dashboard
7. [ ] If not working, check logs & share with me

**That's it!** 🎉

---

**Questions?** Check `DEBUG_SHIPROCKET_STEP_BY_STEP.md`
