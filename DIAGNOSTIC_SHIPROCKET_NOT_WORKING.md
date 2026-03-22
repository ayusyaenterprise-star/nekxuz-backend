# 🔍 Diagnostic: Why Orders Not Reaching Shiprocket

## Checklist

### 1. Backend Deployment
- [x] Code pushed to Render
- [x] Render redeployed
- [x] API health: ✅ https://nekxuz-backend.onrender.com/api/health

### 2. Environment Variables
- ❓ Verify these are set on Render:
  ```
  SHIPROCKET_EMAIL
  SHIPROCKET_PASSWORD
  SHIPROCKET_PICKUP_LOCATION_ID
  SHIPROCKET_DEBUG (should be 'true')
  ```

**TO CHECK:**
1. Go to Render Dashboard
2. Select: nekxuz-backend
3. Click: Settings
4. Scroll to: Environment Variables
5. Verify all 4 are there

### 3. Shiprocket Credentials
- [x] Email: ayush.25327@ee.du.ac.in ✅ (tested)
- [x] Password: lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov! ✅ (tested)
- [x] Token: ✅ Successfully obtained (397 chars)
- [x] Auth: ✅ Working

### 4. Potential Issues

#### Issue A: Env Vars Not Set on Render
**Symptom:** Payment goes through but Shiprocket creation fails silently
**Check:** Render Settings → Environment Variables (all 4 present?)

#### Issue B: Wrong Endpoint URL
**Check:** Code uses: `https://apiv2.shiprocket.in/v1/external/orders/create/adhoc`
**Status:** ✅ Correct (verified with Shiprocket docs)

#### Issue C: Payload Missing Required Fields
**Check:** Shiprocket might require fields we're not sending
**Test Needed:** See if we're sending all required fields

#### Issue D: Pickup Location ID Invalid
**Current:** 1 (default)
**Check:** Is this a valid pickup location for your account?

---

## Next Steps to Diagnose

### Option 1: Check Render Logs
1. Go to Render Dashboard
2. Select: nekxuz-backend
3. Click: Logs (bottom right)
4. Make a test payment
5. Look for "Shiprocket" errors in logs
6. Share the error message

### Option 2: Enable Debug Mode
Verify `SHIPROCKET_DEBUG=true` is set in Render
Then make a payment and check logs for full request payload

### Option 3: Test Shiprocket Endpoint Directly
```bash
# Get token first
TOKEN=$(curl -s -X POST https://apiv2.shiprocket.in/v1/external/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ayush.25327@ee.du.ac.in","password":"lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!"}' | jq -r '.token')

# Try to create order
curl -X POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{...payload...}'
```

---

## Most Likely Cause

The env variables are probably **NOT set on Render**!

### Verify This:
1. Render Dashboard → nekxuz-backend → Settings → Environment
2. Should see ALL 4 variables:
   - SHIPROCKET_EMAIL
   - SHIPROCKET_PASSWORD
   - SHIPROCKET_PICKUP_LOCATION_ID
   - SHIPROCKET_DEBUG

If NOT all 4 are there, add them now!

---

## Solution

### IF Env Vars Missing:
1. Add all 4 to Render
2. Wait for auto-redeploy (2-5 min)
3. Test payment again

### IF Env Vars Set:
1. Check Render Logs during payment
2. Look for "Shiprocket" error messages
3. Share error with me

---

## Quick Test

Make a test payment and immediately check:
1. Render Logs (nekxuz-backend → Logs tab)
2. Browser Console (F12)
3. Shiprocket Dashboard (app.shiprocket.in)

Then share what you see!
