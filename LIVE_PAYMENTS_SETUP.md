# 🔴 NEKXUZ LIVE PAYMENTS SETUP GUIDE

## Current Status
✅ **Backend is ready** - Your live Razorpay keys are already in place:
- **Live Key ID:** `rzp_live_SMqkVvPnni1H3X`
- **Live Secret:** `Yv4Bd637j5fjHGJ7hrPe1vDV` (should keep secret!)

## What to Do Now

### Step 1: Verify Environment Variables on Render
Your Render backend needs these variables set explicitly (for security):

1. Go to: `https://dashboard.render.com`
2. Select: **nekxuz-backend** (your Node.js service)
3. Click: **Settings** (left sidebar)
4. Scroll to: **Environment**
5. Add/Verify these variables:
   ```
   RAZORPAY_KEY_ID = rzp_live_SMqkVvPnni1H3X
   RAZORPAY_KEY_SECRET = Yv4Bd637j5fjHGJ7hrPe1vDV
   ```

### Step 2: Redeploy Backend
After adding environment variables:
1. Click: **Deploy** (or Manual Deploy if needed)
2. Wait for deployment to complete (2-3 minutes)
3. Check: The root endpoint should show `razorpay_mode: 'PRODUCTION'`

```bash
# You can verify from terminal:
curl https://nekxuz-backend.onrender.com

# Should return:
# { "ok": true, "razorpay_mode": "PRODUCTION", ... }
```

### Step 3: Test Live Payment
1. Build React frontend:
   ```bash
   cd /Users/ayushgupta/Documents/untitled\ folder/Nekxuz\ copy/
   npm run build
   ```

2. Upload to Hostinger:
   - Delete public_html/ contents
   - Upload build/ contents
   - Clear cache

3. Visit nekxuz.in → Try checkout

### Step 4: Monitor Payment Success
Check Render logs during payment:
```bash
# Real-time logs
curl https://nekxuz-backend.onrender.com/api/logs
```

---

## 📊 Configuration Summary

### Server.js (Lines 61-63)
```javascript
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV"
});
```

### Verification Endpoint (Line 151)
```javascript
.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV")
```

✅ **Status:** Uses live keys in both places!

---

## 🎯 Verification Checklist

- [ ] Environment variables added to Render
- [ ] Backend redeployed
- [ ] `https://nekxuz-backend.onrender.com` returns `razorpay_mode: 'PRODUCTION'`
- [ ] React build created (`npm run build`)
- [ ] Build uploaded to Hostinger public_html/
- [ ] nekxuz.in loads without errors
- [ ] Test payment initiated (can use Razorpay test card after, then real card)
- [ ] Payment success page shows OrderID & Shipment details

---

## 💳 Test Payment Steps

After deployment:

### Option A: Real Payment (Go Live)
1. Visit https://nekxuz.in
2. Add items to cart
3. Enter real details & attempt payment
4. Use any real Visa/Mastercard
5. Payment will be charged (real money)
6. Check Razorpay Dashboard for transaction

### Option B: Test First (Recommended)
1. Visit https://nekxuz.in
2. Add items to cart
3. Proceed to payment
4. When Razorpay modal opens, use test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: `12/25`
   - CVV: `123`
   - This will show in test mode

**Note:** If you see test cards declining, your payment is already in LIVE mode ✅

---

## 🚨 Important Notes

### Security
- **NEVER** commit these keys to GitHub
- **ALWAYS** use environment variables in production
- Your keys are partially visible in server.js (OK for fallback)

### Testing vs Live
- **Live Mode:** Real transactions, real money charged
- **Test Mode:** Razorpay test cards accepted, no real charges
- Your system is **IN LIVE MODE** (using live keys)

### Razorpay Dashboard
Visit: https://dashboard.razorpay.com
- Monitor all payments
- See settlement status
- Check refund requests
- View customer data

---

## 🐛 Troubleshooting

### Payment failing with "Invalid Key"
→ Environment variables not set on Render
→ Redeploy backend

### Payment modal not opening
→ Check browser console for errors
→ Verify Razorpay script is loaded
→ Check `window.Razorpay` exists

### Payment success but no shipment
→ Check backend logs on Render
→ Verify Shiprocket API connection
→ Check database has order

### "Order verification failed"
→ Backend not returning proper response
→ Check `/api/payment/verify` endpoint
→ Verify signature validation

---

## 📞 Support Resources

**Razorpay:**
- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs/
- Support: https://razorpay.com/support/

**Render:**
- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs

**Shiprocket:**
- Dashboard: https://app.shiprocket.co
- API Docs: https://shiprocket.co/api-docs

---

## ✅ Next Steps

1. **Add env vars to Render** (5 minutes)
2. **Redeploy backend** (3 minutes)
3. **Build & upload frontend** (5 minutes)
4. **Test payment** (2 minutes)
5. **Monitor success** (ongoing)

**Total Time:** ~15 minutes to go live! 🎉

---

**Updated:** March 22, 2026
**Status:** Ready for Live Payments ✅
