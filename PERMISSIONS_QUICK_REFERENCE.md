# 🎯 SET PERMISSIONS ON HOSTINGER - QUICK VISUAL REFERENCE

## The 3 Permission Levels You Need

| What | Permission | Meaning |
|-----|-----------|---------|
| Folders (static/, assets/) | **755** | Owner: read+write+execute, Others: read+execute |
| Files (.js, .css, images) | **644** | Owner: read+write, Others: read only |

---

## VISUAL STEP-BY-STEP

### Step 1️⃣ - Go to Hostinger File Manager

```
https://hpanel.hostinger.com
          ↓
    [Login]
          ↓
  Select your domain
          ↓
   [File Manager]
          ↓
Navigate to: public_html/
```

---

### Step 2️⃣ - Find the static Folder

```
You're in: public_html/

You should see:
├── index.html
├── favicon.ico
├── static/          ← THIS ONE
├── assets/
└── other files...
```

---

### Step 3️⃣ - Right-Click on "static" Folder

```
[static folder icon]
        ↓ RIGHT-CLICK
        ↓
    [Context Menu Appears]
    ├── Download
    ├── Rename
    ├── Delete
    ├── Permissions  ← CLICK THIS
    └── ...
```

---

### Step 4️⃣ - Click "Permissions"

```
[Permissions Dialog Opens]

You'll see checkboxes like:

Owner (User):
☐ Read    ☐ Write    ☐ Execute

Group:
☐ Read    ☐ Write    ☐ Execute

Other:
☐ Read    ☐ Write    ☐ Execute

OR a field showing: 755, 644, 777, etc.
```

---

### Step 5️⃣ - Set to 755

**For FOLDERS like static/, assets/, etc:**

Check these boxes:

```
Owner (User):
✅ Read     ✅ Write     ✅ Execute

Group:
✅ Read     ☐ Write     ✅ Execute

Other:
✅ Read     ☐ Write     ✅ Execute
```

**OR just enter: 755**

---

### Step 6️⃣ - Check "Apply Recursively"

Look for and **CHECK** this option:

```
☑ Apply recursively to all files/folders
  (or "Apply to contents" or "Apply to all")
```

**THIS IS IMPORTANT!** It applies to all files inside.

---

### Step 7️⃣ - Click Save/OK/Apply

```
[Permission Dialog]
          ↓
    [Save Button]
          ↓
   Dialog closes
          ↓
    Permissions applied! ✅
```

---

### Step 8️⃣ - Repeat for Other Folders

Do the SAME thing for:

1. **`assets/`** → 755 with "Apply recursively"
2. **`static/js/`** (if visible) → 755 with "Apply recursively"
3. **`static/css/`** (if visible) → 755 with "Apply recursively"

---

### Step 9️⃣ - Set Files to 644

Now find individual files and set them to **644**:

Navigate to: `static/js/`

Find: `main.57af96d8.js`

Right-click → Permissions → Set to **644** (without "Apply recursively")

```
Owner (User):
✅ Read     ✅ Write     ☐ Execute

Group:
✅ Read     ☐ Write     ☐ Execute

Other:
✅ Read     ☐ Write     ☐ Execute
```

---

## 🧮 Permission Numbers Explained

```
755 = 7(owner) 5(group) 5(other)

7 = Read(4) + Write(2) + Execute(1) = 4+2+1 = 7
5 = Read(4) + Execute(1) = 4+1 = 5
5 = Read(4) + Execute(1) = 4+1 = 5

644 = 6(owner) 4(group) 4(other)

6 = Read(4) + Write(2) = 4+2 = 6
4 = Read(4) = 4
4 = Read(4) = 4
```

---

## ✅ What to Check After Setting

**In File Manager, right-click files and check Permissions:**

```
static/ folder       → Should show: 755 ✅
static/js/           → Should show: 755 ✅
main.57af96d8.js     → Should show: 644 ✅
main.a915abc1.css    → Should show: 644 ✅
assets/              → Should show: 755 ✅
```

---

## 🧪 Test if It Worked

After setting permissions:

```bash
# In your terminal, run:
curl -I "https://nekxuz.in/static/js/main.57af96d8.js"

# BEFORE (wrong):
# HTTP/1.1 403 Forbidden ❌

# AFTER (correct):
# HTTP/1.1 200 OK ✅
```

---

## 🆘 Common Issues

### Issue: "I don't see a Permissions option"

**Try:**
- Right-click again, look more carefully
- Or click "Properties" then find "Permissions" tab
- Or look for "Attributes" or "File Properties"

### Issue: "The dialog looks totally different"

**Most interfaces show:**
- Octal numbers (755, 644)
- Checkboxes (as shown above)
- Dropdown menus

All work the same way - just get to 755 and 644.

### Issue: "Still getting 403 after setting permissions"

1. Clear browser cache (Cmd+Shift+Delete)
2. Hard refresh (Cmd+Shift+R)
3. Wait 5-10 minutes (Hostinger cache)
4. Contact Hostinger support

---

## 📱 Using Mobile/Phone

If on mobile:

1. Go to: https://hpanel.hostinger.com
2. May need to request "Desktop View"
3. Same steps as above
4. OR Use FileZilla (FTP) instead

---

## 🎯 Summary

```
STEP 1: Right-click folder
STEP 2: Click "Permissions"
STEP 3: Set to 755 (folders) or 644 (files)
STEP 4: Check "Apply recursively" for folders
STEP 5: Click Save/OK
STEP 6: Repeat for all folders and files
STEP 7: Test website - orders appear! ✅
```

---

## Alternative: Use FTP

If Hostinger File Manager is confusing:

1. Download FileZilla: https://filezilla-project.org/
2. Connect to Hostinger FTP
3. Right-click files → File Attributes
4. Set to 755 or 644

---

**You've got this! Set those permissions and your orders will appear!** 🚀

Questions? Contact Hostinger support - they're very helpful!
