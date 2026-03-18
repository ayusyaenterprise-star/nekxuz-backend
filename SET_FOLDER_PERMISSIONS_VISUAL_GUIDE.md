# 📋 HOW TO SET FOLDER PERMISSIONS ON HOSTINGER - VISUAL GUIDE

## Step 1: Login to Hostinger

1. Go to: **https://hpanel.hostinger.com**
2. **Enter your email**
3. **Enter your password**
4. Click **Login**

---

## Step 2: Open File Manager

1. Click your **domain name** (nekxuz.in or nekxuz.shop)
2. Look for **File Manager** button/option
3. Click it
4. **Wait** for File Manager to load (usually 5-10 seconds)

---

## Step 3: Navigate to public_html

You should see a list of folders. Find:
- `public_html` folder

**Double-click** on `public_html` to open it

You should now see files like:
- `index.html`
- `static/`
- `assets/`
- etc.

---

## Step 4: Set Permissions for "static" Folder

### Find the static folder:

In the `public_html` folder, look for the **`static`** folder.

### Right-click on it:

1. **Right-click** on the `static` folder
2. A menu appears
3. Look for **"Permissions"** or **"Change Permissions"**
4. Click it

---

## Step 5: Change Permission Values

A dialog box will appear with checkboxes or numbers.

### You'll see something like:

```
Owner (User):
☐ Read     ☐ Write    ☐ Execute

Group:
☐ Read     ☐ Write    ☐ Execute

Other:
☐ Read     ☐ Write    ☐ Execute
```

### Set it to this (755):

**Owner (User):**
- ✅ Read (checked)
- ✅ Write (checked)
- ✅ Execute (checked)

**Group:**
- ✅ Read (checked)
- ☐ Write (unchecked)
- ✅ Execute (checked)

**Other:**
- ✅ Read (checked)
- ☐ Write (unchecked)
- ✅ Execute (checked)

### OR if you see a number field:

Enter: **755**

---

## Step 6: Apply Recursively (IMPORTANT!)

After setting permissions, look for:
- **"Apply recursively"** checkbox
- OR **"Apply to all files in this folder"** option

**Make sure to CHECK this box!** ✅

This applies the permissions to ALL files inside the folder.

---

## Step 7: Click Save/OK

Click:
- **"Save"** OR
- **"OK"** OR  
- **"Apply"**

The dialog should close.

---

## Step 8: Repeat for other folders

Do the same for:
- **`assets/`** → 755
- **`static/js/`** → 755 (if it exists)
- **`static/css/`** → 755 (if it exists)
- **`static/media/`** → 755 (if it exists)

---

## Step 9: Set File Permissions to 644

Now you need to set **individual files** to **644**:

### Find the static folder:

1. **Double-click** `static` folder
2. **Double-click** `js` folder
3. Find the file: **`main.57af96d8.js`**

### Right-click on it:

1. **Right-click** on the file
2. Click **"Permissions"**

### Set to 644:

```
Owner (User):
✅ Read
✅ Write
☐ Execute

Group:
✅ Read
☐ Write
☐ Execute

Other:
✅ Read
☐ Write
☐ Execute
```

OR enter: **644**

### Click Save/OK

---

## Step 10: Repeat for CSS Files

Go back and repeat for:
- **`static/css/main.a915abc1.css`** → 644

---

## Step 11: Verify Changes

1. Go back to `public_html` folder
2. Right-click `static` folder
3. Click **"Permissions"**
4. Should show: **755**
5. Close dialog

---

## Step 12: Test Website

1. Go to: **https://nekxuz.in**
2. **Hard refresh:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Website should load now! ✅

---

## If You See Different Interface

Hostinger sometimes shows permissions differently:

### Option A: Octal Numbers
- Just enter: **755** for folders
- Just enter: **644** for files

### Option B: Checkboxes
- Follow the checkboxes shown above

### Option C: Dropdown
- Select: **755** from dropdown for folders
- Select: **644** from dropdown for files

---

## Troubleshooting

### "I can't find Permissions option"

**Try:**
1. Right-click the folder again
2. Look for "Properties" or "Folder Properties"
3. Find "Permissions" tab inside

### "The dialog looks different"

**Most common permission systems:**
- Octal: Enter `755` or `644`
- Checkboxes: Use the guide above
- Dropdown: Select from list

### "After changing, still getting 403 error"

1. **Wait 5 minutes** - Hostinger cache
2. **Hard refresh** - Cmd+Shift+R
3. **Clear browser cache** - Cmd+Shift+Delete
4. **Contact Hostinger** - Ask them to verify permissions

---

## Permission Meanings

```
755 (for folders):
7 = Owner: read, write, execute
5 = Group: read, execute
5 = Others: read, execute
Result: Everyone can read/access, only owner can modify

644 (for files):
6 = Owner: read, write
4 = Group: read only
4 = Others: read only
Result: Everyone can read, only owner can modify
```

---

## What You're Trying to Fix

```
BEFORE (403 error):
Folder: static/ (permissions: 600 or wrong)
File: main.js (permissions: 600 or wrong)
Result: Web server can't read files → 403 Forbidden

AFTER (200 OK):
Folder: static/ (permissions: 755)
File: main.js (permissions: 644)
Result: Web server can read files → 200 OK ✅
```

---

## Quick Checklist

- [ ] Login to Hostinger
- [ ] Open File Manager
- [ ] Navigate to public_html
- [ ] Right-click `static` folder
- [ ] Set permissions to **755**
- [ ] Check "Apply recursively"
- [ ] Save/OK
- [ ] Right-click CSS file
- [ ] Set permissions to **644**
- [ ] Save/OK
- [ ] Right-click JS file
- [ ] Set permissions to **644**
- [ ] Save/OK
- [ ] Test website
- [ ] Hard refresh (Cmd+Shift+R)
- [ ] Orders appear! ✅

---

## Still Confused?

**Contact Hostinger Support:**

1. Go to: https://hpanel.hostinger.com
2. Click **Support** or **Help**
3. Message them: "How do I set folder permissions to 755 and file permissions to 644 in File Manager?"
4. They'll help you step-by-step

---

**YOU'VE GOT THIS!** 💪

Once permissions are set correctly, your website will work perfectly! 🎉
