# 🔧 HOSTINGER DEPLOYMENT - TROUBLESHOOTING GUIDE

If you encounter any issues during or after uploading, check this guide.

---

## **❌ ISSUE #1: 404 ERROR ON PAGE REFRESH**

**What happens:** 
- Homepage loads fine
- Click to another page (e.g., `/products`)
- Page loads with JS
- Refresh the page → **404 Not Found Error**

**Why it happens:**
- `.htaccess` file missing
- `.htaccess` not in correct location
- `.htaccess` not uploaded

**How to fix:**

### **Check 1: Is .htaccess uploaded?**

1. Go to Hostinger → File Manager
2. Navigate to `public_html/`
3. Look for `.htaccess` file
4. **If you don't see it:**
   - Click the settings gear icon ⚙️
   - Enable "Show hidden files"
   - Now try again

### **Check 2: Is .htaccess in the right location?**

- ✅ Correct: `public_html/.htaccess`
- ❌ Wrong: `public_html/static/.htaccess`
- ❌ Wrong: `public_html/assets/.htaccess`

The `.htaccess` must be in the **root** of `public_html/`, not in subfolders.

### **Check 3: Re-create .htaccess if needed**

If missing, create it:

1. Hostinger File Manager → `public_html/`
2. Click "Create New" → "File"
3. Name: `.htaccess`
4. Click Create
5. Edit the file
6. Copy-paste this code:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

7. Save
8. Test again

---

## **❌ ISSUE #2: API CALLS FAILING (Products Don't Load)**

**What happens:**
- Page loads
- No products appear
- Console shows API errors

**Why it happens:**
- Backend down or unreachable
- Wrong API URL in code
- CORS issues
- Network connectivity problem

**How to fix:**

### **Step 1: Check Backend Status**

Visit: https://nekxuz-backend.onrender.com

- ✅ If page loads → Backend is running
- ❌ If blank/error → Backend is down

**If backend is down:**

1. Go to Render Dashboard: https://render.com/dashboard
2. Select your backend service
3. Click "Manual Deploy"
4. Wait for deployment to complete
5. Refresh frontend

### **Step 2: Check Browser Console**

1. Go to https://nekxuz.in
2. Press `F12` (or right-click → Inspect)
3. Go to "Console" tab
4. Look for errors

**Common errors:**

```
❌ "Failed to fetch from https://nekxuz-backend.onrender.com"
   → Backend is down, restart it

❌ "CORS error"
   → CORS not configured on backend (unlikely if it was working before)

❌ "Network error"
   → Check internet connection
```

### **Step 3: Check Network Tab**

1. Press `F12`
2. Go to "Network" tab
3. Reload page
4. Look for API calls to:
   ```
   https://nekxuz-backend.onrender.com/api/...
   ```
5. Check the status:
   - ✅ Status 200 = Success
   - ⏳ Status 304 = Cached (OK)
   - ❌ Status 500 = Server error
   - ❌ Status 404 = Not found

---

## **❌ ISSUE #3: CSS OR JAVASCRIPT NOT LOADING**

**What happens:**
- Page loads but looks broken
- No styling visible
- Some features don't work

**Why it happens:**
- `static/` folder not uploaded completely
- File names mismatch
- Case-sensitive issues (Linux servers are case-sensitive)

**How to fix:**

### **Check 1: Is static/ folder uploaded?**

1. Hostinger File Manager → `public_html/`
2. Look for `static/` folder
3. Open it and check:
   - `js/` subfolder exists
   - `css/` subfolder exists
4. Inside `js/`:
   - `main.4256668f.js` (or similar filename)
   - `453.9ec51a90.chunk.js` (or similar)
5. Inside `css/`:
   - `main.075bb25e.css` (or similar)

### **Check 2: Re-upload static folder**

If files are missing:

1. From your local `/launch/` folder
2. Upload the entire `static/` folder again
3. Make sure it goes to `public_html/static/`

### **Check 3: Check browser console for 404s**

1. Press `F12` → Console tab
2. Look for errors like:
   ```
   GET https://nekxuz.in/static/js/main.xxx.js 404
   ```
3. This means the file didn't upload properly
4. Re-upload the entire `static/` folder

---

## **❌ ISSUE #4: IMAGES NOT SHOWING**

**What happens:**
- Products load
- Text visible
- Images are missing or broken

**Why it happens:**
- Images come from Firebase (not your server)
- Firebase credentials issue
- Firebase not initialized

**How to fix:**

### **Check 1: Is Firebase working?**

1. Press `F12` → Console tab
2. Look for any Firebase errors:
   ```
   Firebase authentication error
   Firebase storage error
   ```

### **Check 2: Check assets folder**

Your server-hosted assets in `/assets/cataloges/` should work, but product images are from Firebase.

1. Hostinger File Manager → `public_html/assets/`
2. Check if product images are there
3. If not, re-upload the `assets/` folder

### **Check 3: Check Network tab**

1. Press `F12` → Network tab
2. Filter for image requests
3. Look for broken image requests (red X)
4. Check if they're pointing to:
   - ✅ Firebase URLs (lh3.googleusercontent.com, etc.)
   - ❌ Broken links

---

## **❌ ISSUE #5: HTTPS NOT WORKING**

**What happens:**
- Get SSL certificate error
- Browser shows "Not Secure"
- Mixed content warning

**Why it happens:**
- SSL not properly configured
- Some resources loading from HTTP instead of HTTPS

**How to fix:**

### **Check 1: Force HTTPS**

Add this to your `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
  
  # Rewrite to index.html for SPA routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

### **Check 2: Verify SSL Certificate**

1. Hostinger Control Panel → SSL Certificates
2. Should show: ✅ Active / Installed
3. If not installed, click "Install"

### **Check 3: Check for mixed content**

1. Press `F12` → Console tab
2. Look for warnings about mixed content
3. All resources should be HTTPS (not HTTP)

---

## **❌ ISSUE #6: BLANK PAGE**

**What happens:**
- Visit https://nekxuz.in
- See completely blank page
- No error messages

**Why it happens:**
- `index.html` not uploaded
- JavaScript error
- React didn't initialize

**How to fix:**

### **Check 1: Is index.html there?**

1. Hostinger File Manager → `public_html/`
2. Look for `index.html` file
3. If missing, re-upload it from `/launch/` folder

### **Check 2: Check console for errors**

1. Press `F12` → Console tab
2. Look for any red errors
3. Note the error message
4. Search for solution based on error

### **Check 3: Check if page source loads**

1. Press `Ctrl+U` (or Cmd+U on Mac)
2. Should show HTML code
3. If completely empty, `index.html` didn't upload

---

## **❌ ISSUE #7: SLOW LOADING**

**What happens:**
- Page takes very long to load
- Network tab shows slow requests

**Why it happens:**
- Large JavaScript bundle
- Render backend slow/cold start
- Network issues

**How to fix:**

### **Check 1: Is backend cold?**

Render free tier sleeps after 15 minutes of inactivity.

Solution: Visit backend URL to wake it up:
```
https://nekxuz-backend.onrender.com
```

This "wakes up" the server so it responds faster.

### **Check 2: Check file sizes**

1. Press `F12` → Network tab
2. Reload page
3. Look at file sizes:
   - main.js should be ~199 KB (OK)
   - main.css should be ~8.81 KB (OK)

### **Check 3: Network throttling**

To test on slow connection:
1. Press `F12` → Network tab
2. Throttle → Change to "Slow 3G"
3. Reload page
4. See if it's still usable

---

## **✅ VERIFICATION CHECKLIST**

After deployment, go through this:

- [ ] Homepage loads at https://nekxuz.in
- [ ] No 404 errors on page refresh
- [ ] Navigation works (products, cart, checkout)
- [ ] Products load from API
- [ ] Browser console has no red errors
- [ ] Network tab shows successful API calls (200 status)
- [ ] HTTPS works (no "Not Secure" warning)
- [ ] Images load (or Firebase error if Firebase down)
- [ ] Cart functionality works
- [ ] Checkout page loads
- [ ] Can proceed to payment

---

## **🆘 STILL NOT WORKING?**

### **Last resort - Check everything:**

1. **Is .htaccess uploaded?** → Check File Manager
2. **Is backend running?** → Visit Render backend URL
3. **Are all files uploaded?** → Check File Manager for index.html, static/, assets/
4. **Is domain configured?** → Check Hostinger domain settings
5. **Are there console errors?** → Press F12, check Console tab

### **Check browser console for clues:**

Errors in the console will tell you what's wrong:
- API error → Backend problem
- 404 error → File not uploaded
- Rewrite error → .htaccess problem
- Module error → JavaScript bundle problem

### **Common fixes (try in order):**

1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear browser cache
3. Try in incognito/private mode
4. Check Firefox (if Chrome doesn't work)
5. Wait 5-10 minutes for DNS to propagate

---

## **📞 GETTING HELP**

If you're stuck:

1. **Check console errors (F12)** - Most helpful
2. **Check Network tab (F12)** - Shows API calls
3. **Visit backend directly** - Confirms if backend is up
4. **Check Hostinger file manager** - Verify files are uploaded
5. **Contact Hostinger support** - If it's a server issue

---

## **🎯 SUCCESS INDICATORS**

You know it's working when:

✅ Homepage loads without errors  
✅ Navigation works  
✅ Products display  
✅ No console errors  
✅ API calls to backend succeed (200 status)  
✅ Can add items to cart  
✅ Can proceed to checkout  
✅ Payment page loads  

---

**Good luck! You've got this!** 🚀
