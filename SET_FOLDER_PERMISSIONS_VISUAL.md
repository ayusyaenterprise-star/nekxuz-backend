# 📁 HOW TO SET FOLDER PERMISSIONS ON HOSTINGER - VISUAL GUIDE

## Step-by-Step with Screenshots Description

### Step 1: Open Hostinger File Manager

1. Go to: **https://hpanel.hostinger.com**
2. **Log in** with your email and password
3. You see your dashboard with domains
4. Click on **your domain** (nekxuz.in or nekxuz.shop)
5. Click the **"File Manager"** button (usually blue button)

```
┌─────────────────────────────────────┐
│  Hostinger Panel                    │
│  ─────────────────────────────────  │
│  Your Domains:                      │
│  ├─ nekxuz.in      [File Manager]   │ ← CLICK HERE
│  └─ nekxuz.shop    [File Manager]   │
└─────────────────────────────────────┘
```

---

### Step 2: Navigate to public_html

After File Manager opens:

1. You see a folder structure
2. **Double-click** on `public_html` folder
3. You should see:
   ```
   public_html/
   ├── index.html
   ├── favicon.ico
   ├── manifest.json
   ├── static/          ← We need to set permissions for this
   ├── assets/          ← And this
   └── other files
   ```

```
┌────────────────────────────────────────┐
│  File Manager                          │
│  ────────────────────────────────────  │
│  Location: /public_html                │
│                                        │
│  📁 index.html                         │
│  📁 favicon.ico                        │
│  📁 manifest.json                      │
│  📁 static/          ← TARGET THIS     │
│  📁 assets/          ← AND THIS        │
│  📁 other files...                     │
└────────────────────────────────────────┘
```

---

### Step 3: Right-Click on `static/` Folder

1. Find the **`static/` folder**
2. **Right-click** on it (or click three dots if available)
3. A menu appears with options like:
   - Copy
   - Cut
   - Delete
   - Rename
   - **Permissions** ← CLICK THIS
   - Properties

```
┌────────────────────────────────────────┐
│  📁 static/                            │
│  │                                     │
│  └─ Right-click menu:                  │
│     ├─ Copy                            │
│     ├─ Cut                             │
│     ├─ Delete                          │
│     ├─ Rename                          │
│     ├─ Permissions  ← CLICK HERE       │
│     └─ Properties                      │
└────────────────────────────────────────┘
```

---

### Step 4: Change Permissions to 755

A popup window appears:

```
┌──────────────────────────────────┐
│  Permissions for: static/        │
│  ────────────────────────────────│
│                                  │
│  Current permissions: 755        │
│  (might show 644 or other)       │
│                                  │
│  Owner (User):        ☑ Read     │
│                       ☑ Write    │
│                       ☑ Execute  │
│  ─────────────────────────────── │
│  Group:               ☑ Read     │
│                       ☐ Write    │
│                       ☑ Execute  │
│  ─────────────────────────────── │
│  Others:              ☑ Read     │
│                       ☐ Write    │
│                       ☑ Execute  │
│  ─────────────────────────────── │
│                                  │
│  [✓] Apply recursively           │
│      (important! applies to      │
│       all subfolders)            │
│                                  │
│           [SAVE]  [CANCEL]       │
└──────────────────────────────────┘
```

**What each number means:**
```
755 means:
├─ 7 (Owner):  Read ✓ Write ✓ Execute ✓
├─ 5 (Group):  Read ✓ Write ✗ Execute ✓
└─ 5 (Others): Read ✓ Write ✗ Execute ✓

644 means (FOR FILES):
├─ 6 (Owner):  Read ✓ Write ✓ Execute ✗
├─ 4 (Group):  Read ✓ Write ✗ Execute ✗
└─ 4 (Others): Read ✓ Write ✗ Execute ✗
```

**Steps to set 755:**

1. **Look for text field** showing current permissions
2. **Clear it** and type: **755**
3. OR **manually check boxes:**
   - Owner: Read ✓, Write ✓, Execute ✓
   - Group: Read ✓, Write ✗, Execute ✓
   - Others: Read ✓, Write ✗, Execute ✓

4. **IMPORTANT:** Check the box: ☑ **"Apply recursively"**
   - This applies permissions to ALL files inside the folder

5. Click **[SAVE]** or **[OK]**

---

### Step 5: Wait for Permission Change

```
┌────────────────────────────────────┐
│  Processing...                     │
│  Applying permissions...           │
│  [████████████████░░░░░] 85%       │
│                                    │
│  This may take a few seconds       │
│  for large folders                 │
└────────────────────────────────────┘
```

Wait until it shows **"Success"** or **"Permissions updated"**

---

### Step 6: Repeat for `assets/` Folder

1. **Right-click** on the `assets/` folder
2. Click **Permissions**
3. Set to **755**
4. Check ☑ **"Apply recursively"**
5. Click **SAVE**
6. Wait for success

---

### Step 7: Set Individual File Permissions (644)

Now go into folders and set FILE permissions to 644:

**For JavaScript files:**

1. **Double-click** to open `static/` folder
2. **Double-click** to open `js/` folder
3. You see files like: `main.57af96d8.js`
4. **Right-click** on the file
5. Click **Permissions**
6. Set to: **644**
7. Click **SAVE**
8. Repeat for other `.js` files

**For CSS files:**

1. Go back: Click "static" in navigation
2. **Double-click** to open `css/` folder
3. You see files like: `main.a915abc1.css`
4. **Right-click** on the file
5. Click **Permissions**
6. Set to: **644**
7. Click **SAVE**

---

## Quick Reference

### Folder Permissions (755)

```
Folders that need 755:
├─ /public_html/static/        → 755 ✓
├─ /public_html/static/js/     → 755 ✓
├─ /public_html/static/css/    → 755 ✓
├─ /public_html/static/media/  → 755 ✓
└─ /public_html/assets/        → 755 ✓
```

### File Permissions (644)

```
Files that need 644:
├─ /public_html/static/js/main.*.js       → 644 ✓
├─ /public_html/static/css/main.*.css     → 644 ✓
├─ /public_html/index.html                → 644 ✓
├─ /public_html/favicon.ico               → 644 ✓
└─ All other files                        → 644 ✓
```

---

## ⚠️ If You Don't See "Permissions" Option

**Alternative Method - Direct Text Entry:**

Some File Managers show a text field instead of checkboxes:

```
┌──────────────────────────────────┐
│  Permissions for: static/        │
│  ────────────────────────────────│
│                                  │
│  Permission code: [755      ]    │
│  (just type the number)          │
│                                  │
│  ☑ Apply recursively             │
│                                  │
│         [SAVE]  [CANCEL]         │
└──────────────────────────────────┘
```

Just type **755** in the field and save!

---

## 🧪 How to Verify Permissions are Set

After setting permissions:

1. Go back to terminal
2. Run this command:

```bash
curl -I "https://nekxuz.in/static/js/main.57af96d8.js"
```

**Before fix:**
```
HTTP/1.1 403 Forbidden  ❌
Access Denied
```

**After fix:**
```
HTTP/1.1 200 OK  ✅
```

If you see **200 OK**, permissions are fixed! ✓

---

## 📋 Complete Checklist

- [ ] Open https://hpanel.hostinger.com
- [ ] Log in
- [ ] Click your domain → File Manager
- [ ] Navigate to public_html
- [ ] Right-click `static/` → Permissions → 755
- [ ] Check "Apply recursively"
- [ ] Save
- [ ] Right-click `assets/` → Permissions → 755
- [ ] Check "Apply recursively"
- [ ] Save
- [ ] Go into `static/js/` → Set each file to 644
- [ ] Go into `static/css/` → Set each file to 644
- [ ] Test with curl command
- [ ] See "200 OK" ✓
- [ ] Hard refresh website
- [ ] See orders! 🎉

---

## 🆘 Troubleshooting

**Problem: "Permission Denied" when trying to change permissions**
- Solution: You might not have admin access
- Contact Hostinger support → ask for file manager permissions

**Problem: Can't find Permissions option**
- Solution: Try right-clicking on a file instead
- Or look for three dots (⋯) menu

**Problem: Changed permissions but still 403**
- Solution: 
  1. Wait 5-10 minutes for server to reload
  2. Try from different browser
  3. Contact Hostinger support

**Problem: Don't know how to find File Manager**
- Solution: From Hostinger panel → Click "Manage" on your domain → File Manager

---

## 💡 Pro Tips

1. **Do ALL folders first (755)** before individual files
2. **Always check "Apply recursively"** for folders
3. **Use "644" only for files**, not folders
4. **755 for folders, 644 for files** - remember this pattern!
5. After changing, **wait 2-3 minutes** before testing

---

**NOW GO SET THOSE PERMISSIONS!** 🚀

Your orders are waiting on the other side of this permission fix!
