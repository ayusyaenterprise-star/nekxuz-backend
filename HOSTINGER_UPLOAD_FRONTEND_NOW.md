# ✅ HOSTINGER FRONTEND UPLOAD - Step-by-Step (2026)

## 🎉 Your Frontend is Built and Ready!

```
✅ React build complete
✅ All files optimized
✅ Ready to upload to Hostinger
```

---

## 📁 What You're Uploading

Your `/build/` folder contains:

```
build/
├── index.html               ← Main HTML file
├── favicon.ico              ← Browser tab icon
├── manifest.json            ← Web app config
├── asset-manifest.json      ← File reference
├── test_checkout.html       ← Test page (optional)
├── assets/                  ← Product images
│   └── cataloges/          ← Your product photos
└── static/                  ← React code & styles
    ├── css/                ← Compiled CSS (8.81 kB)
    ├── js/                 ← Compiled React (199.13 kB)
    └── 453.*.chunk.js      ← Optional components
```

---

## 🚀 Quick Upload (5 steps)

### **1. Get FTP Credentials**

Open Hostinger control panel:
- Go to: **https://hpanel.hostinger.com**
- Find: **Files → FTP Accounts**
- Copy:
  - **Host:** ftp.yourdomain.com
  - **Username:** your-username
  - **Password:** your-password

---

### **2. Download FileZilla**

- Download: **https://filezilla-project.org/**
- Install it
- Open FileZilla

---

### **3. Connect to Hostinger**

In FileZilla:

1. **Click:** File → Site Manager (Ctrl+S)
2. **New Site:**
   - Host: ftp.yourdomain.com
   - Username: (from Step 1)
   - Password: (from Step 1)
   - Port: 21
3. **Click:** Connect

**You should see your server files!** ✅

---

### **4. Upload Build Folder**

1. **Left side** (your computer):
   - Go to: `/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/build/`
   - Select ALL files (Cmd+A)

2. **Right side** (Hostinger):
   - Open: `/public_html/`
   - **Delete old files first** (if any)

3. **Drag files from left to right**
   - OR: Right-click → Upload

4. **Wait for completion**
   - Watch progress bar
   - Should take 2-3 minutes

---

### **5. Verify Upload**

After upload:

1. **Right-click → Refresh** (or F5)
2. **You should see:**
   - ✅ index.html
   - ✅ favicon.ico
   - ✅ manifest.json
   - ✅ assets/ folder
   - ✅ static/ folder

**If you see these → SUCCESS!** 🎉

---

## 🌐 Test Your Website

Open browser:
- **Visit:** https://nekxuz.in

**You should see:**
- ✅ Website loads
- ✅ Products visible
- ✅ Images load
- ✅ No errors
- ✅ "Add to Cart" buttons work

---

## 🔒 Enable HTTPS (SSL)

Your site should be HTTPS (secure).

In Hostinger:
1. Go to: **SSL/TLS**
2. Look for: **Free SSL** or **Let's Encrypt**
3. Click: **Enable**
4. Wait 10-15 minutes
5. Your site is now **https://nekxuz.in** ✅

---

## 🔧 If Something Goes Wrong

### **Error: "Cannot GET /"**
- Solution: Make sure **index.html is in public_html root**
- Not in a subfolder!

### **Styles look broken**
- Solution: Check console (F12) for CSS 404 errors
- Re-upload /static/ folder

### **Images don't show**
- Solution: Check console for image 404 errors
- Make sure /assets/ folder is uploaded

### **Products don't load**
- Solution: Open console (Cmd+Option+J)
- Run this test:
  ```javascript
  fetch('https://nekxuz-backend.onrender.com/api/stock')
    .then(r => r.json())
    .then(d => console.log('✅ Success:', d))
    .catch(e => console.error('❌ Error:', e))
  ```
- Should show stock data

---

## ✅ Final Checklist

Before declaring success:

- [ ] Website loads at https://nekxuz.in
- [ ] No console errors (F12)
- [ ] Products visible
- [ ] Images load
- [ ] Can add to cart
- [ ] Checkout page loads
- [ ] API calls work
- [ ] HTTPS is active

---

## 📊 Expected Size & Timeline

**File sizes:**
- CSS: 8.81 kB
- JavaScript: 199.13 kB
- Images: ~5-10 MB
- **Total:** ~15-20 MB

**Upload time:**
- At 10 Mbps: 2-3 minutes
- At 5 Mbps: 5-6 minutes
- At 1 Mbps: 20+ minutes

---

## 🎯 Your API Endpoint

Make sure your code uses:
```
https://nekxuz-backend.onrender.com/api/...
```

NOT localhost! ✅

---

## 🎉 You're LIVE!

Once upload completes and you test successfully:

✅ **Backend:** https://nekxuz-backend.onrender.com (Render)
✅ **Frontend:** https://nekxuz.in (Hostinger)
✅ **Database:** PostgreSQL (Render)
✅ **Payments:** Razorpay (integrated)
✅ **Shipping:** Shiprocket (integrated)

---

## 📋 Upload Commands (Alternative)

If you want to use command line instead:

```bash
# Connect via command line FTP
ftp ftp.yourdomain.com

# Upload entire build folder
put -r /Users/ayushgupta/Documents/untitled\ folder/Nekxuz\ copy/build/* /public_html/

# List to verify
ls /public_html/

# Exit
bye
```

---

## 🆘 Need Help?

Tell me:
1. Are you stuck on which step?
2. What error do you see?
3. Can you connect to FTP?
4. Can you see index.html after upload?

I'm here to help! 💚

---

**Next step:** Download FileZilla and try uploading! 🚀
