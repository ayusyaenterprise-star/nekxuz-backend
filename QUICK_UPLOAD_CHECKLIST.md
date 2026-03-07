# 🚀 QUICK UPLOAD CHECKLIST - NEKXUZ FRONTEND

**Goal:** Upload React build to Hostinger in 5 minutes  
**Target:** `https://nekxuz.in`  

---

## **⏱️ 5-MINUTE UPLOAD PROCESS**

### **BEFORE YOU START**
- [ ] Launch folder exists at `/launch/`
- [ ] All files in launch folder
- [ ] Hostinger login credentials ready

### **STEP 1: Login (1 minute)**
- [ ] Visit https://hpanel.hostinger.com
- [ ] Login with your credentials
- [ ] Select website: **nekxuz.in**

### **STEP 2: Navigate to File Manager (1 minute)**
- [ ] Click **Files** → **File Manager**
- [ ] Navigate to: `public_html/`
- [ ] Delete all existing files in public_html

### **STEP 3: Upload Files (2 minutes)**
- [ ] Open File Manager upload dialog
- [ ] Select all files from `launch/` folder locally
- [ ] Upload them to `public_html/`

**Files to upload:**
```
index.html
.htaccess ← CRITICAL!
favicon.ico
static/ (entire folder)
assets/ (entire folder)
```

### **STEP 4: Verify .htaccess (1 minute)**
- [ ] In File Manager, look for `.htaccess`
- [ ] If not visible → Enable "Show hidden files"
- [ ] Verify `.htaccess` exists in `public_html/`

---

## **✅ VERIFICATION**

After upload is complete:

```
1. Visit: https://nekxuz.in
   Expected: Homepage loads, no 404 error

2. Click: Different pages (products, cart, checkout)
   Expected: No 404 errors on page refresh

3. Open Console: F12 → Console tab
   Expected: No red errors

4. Check Network: F12 → Network tab
   Expected: API calls to nekxuz-backend.onrender.com with 200 status
```

---

## **❌ IF SOMETHING BREAKS**

| Problem | Quick Fix |
|---------|-----------|
| 404 error on refresh | .htaccess not uploaded or in wrong location |
| Can't see .htaccess | Enable "Show hidden files" in file manager |
| API calls failing | Check if backend is running: https://nekxuz-backend.onrender.com |
| CSS/JS not loading | Verify `static/` folder uploaded completely |

---

## **🎯 SUCCESS INDICATORS**

After deployment, you should see:

✅ Homepage loads at https://nekxuz.in  
✅ Products display correctly  
✅ Navigation works (no 404 on refresh)  
✅ Console shows no errors  
✅ Network tab shows API calls to backend (200 status)  
✅ Cart adds items  
✅ Can proceed to checkout  

---

## **📂 LOCAL FOLDER STRUCTURE**

Your upload should mirror this:

```
launch/                    ← This entire folder contents
├── index.html
├── favicon.ico
├── .htaccess              ← DON'T FORGET THIS!
├── static/
│   ├── js/
│   │   ├── main.*.js
│   │   └── *.js
│   └── css/
│       └── main.*.css
└── assets/
    └── cataloges/
        └── [images]
```

---

## **⚙️ CRITICAL FILES**

| File | Location | Purpose | Status |
|------|----------|---------|--------|
| index.html | `/public_html/` | App entry point | ✅ Ready |
| .htaccess | `/public_html/` | SPA routing | ✅ Ready |
| static/ | `/public_html/static/` | JS/CSS bundles | ✅ Ready |
| assets/ | `/public_html/assets/` | Images/media | ✅ Ready |

---

## **🔐 DOMAIN CONFIGURATION**

- Domain: `nekxuz.in`
- Hosted: Hostinger
- HTTPS: Auto-enabled ✅
- Primary Domain: Set to point to `public_html/` ✅

---

## **🌍 API CONFIGURATION**

- Backend URL: `https://nekxuz-backend.onrender.com`
- Already configured in code ✅
- No changes needed in frontend code ✅

---

## **⏰ ESTIMATED TIME**

| Task | Duration |
|------|----------|
| Login to Hostinger | 1 min |
| Navigate to File Manager | 1 min |
| Upload files | 2 min |
| Verify .htaccess | 1 min |
| **TOTAL** | **5 minutes** |

---

## **🆘 GET HELP**

If deployment fails:

1. Check `.htaccess` is uploaded
2. Verify backend is running
3. Clear browser cache (Cmd+Shift+R on Mac)
4. Check browser console for errors
5. Wait 5-10 minutes for DNS propagation

---

## **✨ YOU'RE READY!**

All files are prepared and ready to upload.

**Next action:** Upload `launch/` contents to `public_html/` via Hostinger File Manager

Let's go live! 🚀
