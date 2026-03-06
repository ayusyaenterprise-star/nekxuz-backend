# 🔒 MASTER PRODUCTION BUILD - LOCKED REFERENCE

**Status**: ✅ **FINAL DESIGN - DO NOT MODIFY**

---

## ⚠️ CRITICAL INSTRUCTION

**This is the EXACT site design approved and working correctly.**

### Rules to Follow:
1. **NEVER regenerate** the entire React build with `npm run build`
2. **ONLY update src/App.js** when fixing bugs or adding features
3. **After ANY update to src/App.js**, rebuild using `npm run build`
4. **ALWAYS compare** the new build with `MASTER_PRODUCTION_BUILD/` to ensure design stays same
5. **If design changes**, immediately revert to this master build
6. **This folder is the source of truth** for site appearance and functionality

---

## 📁 Master Build Location

```
/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/MASTER_PRODUCTION_BUILD/
```

### Master Build Contents
```
MASTER_PRODUCTION_BUILD/
├── .htaccess                    # Apache routing (DO NOT CHANGE)
├── index.html                   # React entry point (DO NOT CHANGE)
├── asset-manifest.json          # Asset mapping (DO NOT CHANGE)
├── test_checkout.html           # Checkout test (reference only)
├── assets/
│   └── cataloges/              # Product images folder
│       └── neem\ lime-50/       # Example product folder
│           ├── 1.jpeg
│           ├── 1.jpg
│           ├── 2.jpg
│           └── 3.jpg
└── static/                      # React bundle (DO NOT CHANGE)
    ├── css/
    │   ├── main.d44b9e5a.css
    │   └── main.d44b9e5a.css.map
    ├── js/
    │   ├── 453.390ab5fb.chunk.js
    │   ├── main.1aec1fa7.js
    │   └── main.1aec1fa7.js.LICENSE.txt
    └── media/                   # Product images (60 files)
        └── [hash-based image files]
```

**Build Size**: 17 MB  
**Total Files**: 74  
**Design Version**: Final (6 March 2026)

---

## 🔄 Workflow for Updates

### When you need to add a feature or fix a bug:

1. **Edit ONLY `src/App.js`**
   ```bash
   # Make your changes to src/App.js
   vim src/App.js
   ```

2. **Rebuild the project**
   ```bash
   npm run build
   ```

3. **Compare with master**
   ```bash
   # Check if design is still the same
   diff -r build_hostinger/ MASTER_PRODUCTION_BUILD/ | head -20
   ```

4. **If design is different**
   ```bash
   # Revert immediately
   rm -rf build_hostinger
   cp -r MASTER_PRODUCTION_BUILD build_hostinger
   ```

5. **If design is the same**
   ```bash
   # Good to deploy!
   # Upload build_hostinger/ to Hostinger
   ```

---

## 🚫 DO NOT DO THIS

❌ **Never do these things:**

1. **Delete MASTER_PRODUCTION_BUILD folder**
   - This is your fallback if design breaks
   
2. **Modify the React configuration**
   - Don't change vite.config.js or package.json without testing
   
3. **Delete src/assets/cataloges/**
   - Product images are needed for the build
   
4. **Run `npm install` without knowing why**
   - Could change dependencies and break design
   
5. **Use an old build folder**
   - Always regenerate from src/App.js changes

---

## ✅ DO THIS FOR UPDATES

✅ **Correct workflow:**

```bash
# Step 1: Make your change to src/App.js
nano src/App.js

# Step 2: Rebuild
npm run build

# Step 3: Verify design didn't change
ls -la build_hostinger/static/css/   # Should see main.d44b9e5a.css
ls -la MASTER_PRODUCTION_BUILD/static/css/   # Should be identical

# Step 4: If sizes match, you're good!
du -sh build_hostinger/static/
du -sh MASTER_PRODUCTION_BUILD/static/   # Should be the same

# Step 5: Deploy to Hostinger
scp -r build_hostinger/* user@nekxuz.in:/public_html/
```

---

## 🎯 Current Design Specifications

### Pages & Features Present
- ✅ Home/Shop catalog with all products
- ✅ Product detail pages
- ✅ Shopping cart
- ✅ Checkout with Razorpay
- ✅ PDF invoice generation
- ✅ Shiprocket tracking integration
- ✅ RFQ (Request for Quotation) system
- ✅ Contract Manufacturing inquiries
- ✅ AI Chat assistant (Gemini)
- ✅ User authentication (Firebase)

### Assets Included
- **Product Images**: Located in `assets/cataloges/`
  - neem-lime-50/ (and other products)
  - Multiple images per product
  
- **Bundled Images**: In `static/media/`
  - 60+ webpack-processed images
  - Optimized for web delivery

### Style & Design
- **CSS**: Tailwind CSS (main.d44b9e5a.css)
- **Layout**: React with 2 main chunks (453.390ab5fb.chunk.js, main.1aec1fa7.js)
- **Styling**: All classes and themes finalized

---

## 📊 Hash Verification

**If you want to verify the exact files match:**

```bash
# Generate checksums of master
find MASTER_PRODUCTION_BUILD -type f -exec md5 {} \; > master_checksums.txt

# Compare with current build
find build_hostinger -type f -exec md5 {} \; > current_checksums.txt

# Check if they match
diff master_checksums.txt current_checksums.txt
# Should be empty if identical
```

---

## 🆘 If Something Goes Wrong

**Build looks different?**
```bash
# Immediately restore from master
rm -rf build_hostinger
cp -r MASTER_PRODUCTION_BUILD build_hostinger
```

**Don't know what changed?**
```bash
# Check what files are different
diff -r build_hostinger/ MASTER_PRODUCTION_BUILD/
```

**Need to debug the design?**
```bash
# Compare folder sizes
du -sh build_hostinger/
du -sh MASTER_PRODUCTION_BUILD/
# Should be approximately equal (within 1-2 MB)

# Check static files
ls -la build_hostinger/static/
ls -la MASTER_PRODUCTION_BUILD/static/
# Should be very similar
```

---

## 📝 Update Log

| Date | Change | Status |
|------|--------|--------|
| 6 Mar 2026 | Master build created from desktop version | ✅ LOCKED |
| - | All features working | ✅ VERIFIED |
| - | 74 files, 17 MB | ✅ FINAL |
| - | All product images present | ✅ CONFIRMED |

---

## 🔐 Protection Rules

**These files should NEVER be modified:**
- ✅ `MASTER_PRODUCTION_BUILD/` - READ ONLY (source of truth)
- ✅ `build_hostinger/.htaccess` - Only if Apache config needed
- ✅ `build_hostinger/static/` - Generated from npm build only
- ✅ `build_hostinger/assets/` - Should match source always

**Only safe to change:**
- ✅ `src/App.js` - When adding features/fixing bugs
- ✅ `src/assets/cataloges/` - When adding new products/images
- ✅ `package.json` - When adding dependencies (with caution)

---

## 🚀 Deployment

**When ready to deploy:**
```bash
# Use this exact command
scp -r build_hostinger/* your-username@nekxuz.in:/home/your-username/public_html/
```

**Verify on live site:**
- Homepage loads with all products
- Images display correctly
- All buttons and features work
- No design differences from master

---

## 📞 Important Reminders

1. **Always keep MASTER_PRODUCTION_BUILD folder** - Don't delete it
2. **Use it as reference** - Compare against it before deploying
3. **Never manually edit static files** - Rebuild from src/App.js instead
4. **Backup before big changes** - Copy build_hostinger before testing
5. **Version control your changes** - Git commit your src/ changes

---

**MASTER BUILD STATUS**: 🔒 **LOCKED & FINAL**  
**Location**: `/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/MASTER_PRODUCTION_BUILD/`  
**Last Verified**: 6 March 2026  
**Design**: ✅ APPROVED & PRODUCTION READY
