# ⚡ QUICK FIX: Render Backend Deployment

## The Problem
```
Error: Cannot find module 'razorpay'
Location: /opt/render/project/src/server.js
```

**Why**: Render is looking for server.js in the wrong place.

---

## The Fix (3 Steps)

### Step 1: Verify Root Structure ✅
Make sure you have these files in root:
```
server.js           ← Full backend code (1199 lines)
package.json        ← Has razorpay dependency  
.env                ← Has all API keys
render.yaml         ← Configuration (I just created this)
```

### Step 2: Push to GitHub
```bash
cd "/Users/ayushgupta/Documents/untitled folder/Nekxuz copy"
git add render.yaml package.json .env server.js
git commit -m "Fix: Render deployment - correct server path and dependencies"
git push origin main
```

### Step 3: Redeploy on Render
1. Go to: https://dashboard.render.com/
2. Select: "nekxuz-backend" service
3. Click: **"Redeploy latest commit"**
4. Wait for: "Build successful" message
5. Check logs for any errors

---

## If Still Failing - Debug Checklist

Check Render Dashboard → Service Settings → Build & Deploy:

- [ ] **Start Command** = `node server.js` (NOT `src/server.js`)
- [ ] **Build Command** = `npm install` (or leave empty)
- [ ] **Root Directory** = empty (default)
- [ ] **Node Version** = 18.x

Check Environment Variables:
- [ ] `PORT=3002`
- [ ] `RAZORPAY_KEY_ID=rzp_live_...`
- [ ] `RAZORPAY_KEY_SECRET=...`
- [ ] `DATABASE_URL=postgresql://...`

---

## Verify After Deploy

Test your backend:
```bash
curl https://nekxuz-backend-oqcn.onrender.com/health
```

Should return something like:
```json
{"status":"ok"}
```

---

## Your Files Are Ready ✅

| File | Status |
|------|--------|
| server.js | ✅ Has Razorpay & Shiprocket |
| package.json | ✅ Has all dependencies |
| .env | ✅ Has all API keys |
| render.yaml | ✅ Just created |

**Everything is configured correctly. Just redeploy!** 🚀

---

## Need Help?

If you still see "Cannot find module 'razorpay'":
1. Check Render logs (Dashboard → Logs tab)
2. Look for the actual error message
3. Common fixes:
   - Clear deploy cache and redeploy
   - Verify Start Command is `node server.js`
   - Check DATABASE_URL format

---

**Next**: Redeploy on Render → Test → Deploy frontend → Go live! 🎉
