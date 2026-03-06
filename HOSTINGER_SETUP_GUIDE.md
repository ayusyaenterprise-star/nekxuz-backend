# Nekxuz Deployment on Hostinger - Updated Instructions

## 🚀 Quick Setup

### Step 1: Upload Backup
1. Download: `Nekxuz-hostinger-deploy.zip` OR `Nekxuz-hostinger-deploy.tar.gz`
2. Go to Hostinger **File Manager** (cPanel)
3. Upload to: `public_html/` folder
4. Extract the archive

### Step 2: File Structure After Extract
```
public_html/
├── deploy/
│   ├── server.js           ← Main server
│   ├── package.json        ← Dependencies (optimized)
│   ├── .env                ← Environment variables
│   ├── shiprocket.js       ← Shipping API
│   ├── start.sh            ← Startup script
│   ├── build/              ← React frontend (static)
│   └── public/             ← Same as build/
```

### Step 3: Setup Node.js on Hostinger

**Method A: Using cPanel Node.js Manager (RECOMMENDED)**
1. Go to **cPanel → Node.js Manager**
2. Click **Create Node.js Application**
3. Set these fields:
   - **Node.js version**: 18.x or 20.x
   - **Application root**: `/home/username/public_html/deploy`
   - **Application startup file**: `server.js`
   - **Application URL**: Your domain
4. Click **Create**
5. Wait 2-3 minutes for deployment

**Method B: Manual (Terminal)**
```bash
cd ~/public_html/deploy
npm install --production
npm start
```

### Step 4: Configure Environment Variables
1. Open `.env` file in deploy folder
2. Update with your keys:
```
PORT=3002
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxx
SHIPROCKET_EMAIL=your@email.com
SHIPROCKET_PASSWORD=your_password
```

### Step 5: Verify Installation
1. Visit your domain: `https://yourdomain.com`
2. Check if site loads
3. Test cart → payment → success flow

## ⚠️ Important Notes

- **Keep .env private** - Never share keys
- **Enable HTTPS** - Hostinger provides free SSL
- **Set file permissions**: 755 for folders, 644 for files
- **Database location**: `dev.sqlite` (auto-created)
- **Invoice PDFs**: Stored in deploy folder

## 🔧 Troubleshooting

### "Module not found" error
```bash
cd ~/public_html/deploy
npm install --production
```

### "Port already in use"
Let Hostinger's Node.js manager assign the port automatically

### Payment not working
- Check RAZORPAY keys in .env
- Verify in Razorpay dashboard
- Check webhook settings

### Database errors
- Ensure write permissions on deploy folder
- Run: `chmod 755 deploy/`

## 📋 File Information

| File | Purpose |
|------|---------|
| `server.js` | Backend/API server |
| `shiprocket.js` | Shiprocket API integration |
| `build/` | React frontend (static files) |
| `public/` | Mirror of build/ |
| `.env` | Environment variables (private) |
| `package.json` | Dependencies list |

## 🎯 What's Included

✅ Full working Node.js server
✅ React frontend (pre-built)
✅ Payment integration (Razorpay)
✅ Shipping integration (Shiprocket)
✅ Invoice generation
✅ Order tracking
✅ Database setup
✅ All product images

## ✨ After Deployment

1. **Test Payments**: Use Razorpay test cards
2. **Monitor Logs**: Use Hostinger terminal
3. **Update DNS**: Point domain to Hostinger nameservers
4. **Enable HTTPS**: Auto in Hostinger
5. **Setup Email**: Configure SMTP for notifications

## 📞 Support

- **Hostinger Help**: https://support.hostinger.com/
- **Node.js Docs**: https://nodejs.org/
- **Razorpay API**: https://razorpay.com/docs/
- **Shiprocket API**: https://www.shiprocket.in/

---
**Last Updated**: March 2, 2026
**Backup Format**: TAR.GZ + ZIP
**Total Size**: ~27MB (uncompressed: ~50MB)
