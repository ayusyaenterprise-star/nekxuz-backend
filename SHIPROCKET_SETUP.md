# 🚀 Add Shiprocket to Render - Final Step!

## ✅ Code Deployed
- Backend now has Shiprocket integration
- Will automatically create shipments when orders are paid
- Waiting for environment variables to be set

## 📋 Shiprocket Credentials to Add to Render

Go to: **Render Dashboard → nekxuz-backend → Settings → Environment**

Add these 4 variables:

```
SHIPROCKET_EMAIL=ayush.25327@ee.du.ac.in
SHIPROCKET_PASSWORD=lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!
SHIPROCKET_PICKUP_LOCATION_ID=1
SHIPROCKET_DEBUG=true
```

## 🔧 Step-by-Step Instructions

### 1. Open Render Dashboard
- Go to: https://dashboard.render.com/
- Select: **nekxuz-backend** service

### 2. Click Settings Tab
- Top right: Click **Settings**

### 3. Find Environment Section
- Scroll down to: **Environment Variables**

### 4. Add Each Variable
Click **Add Environment Variable** for each:

**Variable 1:**
- **Key:** `SHIPROCKET_EMAIL`
- **Value:** `ayush.25327@ee.du.ac.in`
- Click **Add**

**Variable 2:**
- **Key:** `SHIPROCKET_PASSWORD`
- **Value:** `lAzF8Q8Zse!d^huSS87IZSo&RIz14Ov!`
- Click **Add**

**Variable 3:**
- **Key:** `SHIPROCKET_PICKUP_LOCATION_ID`
- **Value:** `1`
- Click **Add**

**Variable 4:**
- **Key:** `SHIPROCKET_DEBUG`
- **Value:** `true`
- Click **Add**

### 5. Auto-Deployment
- Render will automatically redeploy
- Takes 2-5 minutes
- Check deployment status: Top right corner

---

## 📊 What Happens After Setup

```
User pays with Razorpay
           ↓
Backend receives payment
           ↓
Backend saves order to database ✅
           ↓
Backend creates shipment in Shiprocket ✅
           ↓
Shiprocket generates waybill number ✅
           ↓
Order shows up in Shiprocket dashboard ✅
           ↓
Shipping can be printed from Shiprocket ✅
```

---

## ✅ Testing After Setup

1. **Wait 2-5 minutes** for Render to redeploy
2. **Go to:** https://nekxuz.in/
3. **Make a test payment** (use card: `4111111111111111`)
4. **Check Shiprocket Dashboard:**
   - Go to: https://app.shiprocket.in/
   - Login with same credentials
   - Your order should appear immediately! ✅

---

## 🎯 What You'll See

### Before (Current - Only in Nekxuz DB)
```json
{
  "id": "pay_...",
  "buyerName": "Ayush Gupta",
  "status": "paid"
  // ❌ Not in Shiprocket
}
```

### After (With Shiprocket Integration)
```json
{
  "id": "pay_...",
  "buyerName": "Ayush Gupta",
  "status": "paid",
  "shipment": {
    "shipment_id": "123456",
    "order_id": "SR-...",
    "packages": [{
      "waybill": "9876543210",
      "courier": "Delhivery"
    }]
  }
  // ✅ Also in Shiprocket!
}
```

---

## 📱 Expected Response After Payment

Your "My Orders" page will show:
- ✅ Order status: PAID
- ✅ Tracking ID: Waybill number from Shiprocket
- ✅ Shipment ID: Shiprocket shipment ID
- ✅ "Track Shipment" button works

---

## ⚠️ If Something Goes Wrong

### Orders not appearing in Shiprocket?
1. Check: Environment variables set on Render? (Check Settings page)
2. Check: Render redeployed? (Check "Deployments" tab)
3. Check: Browser console for any errors (F12)
4. Try: Make another test payment

### Getting "Shiprocket auth failed"?
1. Verify: Email and password are correct
2. Try: Logging in to https://app.shiprocket.in/ manually
3. Check: Account is still active

### Orders in DB but not Shiprocket?
1. Check: Are Shiprocket credentials set on Render?
2. Check: SHIPROCKET_DEBUG=true in logs (Render → Logs)
3. Look for: "Shiprocket error" messages

---

## 🔐 Security Note
- These credentials are safe in Render environment variables
- They're masked from display (only visible when editing)
- Never share your Shiprocket password in code/commits

---

## ✨ Summary

1. ✅ Code deployed with Shiprocket integration
2. ⏳ Add 4 environment variables to Render
3. ⏳ Render auto-redeploys (2-5 min)
4. ✅ Test payment - order appears in Shiprocket
5. 🎉 Done! Shipments now automatic!

**Add the environment variables now and you're all set!** 🚀

---

## Quick Checklist
- [ ] Go to Render Dashboard
- [ ] Select nekxuz-backend
- [ ] Click Settings
- [ ] Add SHIPROCKET_EMAIL
- [ ] Add SHIPROCKET_PASSWORD  
- [ ] Add SHIPROCKET_PICKUP_LOCATION_ID
- [ ] Add SHIPROCKET_DEBUG
- [ ] Wait for redeploy
- [ ] Test payment
- [ ] Check Shiprocket dashboard
- [ ] Verify order appears ✅
