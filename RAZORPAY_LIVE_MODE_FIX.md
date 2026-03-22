# 🔴 CRITICAL: Razorpay Live Mode - International Cards Blocked

## The Problem:

Your Razorpay account is using **LIVE MODE KEYS** (`rzp_live_SMqkVvPnni1H3X`), which has these restrictions:

1. ❌ **Only Indian Cards** allowed (Visa/Mastercard issued in India)
2. ❌ **International cards blocked** (VISA/MC from other countries)
3. ❌ **Test cards don't work** in Live Mode
4. ❌ **Real money required** for any transaction

---

## ✅ SOLUTION: Switch to Test Mode Keys

### Step 1️⃣: Get Your Test Mode Keys

1. Go to **https://dashboard.razorpay.com**
2. Click **Settings** → **API Keys**
3. You'll see TWO sets of keys at the top:
   - **🟦 Test Mode** (Blue toggle) - Choose this one
   - **🟥 Live Mode** (Red) - Currently active

4. Toggle to **Test Mode** ← **Click here**
5. Copy the keys shown:
   - **Key ID** (starts with `rzp_test_...`)
   - **Key Secret** (long string)

### Step 2️⃣: Update Backend with Test Keys

Replace the keys in `server.js`:

**OLD:**
```javascript
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_live_SMqkVvPnni1H3X",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "Yv4Bd637j5fjHGJ7hrPe1vDV"
});
```

**NEW (with your test keys):**
```javascript
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YOUR_TEST_KEY_ID",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_TEST_KEY_SECRET"
});
```

### Step 3️⃣: Update Frontend with Test Key

In `src/App.js` or your checkout component, update:

**OLD:**
```javascript
const key = "rzp_live_SMqkVvPnni1H3X";
```

**NEW:**
```javascript
const key = "rzp_test_YOUR_TEST_KEY_ID";
```

### Step 4️⃣: Redeploy

1. Rebuild React: `npm run build`
2. Upload new build to Hostinger
3. Restart backend on Hostinger (or it auto-restarts)

### Step 5️⃣: Test with Test Cards

Now you can use **ANY TEST CARD**:

✅ **Visa Test Card:**
- Number: `4111 1111 1111 1111`
- Expiry: `12/25`
- CVV: `123`

✅ **MasterCard Test Card:**
- Number: `5555 5555 5555 4444`
- Expiry: `12/25`
- CVV: `123`

✅ **Indian Rupay Test Card:**
- Number: `5104 0000 0000 0008`
- Expiry: `12/25`
- CVV: `123`

**All are FREE in Test Mode! 🎉**

---

## 🚨 IMPORTANT: Live Mode vs Test Mode

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| Card Type | All test cards work | Only valid Indian cards |
| Cost | FREE ✅ | Real money charged |
| Purpose | Development & testing | Real customer payments |
| Time Limit | Unlimited | For real business |
| International Cards | ✅ Can use test cards | ❌ Only Indian cards |

**You should STAY in Test Mode until you're ready to accept real payments!**

---

## 📝 Step-by-Step to Get Test Keys

### From Razorpay Dashboard:

1. **Log in** to https://dashboard.razorpay.com
2. **Top Right** → You'll see "Live Mode" with a toggle
3. **Click the toggle** to switch to "Test Mode"
4. **Left Sidebar** → "Settings" → "API Keys"
5. **Copy both keys** shown on the page
6. **Paste them** in your server.js and App.js

### Visual:
```
Dashboard Header:
┌──────────────────────────────────────────────┐
│ 🔔  Settings ⚙️  Account     [Test Mode 🟦]  │
└──────────────────────────────────────────────┘
                                  ↑
                        Click toggle here to switch
```

---

## ⚠️ Common Mistakes:

❌ **Don't do this:**
- Use Live Mode keys for testing
- Use international cards in Live Mode
- Mix Test Mode keys with Live Mode
- Keep real keys in code (use environment variables)

✅ **Do this instead:**
- Use Test Mode keys for development
- Use Test Mode for all testing
- Switch to Live Mode ONLY when ready
- Store keys in environment variables

---

## 🎯 Quick Action Plan:

### Right Now (5 minutes):
1. Log into Razorpay dashboard
2. Switch to Test Mode
3. Copy Test Mode Key ID and Secret
4. Send me the keys (Key ID is safe to share, secret too for test)

### Then (10 minutes):
1. Update server.js with test keys
2. Update App.js with test key
3. Rebuild: `npm run build`
4. Upload to Hostinger

### Finally (5 minutes):
1. Test payment with test card
2. Should work! ✅
3. Order appears in "My Orders"

---

## 📞 Quick Reference

**Razorpay Dashboard:** https://dashboard.razorpay.com
**API Keys Location:** Settings → API Keys
**Test Card Numbers:**
- Visa: 4111 1111 1111 1111
- Mastercard: 5555 5555 5555 4444
- Rupay: 5104 0000 0000 0008

---

## Next Steps:

**Please:**
1. Go to Razorpay dashboard
2. Switch to Test Mode
3. Get your Test Mode keys
4. Share them with me (or just Key ID if secret is sensitive)

Then I'll update the code and we'll get payments working! 🚀

