# 🔧 FIX HOSTINGER FILES - SIMPLE STEP BY STEP

## The Problem

Your website files have **permission issues** preventing JavaScript from loading.

```
Website tries to load: /static/js/main.js
Hostinger says: "403 Forbidden - You can't access this!"
Result: Website shows blank/broken
```

---

## The Solution (5 Minutes)

### Step 1: Open Hostinger File Manager

1. Go to: **https://hpanel.hostinger.com**
2. **Login** with your password
3. Click your **domain** (nekxuz.in)
4. Click **File Manager** button
5. **Wait** for it to load

---

### Step 2: Navigate to Correct Location

1. You should see a folder called `public_html`
2. **Double-click** to open it
3. You should see:
   - `index.html` ✅
   - `static/` folder ✅
   - `assets/` folder ✅
   - Other files...

If you DON'T see these files:
- You're in the wrong folder!
- Go back and find `public_html`

---

### Step 3: Delete Old Files (IMPORTANT)

1. **Select ALL files** in `public_html`
   - Ctrl+A (Windows) or Cmd+A (Mac)

2. **Right-click** → Delete

3. **Empty the trash**
   - Look for trash icon at bottom
   - Right-click → Empty Trash

4. **Wait** for deletion to complete
   - Should be empty or mostly empty now

---

### Step 4: Upload New Build

**Option A: Using File Manager Upload**

1. Right-click in empty `public_html`
2. Click **Upload**
3. Select these files from `updated_build/` folder:
   - ✅ `index.html`
   - ✅ `favicon.ico`
   - ✅ `manifest.json`
   - ✅ `asset-manifest.json`

4. Then upload these **FOLDERS**:
   - ✅ `static/` (entire folder)
   - ✅ `assets/` (entire folder)

5. **Wait** for all uploads to complete

**Option B: Drag & Drop**

1. Get the `updated_build/` folder on your computer
2. Go to Hostinger File Manager (public_html folder)
3. **Drag** all files from updated_build
4. **Drop** them in File Manager
5. **Wait** for upload

---

### Step 5: Verify Files Uploaded

1. **Refresh** File Manager (F5 or browser refresh)
2. You should see:
   ```
   public_html/
   ├── index.html ✅
   ├── favicon.ico ✅
   ├── manifest.json ✅
   ├── asset-manifest.json ✅
   ├── static/ ✅
   │   ├── js/
   │   ├── css/
   │   └── media/
   └── assets/ ✅
   ```

If missing any files, go back to Step 4 and upload them.

---

### Step 6: Fix File Permissions (IMPORTANT!)

**This is the KEY to fixing 403 errors!**

1. **Right-click `static` folder**
2. Click **Permissions**
3. Change to: **755**
4. Click **Apply recursively** (if available)
5. Click **Save** or **OK**

**Repeat for each folder:**
- `static/` → 755
- `static/js/` → 755
- `static/css/` → 755
- `static/media/` → 755
- `assets/` → 755

**Files should be 644:**
- All `.js` files → 644
- All `.css` files → 644
- All image files → 644

---

### Step 7: Test Website

1. Go to: **https://nekxuz.in**
2. **Wait** 10 seconds (might be loading)
3. **Refresh** (F5 or Cmd+R)
4. **Hard refresh** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
5. You should see the website! ✅

---

### Step 8: Check Orders

1. **Log in** with your email
2. Click **My Orders** tab
3. **See 4 orders!** 🎉

---

## 🧪 Test with Terminal

If website still doesn't work, test:

```bash
# Test if files are accessible now
curl -I "https://nekxuz.in/static/js/main.57af96d8.js"

# Should return:
# HTTP/1.1 200 OK
# NOT 403 Forbidden
```

---

## ✅ Checklist

- [ ] Open Hostinger File Manager
- [ ] Navigate to public_html
- [ ] Delete old files
- [ ] Upload new files from updated_build/
- [ ] Verify all files uploaded
- [ ] Set folder permissions to 755
- [ ] Set file permissions to 644
- [ ] Test website loads
- [ ] Hard refresh
- [ ] Log in
- [ ] See 4 orders! ✅

---

## If Still Not Working

1. **Wait 10 minutes** - Hostinger cache
2. **Clear browser cache** - Cmd+Shift+Delete
3. **Check console errors** - F12 → Console tab
4. **Try different browser** - Chrome, Firefox, Safari

If absolutely nothing works:
- Contact Hostinger support
- Show them screenshot of permission settings
- Ask them to verify file accessibility

---

## 🎯 Quick Summary

```
Problem:  Static files returning 403 Forbidden
Cause:    Wrong permissions or files not uploaded
Solution: Re-upload files with correct permissions (755 folders, 644 files)
Time:     5 minutes
Result:   Orders appear! ✅
```

---

**START NOW!** Go to Hostinger File Manager. ⚡

This will definitely fix it! 💯
