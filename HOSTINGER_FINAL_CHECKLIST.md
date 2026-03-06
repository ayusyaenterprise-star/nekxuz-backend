# 🚀 NEKXUZ HOSTINGER DEPLOYMENT - FINAL CHECKLIST

## 📦 Backup Files Ready
✅ **Nekxuz-hostinger-deploy.tar.gz** (27MB) - For Linux/cPanel
✅ **Nekxuz-hostinger-deploy.zip** (27MB) - For Windows/Mac

**Location:** `/Users/ayushgupta/Documents/untitled folder/Nekxuz copy/`

---

## 📋 STEP-BY-STEP HOSTINGER UPLOAD

### Step 1: Login to Hostinger
- Go to: https://hpanel.hostinger.com/
- Login with your credentials
- Select your domain

### Step 2: Upload Backup File
1. Go to **File Manager** (or **Files**)
2. Navigate to **public_html** folder
3. Click **Upload**
4. Select: `Nekxuz-hostinger-deploy.zip` OR `Nekxuz-hostinger-deploy.tar.gz`
5. Upload and wait for completion

### Step 3: Extract Archive
1. Right-click on uploaded file
2. Select **Extract** 
3. Choose destination: **public_html/**
4. Wait for extraction to complete

### Step 4: Setup Node.js Application
1. Go to **cPanel** → **Node.js Manager** (or **Node.js Applications**)
2. Click **Create Node.js Application**
3. Fill in:
   - **Node.js version**: 18.x or 20.x LTS
   - **Application root**: `/home/username/public_html/deploy`
   - **Application startup file**: `server.js`
   - **Application URL**: yourdomainname.com
4. Click **Create** and wait 2-3 minutes

### Step 5: Configure Environment Variables
1. Go to **File Manager** → **public_html/deploy/**
2. Find and open `.env` file
3. Update these values:
   ```
   PORT=3002
   RAZORPAY_KEY_ID=rzp_test_xxxxx (your key)
   RAZORPAY_KEY_SECRET=xxxxxxx (your secret)
   SHIPROCKET_EMAIL=your@email.com
   SHIPROCKET_PASSWORD=your_password
   ```
4. Save file

### Step 6: Verify Installation
1. Wait 3-5 minutes for Node.js to start
2. Open your domain: `https://yourdomain.com`
3. Should see Nekxuz website
4. Test: Add product → checkout → payment

### Step 7: Enable HTTPS
1. Go to **SSL Certificates** in Hostinger
2. Install free Let's Encrypt SSL
3. Force HTTPS in settings

---

## 🔐 IMPORTANT SECURITY STEPS

⚠️ **DO NOT SKIP THESE:**

1. **Set File Permissions**
   ```
   Folders: 755
   Files: 644
   ```
   (Hostinger usually does this automatically)

2. **Keep .env Secret**
   - Never share .env file
   - Never commit to GitHub
   - Only on server

3. **Enable Firewall**
   - Go to Security → Firewall
   - Enable DDoS protection

4. **Regular Backups**
   - Setup auto-backups in Hostinger
   - Backup weekly to local machine

---

## 🧪 TESTING CHECKLIST

After deployment, test these:

- [ ] Website loads at your domain
- [ ] Add product to cart
- [ ] Proceed to checkout
- [ ] Complete Razorpay test payment (Use: 4111 1111 1111 1111)
- [ ] Success screen appears
- [ ] Download invoice button works
- [ ] Track order button works
- [ ] Check email for payment confirmation

---

## 📊 DEPLOYED FILES

Inside `deploy/` folder you'll find:

```
deploy/
├── server.js              (43KB) - Main backend
├── shiprocket.js          (13KB) - Shipping integration
├── package.json           (0.7KB) - Dependencies (optimized)
├── .env                   (0.3KB) - Configuration
├── start.sh               (0.1KB) - Startup script
├── build/                 (2MB) - React frontend
│   ├── index.html
│   ├── static/
│   │   ├── css/
│   │   └── js/
│   └── assets/
│       └── (product images)
└── public/                (2MB) - Same as build/
```

---

## 🆘 TROUBLESHOOTING

### Issue: "Invalid project structure"
**Solution:** Extract to `public_html/` and ensure `server.js` is there

### Issue: "Node app won't start"
**Solution:** 
- Check package.json syntax
- Verify .env file exists
- Check permissions (755)

### Issue: "Blank page after payment"
**Solution:**
- Check browser console (F12)
- Verify RAZORPAY keys in .env
- Restart Node app in Hostinger

### Issue: "Database errors"
**Solution:**
- Ensure write permissions on deploy folder
- dev.sqlite will auto-create

### Issue: "Images not loading"
**Solution:**
- Check if assets folder exists in build/
- Verify image paths are relative

---

## 💡 TIPS

✅ Keep local backup of `.env` in secure location
✅ Note down your Hostinger support ticket number
✅ Enable email notifications for deployments
✅ Set up uptime monitoring
✅ Keep Node.js version updated

---

## ✨ YOU'RE READY!

Your Nekxuz B2B platform is ready for production:

✅ Full e-commerce functionality
✅ Payment processing (Razorpay)
✅ Shipping integration (Shiprocket)
✅ Invoice generation
✅ Order tracking
✅ Mobile responsive
✅ SSL/HTTPS ready
✅ Production optimized

---

## 📞 SUPPORT CONTACTS

- **Hostinger Support**: https://support.hostinger.com/
- **Razorpay Support**: https://razorpay.com/support/
- **Shiprocket Help**: https://www.shiprocket.in/support/

---

**Last Updated:** March 2, 2026
**Version:** 1.0.0 Production Ready
**Status:** ✅ READY FOR DEPLOYMENT
