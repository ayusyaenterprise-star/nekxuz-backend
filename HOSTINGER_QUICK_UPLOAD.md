# 🚀 UPLOAD TO HOSTINGER - QUICK REFERENCE

## ⚡ 5-Minute Cheat Sheet

```
STEP 1: Get FTP credentials from Hostinger
STEP 2: Download FileZilla
STEP 3: Connect to Hostinger FTP
STEP 4: Upload /build/ folder to /public_html/
STEP 5: Test at https://nekxuz.in
```

---

## 📍 File Locations

**Your build folder:**
```
/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/build/
```

**Upload destination (Hostinger):**
```
/public_html/
```

---

## 🔐 FTP Details Format

```
Host:     ftp.yourdomain.com
User:     [from Hostinger]
Pass:     [from Hostinger]
Port:     21
Path:     /public_html/
```

---

## 📋 What to Upload

Select ALL files in your `/build/` folder:
- index.html
- favicon.ico
- manifest.json
- assets/ (entire folder)
- static/ (entire folder)
- test_checkout.html
- asset-manifest.json

---

## ✅ Success Indicators

After upload, you should see:
- https://nekxuz.in loads ✅
- Products visible ✅
- No console errors ✅
- Images load ✅
- Styles look right ✅

---

## 🧪 API Connection Test

In browser console (Cmd+Option+J):

```javascript
fetch('https://nekxuz-backend.onrender.com/api/stock')
  .then(r => r.json())
  .then(d => console.log('✅', d))
  .catch(e => console.error('❌', e.message))
```

Should log data, not error.

---

## 📞 Troubleshooting Quick Links

| Issue | Fix |
|-------|-----|
| "Cannot GET /" | index.html not in public_html root |
| Styles broken | CSS files failing to load (404 errors) |
| Images missing | /assets/ folder not uploaded |
| API fails | Backend not running or CORS issue |
| Slow upload | Your internet connection speed |

---

## 🎯 Timeline

- Get credentials: 2 minutes
- Download FileZilla: 3 minutes
- Connect & upload: 5-10 minutes
- Test website: 2 minutes
- **Total: 15 minutes** ⚡

---

## 🎉 When Done

✅ Frontend: https://nekxuz.in
✅ Backend: https://nekxuz-backend.onrender.com
✅ Both working together
✅ Ready for users!

---

**Let me know when you start uploading!** 🚀
