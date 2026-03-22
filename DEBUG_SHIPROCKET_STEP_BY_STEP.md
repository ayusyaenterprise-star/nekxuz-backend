# 🔍 Debug Shiprocket - Step-by-Step

## Current Status
- ✅ Backend code enhanced with detailed logging
- ✅ Pushed to Render
- ✅ Auto-deploying now (2-5 minutes)
- ⏳ Ready to diagnose the issue

---

## 📋 Probable Causes (In Order)

### 1. ❌ MOST LIKELY: Environment Variables NOT Set on Render

**Symptom:** Everything looks correct but orders don't appear in Shiprocket

**Check:**
```
Go to: Render Dashboard
Select: nekxuz-backend
Click: Settings
Scroll to: Environment Variables
Look for: These 4 MUST be there:
  ✓ SHIPROCKET_EMAIL
  ✓ SHIPROCKET_PASSWORD
  ✓ SHIPROCKET_PICKUP_LOCATION_ID
  ✓ SHIPROCKET_DEBUG
```

**If Missing:** Add them NOW!

**If Present:** Go to next check

---

### 2. 📋 Pickup Location ID Issue

**What is it?** Shiprocket ID for your warehouse/pickup point

**Current value:** `1` (default)

**Check if valid:**
1. Login to: https://app.shiprocket.in/
2. Go to: Settings → Warehouse
3. Note the ID of your warehouse
4. If NOT `1`, update in Render settings

---

### 3. 🌐 Shiprocket Account Issue

**Possible problems:**
- Account suspended
- API access disabled
- Credentials changed

**Verify:**
1. Try logging in: https://app.shiprocket.in/
2. Use credentials: `ayush.25327@ee.du.ac.in`
3. If can't login, update password in Render

---

## 🧪 Diagnostic Steps

### Step 1: Wait for Render Redeploy (2-5 min)
- New logging is deploying
- Wait for "Deploy complete"

### Step 2: Make a Test Payment
```
1. Go to: https://nekxuz.in/
2. Add product to cart
3. Click: Proceed to Checkout
4. Fill address details
5. Click: Pay Now
6. Use test card: 4111111111111111
7. Complete payment
```

### Step 3: Check Render Logs
```
1. Go to: Render Dashboard
2. Select: nekxuz-backend
3. Click: Logs (bottom right)
4. Scroll UP to see the latest logs
5. Look for lines starting with:
   - "SHIPROCKET_EMAIL:" 
   - "SHIPROCKET_PASSWORD:"
   - "Creating Shiprocket shipment"
   - "Shiprocket token obtained"
   - "Shipment created in Shiprocket"
```

### Step 4: Share What You See

**Tell me:**
- [ ] Are env vars showing as "✅ SET" in logs?
- [ ] What is the SHIPROCKET_PICKUP_LOCATION_ID value shown?
- [ ] Do you see "Shiprocket token obtained"?
- [ ] Do you see "Creating Shiprocket shipment"?
- [ ] What error message appears (if any)?

---

## 🎯 Expected Logs (Success Scenario)

```
SHIPROCKET_EMAIL: ✅ SET
SHIPROCKET_PASSWORD: ✅ SET
SHIPROCKET_PICKUP_LOCATION_ID: ✅ SET: 1
SHIPROCKET_DEBUG: ✅ SET: true

...later during payment...

📦 Creating Shiprocket shipment for order: pay_XXXXX
🔐 Fetching new Shiprocket token...
✅ Shiprocket token obtained (expires in 23 hours)
📦 Creating Shiprocket shipment for order: pay_XXXXX
📍 Pickup Location ID: 1
📍 Items to ship: 1
📋 Shiprocket payload: {...}
🌐 Sending to Shiprocket API...
📊 Shiprocket Response Status: 200
✅ Shipment created in Shiprocket!
🎫 Shipment ID: 123456
📦 Order ID: SR-12345678
```

---

## ❌ Expected Error Logs (If Something Wrong)

### Error: ENV Variables NOT SET
```
SHIPROCKET_EMAIL: ❌ NOT SET
SHIPROCKET_PASSWORD: ❌ NOT SET
```
**Solution:** Add them to Render Settings now!

### Error: Auth Failed
```
❌ Shiprocket auth failed
❌ Response: {...error details...}
```
**Solution:** Check credentials are correct in Render

### Error: HTTP Error from Shiprocket
```
📊 Shiprocket Response Status: 400
❌ Shiprocket API Error
❌ Error details: {...}
```
**Solution:** Share the error details with me

### Error: Pickup Location Invalid
```
❌ Shiprocket error: Pickup location not found
```
**Solution:** Check your warehouse ID in Shiprocket dashboard

---

## 🚀 The Process

1. ✅ Add/Verify env vars on Render
2. ✅ Wait for redeploy
3. ✅ Make test payment
4. ✅ Check Render logs
5. ✅ Share error (if any)
6. ✅ I'll fix it

---

## 📱 Quick Checklist

- [ ] Go to Render Dashboard
- [ ] Check: All 4 Shiprocket env vars SET?
- [ ] Wait: For redeploy to complete
- [ ] Test: Make a test payment
- [ ] Check: Render Logs during payment
- [ ] Share: What logs say
- [ ] Done! ✅

---

## 💡 Pro Tips

1. **Open Logs BEFORE payment:** So you see the flow happen
2. **Make test payment IMMEDIATELY AFTER:** Logs will show the attempt
3. **Scroll UP in logs:** New messages appear at top
4. **Copy full error text:** Share exact message with me

---

## Next Action

**WAIT 5 MINUTES** for Render redeploy, then follow steps above!
