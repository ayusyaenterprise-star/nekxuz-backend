# ✅ HOSTINGER DEPLOYMENT CHECKLIST

## 📦 Your Backup is Ready!

You have **2 backup formats** to upload to Hostinger:

### Format Options:
1. **HOSTINGER_BACKUP.zip** (14MB) - Recommended for Hostinger File Manager
2. **HOSTINGER_BACKUP.tar.gz** (14MB) - Recommended for SSH/Linux servers
3. **HOSTINGER_BACKUP/** (Uncompressed folder)

Pick whichever works best for your Hostinger plan!

---

## 🚀 Step-by-Step Deployment

### STEP 1️⃣: Upload Backup to Hostinger

**Option A: Using Hostinger Control Panel (Easiest)**
```
1. Login to hostinger.com
2. Click: Hosting → File Manager
3. Navigate to: public_html
4. Click: Upload
5. Select: HOSTINGER_BACKUP.zip
6. Wait for upload (~1-2 minutes)
7. Right-click zip → Extract
8. Move all files from HOSTINGER_BACKUP/ to public_html/
```

**Option B: Using FTP (Professional)**
```
1. Download FTP details from Hostinger Dashboard
2. Use FileZilla or WinSCP
3. Connect to FTP server
4. Navigate to public_html
5. Upload HOSTINGER_BACKUP.zip
6. Extract on server
```

**Option C: Using SSH (Advanced)**
```bash
sftp your-username@ftp.hostinger.com
cd public_html
put HOSTINGER_BACKUP.zip
quit

# Then SSH in:
ssh your-username@your-domain.com
cd public_html
unzip HOSTINGER_BACKUP.zip
cp -r HOSTINGER_BACKUP/* ./
```

### STEP 2️⃣: Configure Node.js Settings

In Hostinger Control Panel:
```
1. Go to: Hosting
2. Find: Node.js Version
3. Select: 18.x or higher
4. Click: Update
5. Wait for changes to apply (~5 minutes)
```

### STEP 3️⃣: Create .env File

**CRITICAL**: You MUST create this file!

In Hostinger File Manager:
```
1. In public_html/, right-click
2. Create new file: .env
3. Add your credentials:

RAZORPAY_KEY_ID=rpk_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
SHIPROCKET_API_KEY=your_shiprocket_key
SHIPROCKET_CHANNEL_ID=12345
NODE_ENV=production
```

### STEP 4️⃣: Install Dependencies

SSH into your server:
```bash
cd ~/public_html
npm install --production
```

Wait ~2-3 minutes for installation...

### STEP 5️⃣: Start Your Application

**Option A: Automatic (Hostinger usually does this)**
- Just wait a few minutes after npm install
- Hostinger auto-starts Node.js apps

**Option B: Manual Start**
SSH and run:
```bash
npm start
# Or
node server.js
```

### STEP 6️⃣: Connect Your Domain

In Hostinger Dashboard:
```
1. Go to: Domains
2. Select: Your domain
3. Point to: Your Node.js application
4. Wait: 5-10 minutes for DNS propagation
5. Enable: SSL (auto-enabled by Hostinger)
```

### STEP 7️⃣: Test Your Website

Open in browser:
```
https://your-domain.com
```

Should see:
- ✅ Nekxuz homepage loads
- ✅ Products display with images
- ✅ Add to cart works
- ✅ Checkout button visible

---

## 🧪 Testing Checklist

After deployment, test these features:

### Frontend Tests
- [ ] Homepage loads correctly
- [ ] Products display with images
- [ ] Product images load properly
- [ ] Cart counter updates when adding items
- [ ] Mobile view works (open DevTools, toggle mobile)

### Checkout Tests
- [ ] Click product → details page shows
- [ ] Add to cart → modal opens
- [ ] Proceed to checkout → payment page loads
- [ ] Fill shipping details (test data)
- [ ] Click "Proceed to Payment" → Razorpay modal opens

### Payment Tests
- [ ] Razorpay test mode active
- [ ] Use test card: **4111 1111 1111 1111**
- [ ] Any expiry date (future): **MM/YY**
- [ ] Any CVV: **123**
- [ ] Payment completes → success page shows

### Success Page Tests
- [ ] Order ID displayed
- [ ] Payment ID shown
- [ ] Amount correct
- [ ] Tracking ID visible
- [ ] Download invoice button works
- [ ] Invoice PDF downloads correctly

---

## 🔑 Getting Your API Credentials

### Razorpay Setup (5 min)
```
1. Go to: https://razorpay.com
2. Sign up for free account
3. Dashboard → Settings → API Keys
4. Copy: Key ID and Secret
5. Paste into .env file

For testing:
- Use test mode (default)
- Test card: 4111 1111 1111 1111
```

### Shiprocket Setup (15 min)
```
1. Go to: https://www.shiprocket.in
2. Create account (free tier available)
3. Complete: Seller profile
4. Setup: Pickup location
5. Settings → API Key
6. Copy API Key
7. Settings → Channel ID
8. Copy Channel ID
9. Paste both into .env file
```

---

## 🐛 Troubleshooting

### Problem: "Cannot GET /"
**Solution**: 
- Check if server is running: SSH → `npm start`
- Check Node.js version: `node -v` (should be 18+)
- Check .env file exists

### Problem: Page loads but styling broken
**Solution**:
- Check build folder uploaded correctly
- Clear browser cache: Ctrl+Shift+Delete
- Check domain CSS files loading: DevTools → Network tab

### Problem: "Payment failed" or Razorpay doesn't load
**Solution**:
- Verify RAZORPAY_KEY_ID in .env
- Verify RAZORPAY_KEY_SECRET in .env
- Make sure credentials are from test mode (for testing)
- Check browser console for errors: F12 → Console

### Problem: Shipping/Tracking not working
**Solution**:
- Verify SHIPROCKET_API_KEY in .env
- Verify SHIPROCKET_CHANNEL_ID in .env
- Make sure channel is activated in Shiprocket
- Check Shiprocket pickup location is configured

### Problem: Invoices won't download
**Solution**:
- Check server write permissions (usually automatic)
- Check /tmp directory has space
- Check invoices are being created: Look in home directory for .pdf files

---

## 📞 Getting Help

### Hostinger Support
- 24/7 Chat: hostinger.com/support
- Email: support@hostinger.com
- Knowledge Base: hostinger.com/help

### Node.js Issues
- Stack Overflow: https://stackoverflow.com/questions/tagged/node.js
- Node.js Docs: https://nodejs.org/docs

### Payment Issues
- Razorpay Help: https://razorpay.com/docs
- Shiprocket Help: https://www.shiprocket.in/help

---

## 📊 What Gets Uploaded

```
public_html/
├── build/                           # React frontend (17MB)
│   ├── index.html                   # Main page
│   ├── static/js/main.*.js          # React app
│   ├── static/css/main.*.css        # Styling
│   └── assets/                      # Product images
├── server.js                        # Backend server (43KB)
├── shiprocket.js                    # Shipping API (13KB)
├── package.json                     # Dependencies list
├── .env                             # YOUR CONFIG (create this!)
└── stock.json                       # Product inventory
```

**Total Size**: ~17MB (after compression ~14MB)

---

## ✨ Features Included

✅ E-commerce Platform
✅ Product Catalog
✅ Shopping Cart
✅ Mobile Responsive
✅ Razorpay Payment Gateway
✅ Invoice Generation (PDF)
✅ Order Tracking
✅ Shiprocket Integration
✅ Admin Portal
✅ Stock Management
✅ Multiple Product Tiers/Pricing
✅ Return/Refund Policy Display

---

## 🎉 Success Indicators

After deployment, you should see:
```
✅ Website loads at: https://your-domain.com
✅ Products visible with images
✅ Cart works
✅ Payment processes through Razorpay
✅ Invoice generates and downloads
✅ Order tracking works
✅ Admin can update stock
```

---

## 📝 Important Notes

1. **NEVER** commit `.env` to GitHub/version control
2. **ALWAYS** use HTTPS (Hostinger enables automatically)
3. **BACKUP** your database regularly
4. **MONITOR** server logs for errors
5. **UPDATE** Node.js packages periodically: `npm update`
6. **TEST** payment flow regularly to ensure it works

---

## 🚀 You're Ready to Launch!

Your backup is production-ready. Follow the steps above and you'll have:

✅ A live e-commerce platform
✅ Payments processing  
✅ Orders tracking
✅ Professional invoices
✅ 24/7 availability

**Questions? Check the DEPLOYMENT_GUIDE.md or contact Hostinger support!**

---

**Deployment Date**: March 2, 2026
**Status**: ✅ Production Ready
**Version**: 1.0
**Support**: Ongoing

🎊 **GOOD LUCK WITH YOUR LAUNCH!** 🎊
