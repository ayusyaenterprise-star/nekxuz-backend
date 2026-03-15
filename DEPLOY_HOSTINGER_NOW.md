# ✅ NEKXUZ - FREE BACKEND DEPLOYMENT CHECKLIST

## 🎯 YOUR GOAL: Deploy Backend to Hostinger for FREE

### Current Situation:
- ✅ Frontend: https://nekxuz.in (LIVE on Hostinger)
- ✅ Razorpay: PRODUCTION MODE active
- ❌ Backend: Not deployed yet
- ❌ Orders: Not saving (needs backend)

### The Plan:
Use **Hostinger Node.js Hosting** (included in your plan, completely FREE)

---

## IMMEDIATE ACTIONS (NEXT 30 MINUTES)

### ☐ 1. Access Hostinger Account
- [ ] Go to https://hpanel.hostinger.com/
- [ ] Login with your credentials
- [ ] Select domain: nekxuz.in

### ☐ 2. Check Node.js is Enabled
- [ ] Click **Manage** → Look for "Node.js Applications"
- [ ] If not visible, go to **Advanced** and enable Node.js
- [ ] Wait 2-5 minutes for activation

### ☐ 3. Prepare Backend Files
- [ ] Download this repository: `git clone https://github.com/ayusyaenterprise-star/nekxuz-backend.git`
- [ ] OR Copy from your local folder:
  - `package.json`
  - `server.js`

### ☐ 4. Upload to Hostinger via File Manager
1. [ ] Click **Manage** → **File Manager**
2. [ ] Navigate to: `public_html/`
3. [ ] Create folder: `api` (or `backend`)
4. [ ] Upload files:
   - [ ] package.json
   - [ ] server.js
5. [ ] Do NOT upload node_modules (Hostinger will install)

### ☐ 5. Create Node.js Application
1. [ ] Go to **Manage** → **Node.js Applications**
2. [ ] Click **Create Application**
3. [ ] Fill these fields:
   - [ ] Node.js Version: **24.x**
   - [ ] Application Mode: **production**
   - [ ] Application Root: **/public_html/api** (or backend)
   - [ ] Application Startup File: **server.js**
   - [ ] Application URL: **api.nekxuz.in** (or backend.nekxuz.in)
4. [ ] Click **Create** or **Deploy**
5. [ ] **WAIT 2-5 minutes** for deployment to complete

### ☐ 6. Test Backend is Working
Run these in Terminal:

```bash
# Test if backend is online
curl https://api.nekxuz.in/

# Should return:
# {"ok":true,"message":"Nekxuz Backend Running on Hostinger",...}

# Test payment endpoint
curl -X POST https://api.nekxuz.in/api/payment \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"invoiceNumber":"test123"}'
```

If you see responses → ✅ Backend is working!

### ☐ 7. Verify Frontend is Using Correct Backend
- [ ] Check `src/App.js` line 13
- [ ] Should have: `const API_BASE_URL = "https://api.nekxuz.in"`
- [ ] It's auto-configured, so no changes needed!

### ☐ 8. Test Full Order Flow
1. [ ] Go to https://nekxuz.in
2. [ ] Add product to cart
3. [ ] Proceed to checkout
4. [ ] Complete payment with Razorpay
5. [ ] Check "My Orders" tab
6. [ ] Order should appear ✅

---

## IF SOMETHING GOES WRONG

### Problem: Backend returns 404
- [ ] Check backend files are uploaded to correct folder
- [ ] Verify Node.js Application shows "Running" status
- [ ] Try Restart button in Node.js Applications
- [ ] Check server.js file is present

### Problem: Module not found error
- [ ] Go to Node.js Applications settings
- [ ] Click "Install Dependencies" or run: `npm install`
- [ ] Restart application

### Problem: Frontend still not showing orders
- [ ] Check browser console for errors (F12)
- [ ] Verify API_BASE_URL in browser Network tab
- [ ] Test payment endpoint manually (see above)
- [ ] Check Hostinger backend logs

### Hostinger Support:
- [ ] If issues persist, contact Hostinger support
- [ ] Go to Help & Support → Live Chat
- [ ] Tell them: "I need help enabling Node.js application"

---

## OPTIONAL: Alternative if Hostinger Node.js Doesn't Work

If Hostinger Node.js hosting isn't available for your plan, use **Replit (FREE)**:

1. [ ] Go to https://replit.com
2. [ ] Create account
3. [ ] Create new "Node.js" project
4. [ ] Upload package.json and server.js
5. [ ] Click "Run"
6. [ ] Copy the URL provided
7. [ ] Update App.js with the Replit URL

---

## FINAL SUCCESS CHECKLIST

- [ ] Backend URL returns 200 OK
- [ ] Payment endpoint accepts POST requests  
- [ ] Orders are saved to Firebase Firestore
- [ ] Frontend shows orders in "My Orders" tab
- [ ] Stock updates after successful payment
- [ ] No errors in browser console
- [ ] Payment flow works end-to-end
- [ ] Backend logs show requests being processed

---

## 🎉 YOU'VE DONE IT!

Once all checks pass:
- ✅ Your entire platform is FREE (except Razorpay fees)
- ✅ No monthly hosting costs
- ✅ All features working
- ✅ Ready for real customers

---

## TIMELINE

| Time | Action | Expected Result |
|------|--------|-----------------|
| Now | Upload files | Files visible in Hostinger |
| +2 min | Create Node.js app | App status: "Running" |
| +5 min | Test root endpoint | {"ok":true,...} |
| +10 min | Test payment endpoint | {"orderId":"order_xxx"} |
| +15 min | Complete test order | Order in "My Orders" |
| +20 min | ✅ SUCCESS | Backend fully operational |

---

## QUESTIONS?

Reference docs:
- `HOSTINGER_COMPLETE_GUIDE.md` - Detailed walkthrough
- `server.js` - Backend code (read for understanding)
- GitHub: https://github.com/ayusyaenterprise-star/nekxuz-backend

---

**You've got this! 🚀**
