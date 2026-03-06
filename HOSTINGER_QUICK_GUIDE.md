# 🚀 HOSTINGER UPLOAD QUICK GUIDE

## What You Have
✅ `HOSTINGER_BACKUP.zip` (14MB) - Complete backup ready to upload
✅ `HOSTINGER_BACKUP/` - Uncompressed folder with all files

## Step 1: Upload to Hostinger

### Option A: Using Hostinger File Manager (Easiest)
1. Log in to Hostinger Control Panel
2. Go to **File Manager** → **public_html**
3. Click **Upload** button
4. Select `HOSTINGER_BACKUP.zip`
5. Right-click → **Extract** (or auto-extracts)
6. Move files from `HOSTINGER_BACKUP/` to `public_html` root

### Option B: Using SSH/SFTP (Faster)
```bash
# From your Mac terminal:
sftp user@your-hostinger-ftp-address
cd public_html
put HOSTINGER_BACKUP.zip
```

Then SSH in:
```bash
ssh user@your-hostinger-server
cd public_html
unzip HOSTINGER_BACKUP.zip
cp HOSTINGER_BACKUP/* ./
```

## Step 2: Configure on Hostinger

1. **Create `.env` file** in `public_html`:
   ```
   RAZORPAY_KEY_ID=rpk_live_xxxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   SHIPROCKET_API_KEY=xxxxx
   SHIPROCKET_CHANNEL_ID=xxxxx
   NODE_ENV=production
   ```

2. **Set Node.js version** to 18 or higher:
   - Hostinger Panel → Node.js Version → Select 18+

3. **Install dependencies**:
   ```bash
   npm install --production
   ```

4. **Start your app**:
   - Hostinger usually auto-starts Node.js apps
   - Or manually: `npm start`

## Step 3: Configure Domain

1. In Hostinger: **Domains** → Point to your Node.js app
2. SSL will auto-enable
3. Wait 5-10 minutes for propagation

## 📁 File Structure After Upload

```
public_html/
├── build/                      # React frontend (static files)
├── server.js                   # Main server code
├── package.json               # Dependencies
├── shiprocket.js              # Shipping integration
├── stock.json                 # Product data
├── .env                       # Your credentials (CREATE THIS!)
└── node_modules/              # Auto-created after npm install
```

## 🔐 IMPORTANT: Security Checklist

- [ ] `.env` file is created with your real credentials
- [ ] `.env` is in `.gitignore` (don't expose credentials)
- [ ] HTTPS is enabled (auto in Hostinger)
- [ ] Razorpay keys are set correctly
- [ ] Shiprocket API key is set correctly

## ✅ Testing After Deployment

1. **Open your domain** in browser
2. **Test features**:
   - Add product to cart
   - Complete payment (use test card if Razorpay test mode)
   - Check invoice downloads
   - Check tracking

## 📊 Backup Contents Checklist

✅ React build (frontend files)
✅ Express server code
✅ Razorpay integration
✅ Shiprocket integration
✅ Invoice generation
✅ Stock management
✅ Admin portal
✅ All APIs

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module" | Run `npm install` |
| Payment not working | Check RAZORPAY_KEY_ID/SECRET in .env |
| Page shows blank | Check Node.js version is 18+ |
| Shipping not working | Verify SHIPROCKET_API_KEY |
| Invoices fail | Check directory write permissions |

## 📞 Hostinger Support

Need help? Hostinger has:
- 24/7 Live Chat Support
- Knowledge Base at hostinger.com/help
- Community Forum

## 🎉 You're Ready!

Your website backup is production-ready. Just:
1. Upload `HOSTINGER_BACKUP.zip`
2. Configure `.env` with your API keys
3. Run `npm install`
4. Point your domain
5. Test it!

**All systems are go! 🚀**

---
Created: March 2, 2026
Version: Production 1.0
