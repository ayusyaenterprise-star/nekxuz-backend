# 🔧 MANUAL URL UPDATE ON HOSTINGER - DETAILED GUIDE

## The Issue:
The minified JavaScript has the Render URL hardcoded and compressed. We need to find and replace it in Hostinger's files.

## Solution: Edit Files Directly on Hostinger

### **EXACT LOCATIONS TO UPDATE:**

#### **File 1: static/js/main.57af96d8.js**
**Search for**: `nekxuz-backends.onrender.com`
**Replace with**: `api.nekxuz.in`

**Steps:**
1. Go to Hostinger hPanel
2. File Manager → public_html/static/js/
3. Right-click → `main.57af96d8.js` → Edit
4. Press `Ctrl+F` to find
5. Search for: `nekxuz-backends.onrender.com`
6. Replace all with: `api.nekxuz.in`
7. Save file
8. Done!

---

### **File 2: index.html (if it contains any references)**
**Location**: public_html/index.html
**Search for**: `nekxuz-backends.onrender.com`
**Replace with**: `api.nekxuz.in`

**Steps:**
1. Go to Hostinger hPanel
2. File Manager → public_html/
3. Right-click → `index.html` → Edit
4. Press `Ctrl+F` to find
5. Search for: `nekxuz-backends.onrender.com`
6. If found, replace with: `api.nekxuz.in`
7. Save file

---

## IMPORTANT: Which JS Files to Check

**All these files might contain the URL:**
- ✅ `public_html/static/js/main.57af96d8.js` (MAIN FILE - DEFINITELY HAS IT)
- ✅ `public_html/static/js/488.42328ad9.chunk.js` (CHECK THIS TOO)

---

## Step-by-Step Instructions

### **Step 1: Open Hostinger File Manager**
```
https://hpanel.hostinger.com
→ File Manager
→ Navigate to: public_html/static/js/
```

### **Step 2: Edit main.57af96d8.js**
```
Right-click on: main.57af96d8.js
Select: Edit (or Open with Editor)
```

### **Step 3: Find and Replace**
```
Press: Ctrl+H (or look for Replace button)

Find: nekxuz-backends.onrender.com
Replace with: api.nekxuz.in

Click: Replace All
```

### **Step 4: Save**
```
Press: Ctrl+S
Or click: Save button
Wait for confirmation
```

### **Step 5: Refresh Browser**
```
Go to: https://nekxuz.in
Press: Ctrl+Shift+R (HARD REFRESH)
Open console: F12
Should NOT see Render errors now!
```

---

## Visual Guide: How to Use Hostinger Editor

```
Hostinger File Manager:
├── 📁 public_html/
│   ├── 📁 static/
│   │   ├── 📁 js/
│   │   │   ├── main.57af96d8.js ← EDIT THIS
│   │   │   └── 488.42328ad9.chunk.js ← CHECK THIS TOO
│   │   ├── 📁 css/
│   │   └── 📁 media/
│   ├── index.html ← EDIT THIS TOO
│   └── ...
```

---

## What to Look For in the Code

When you open the JS file, you'll see minified code like:

```javascript
...nekxuz-backends.onrender.com/api/orders...
```

**FIND THIS TEXT:**
```
nekxuz-backends.onrender.com
```

**REPLACE WITH:**
```
api.nekxuz.in
```

---

## After Replacement - What Will Happen

1. ✅ Website still loads normally
2. ✅ All API calls go to Hostinger instead of Render
3. ✅ Orders saved to /data/orders.json
4. ✅ Console shows NO Render errors
5. ✅ Payments work correctly

---

## Quick Checklist

- [ ] Go to Hostinger hPanel
- [ ] File Manager → public_html/static/js/
- [ ] Edit `main.57af96d8.js`
- [ ] Find: `nekxuz-backends.onrender.com`
- [ ] Replace with: `api.nekxuz.in`
- [ ] Save file
- [ ] Check `488.42328ad9.chunk.js` for same string
- [ ] Replace there too if found
- [ ] Edit `index.html` and check
- [ ] Refresh https://nekxuz.in (Ctrl+Shift+R)
- [ ] Open console (F12)
- [ ] Verify NO Render errors

---

## Need Help?

If Hostinger editor is slow or not working:

### **Alternative: Use FTP**
1. Open FileZilla
2. Connect to Hostinger FTP
3. Navigate to public_html/static/js/
4. Download `main.57af96d8.js`
5. Open with VS Code
6. Find and replace the URL
7. Save file
8. Upload back to Hostinger
9. Done!

---

## Expected Result

After replacement and hard refresh:

**Console should show:**
```
✅ Firebase Initialized Successfully
✅ Razorpay script loaded successfully
Order creation response status: 200
```

**Console should NOT show:**
```
❌ nekxuz-backends.onrender.com/api/orders → 500
```

---

## If Still Not Working

1. **Clear complete browser cache**
   - Settings → Clear browsing data → All time
2. **Try different browser** (Chrome, Firefox, Safari)
3. **Check file modification time** in Hostinger
   - Should show TODAY's date after edit
   - If old date → edit didn't save, try again

---

## Final Step: Test

```
1. Go to: https://nekxuz.in
2. Hard refresh: Ctrl+Shift+R
3. Open console: F12
4. Add product to cart
5. Click Checkout
6. Check console for Render errors
7. Should NOT see any!
```

**All done! Let me know when you've updated it!** 🚀
