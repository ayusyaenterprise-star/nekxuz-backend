# 🔧 Cache Clearing Guide - Nekxuz Deployment

## Problem
Changes uploaded to Hostinger are not showing on nekxuz.in - this is a **caching issue**, not a deployment problem.

---

## ✅ Verification - Code IS Correct

The updated_build folder contains:
- ✅ Stock badges hidden (only shows "Out of Stock" or "Only X left")
- ✅ RFQ and Messenger tabs in mobile navigation
- ✅ All mobile optimizations applied

---

## 🎯 SOLUTION - Try in This Order:

### **STEP 1: Browser Cache (90% Works)**

#### Windows/Linux:
```
1. Go to nekxuz.in
2. Press: Ctrl + Shift + Delete
3. Select "All time"
4. Check: ☑ Cookies and cached data
5. Click: Clear data
6. Refresh page: Ctrl + R
```

#### Mac:
```
1. Go to nekxuz.in
2. Press: Cmd + Shift + Delete
3. OR use Safari: Develop → Empty Web Storage
4. Refresh: Cmd + R
```

---

### **STEP 2: Open in Incognito/Private Window (Bypass Cache)**

This completely bypasses browser cache:

#### Chrome:
```
Ctrl + Shift + N (Windows)
Cmd + Shift + N (Mac)
Then visit: nekxuz.in
```

#### Safari:
```
Cmd + Shift + N
Then visit: nekxuz.in
```

**If changes appear in incognito → Issue is browser cache (STEP 1 will fix it)**

---

### **STEP 3: Hostinger Server Cache**

If still not working after browser cache clear:

1. **Login to Hostinger Panel**
2. **Hosting → Performance → Caching**
3. Click **Clear All Caches** button
4. Wait 2-3 minutes
5. Refresh nekxuz.in (Ctrl+F5)

---

### **STEP 4: CDN Cache (If Enabled)**

Hostinger may be using CDN caching:

1. **Hosting → Performance → CDN Cache**
2. Click **Clear CDN Cache**
3. Wait 5-10 minutes
4. Refresh nekxuz.in

---

### **STEP 5: Service Worker Unregister**

If it's still cached:

1. Open nekxuz.in
2. Press **F12** (Developer Tools)
3. Go to **Application Tab**
4. Left sidebar → **Service Workers**
5. Click **Unregister** for nekxuz.in
6. Click **Storage** → **Clear site data**
7. Refresh page (Ctrl+F5)

---

## 🔍 **How to Verify Changes Are Live**

### **Check 1: Open DevTools**
```
Press F12 → Network Tab
Refresh page → Look for main.XXXXX.js file
Should be ~770KB+ size
```

### **Check 2: Look for Stock Badges**
- Scroll to any product in Wholesale tab
- Products with 10+ stock should have **NO badge**
- Products with 0-10 stock show **"Only X left"** (yellow)
- Out of stock products show **"Out of Stock"** (red)

### **Check 3: Mobile Navigation**
- Scroll to bottom of page on mobile
- Should see 8 tabs: Home, Retail, Wholesale, Mfg, Wholesaler, Global, **Message**, **RFQ**
- RFQ and Message should be clickable (new!)

---

## 📱 **Quick Test on Phone**

Open nekxuz.in on your phone:
1. **Bottom navigation** - Should show 8 tabs with scroll
2. **RFQ tab** - Should be visible and clickable
3. **Product cards** - Should NOT show "100 in Stock" badges

---

## 🚨 **If Still Not Working:**

### **Nuclear Option: Hard Refresh Everything**

1. **Close all nekxuz.in tabs**
2. **Clear browser history completely:**
   - Chrome: Settings → Privacy → All time → Clear
   - Safari: History → Clear History (all time)
3. **Restart browser completely**
4. **Visit: https://nekxuz.in** (fresh start)

---

## 📝 **Alternative: Check File Upload**

If nothing works, verify upload to Hostinger:

1. **Hostinger File Manager**
2. **Navigate to public_html/**
3. Should see these folders:
   - ✅ static/ (with js/ and css/ subfolders)
   - ✅ assets/
   - ✅ index.html (main file)
   - ✅ manifest.json
   - ✅ favicon.ico

4. **Check static/js/main.XXXXX.js exists** (should be ~770KB)

If `static/js/main.js` is much smaller (~10KB), then old file is still there!

---

## 💾 **Last Resort: Re-upload**

If files seem wrong:

1. **Delete everything in public_html/**
   - Select all → Delete
   - Wait for deletion to complete

2. **Re-upload updated_build contents:**
   - Select all files in updated_build/
   - Upload to public_html/
   - Wait for 100% completion

3. **Wait 2 minutes** for server to process
4. **Hard refresh:** Ctrl+Shift+Delete → Clear → Refresh

---

## 📞 **Still Not Working?**

Contact Hostinger support:
1. **Tell them:** "nekxuz.in is showing cached version, not latest files"
2. **Ask them to:**
   - Clear all caches (browser, server, CDN)
   - Restart PHP/Web server
   - Check if files in public_html/ are actually updated

---

**Last Updated:** March 22, 2026
**Status:** All code is correct, 100% cache issue
