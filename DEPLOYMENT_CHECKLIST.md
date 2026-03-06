# ✅ Nekxuz Hostinger Deployment Checklist

## 📋 Pre-Deployment

- [x] Build created: `build_hostinger/`
- [x] Product images included in `assets/cataloges/`
- [x] `.htaccess` configured for SPA routing
- [x] Backend API URL: `https://nekxuz-backend-oqcn.onrender.com`
- [x] Firebase config included in React code
- [x] PDF generation libraries (jsPDF) in dependencies

## 🚀 Deployment Options

### Option 1: Automated Script (Recommended)
```bash
./deploy-hostinger.sh
```
- Automatically backs up current site
- Uploads all files
- Verifies deployment
- Provides rollback instructions

### Option 2: Manual SFTP
```bash
sftp -P 65002 u875570433@89.117.27.154
cd public_html
put -r build_hostinger/* .
exit
```

### Option 3: Hostinger File Manager
1. Login → File Manager
2. Navigate to `/public_html`
3. Delete old index.html and static/ folder
4. Upload `build_hostinger/` contents
5. Ensure `.htaccess` is present

## 📦 What Gets Deployed

```
public_html/
├── index.html                      (React entry point)
├── .htaccess                       (Apache routing & compression)
├── asset-manifest.json             (Asset manifest)
├── static/
│   ├── js/
│   │   ├── main.[hash].js         (React bundle ~157KB)
│   │   ├── 453.[hash].chunk.js    (Firebase chunk)
│   │   └── *.map                  (Source maps)
│   ├── css/
│   │   ├── main.[hash].css        (Tailwind styles ~7KB)
│   │   └── *.map                  (Source maps)
│   └── media/                     (Compressed images)
└── assets/
    └── cataloges/                 (Product images)
        ├── honey almond -600/
        ├── neem lime-50/
        ├── herbal toothpaste/
        ├── red paste/
        └── ... (more product folders)
```

## 🔍 Post-Deployment Verification

### Step 1: Check Frontend
```bash
curl -I https://nekxuz.in
# Should return: HTTP/2 200
```

### Step 2: Check Images
```bash
curl -I https://nekxuz.in/assets/cataloges/honey%20almond%20-600/1.jpg
# Should return: HTTP/2 200
```

### Step 3: Check Backend Health
```bash
curl https://nekxuz-backend-oqcn.onrender.com/api/health
# Should return: {"ok":true,...}
```

### Step 4: Test in Browser
- 🌐 Open https://nekxuz.in
- ✅ Should see products with images
- ✅ Should see all tabs: Shop, Contract Mfg, RFQ, AI Chat
- ✅ Can add to cart
- ✅ Can proceed to checkout

## 🆘 Troubleshooting

### Issue: "Cannot GET /some-path"
**Solution**: `.htaccess` not working
- Check `.htaccess` exists in `public_html/`
- Verify Apache `mod_rewrite` is enabled
- Test: `curl https://nekxuz.in/any-path` should return HTML (not 404)

### Issue: Images show broken
**Solution**: Asset paths incorrect
- Verify: `public_html/assets/catalogues/` exists
- Test: `curl -v https://nekxuz.in/assets/cataloges/honey%20almond%20-600/1.jpg`
- Check MIME types in `.htaccess`

### Issue: Slow loading
**Solution**: Gzip not enabled
- Check `.htaccess` has `mod_deflate`
- Test: `curl -H "Accept-Encoding: gzip" https://nekxuz.in`
- Should see: `Content-Encoding: gzip`

### Issue: 503 Backend Error
**Solution**: Render backend down
- Check: https://nekxuz-backend-oqcn.onrender.com/api/health
- Render free tier spins down after inactivity
- Solution: Keep a request running every 15 mins or upgrade to paid

## 🔄 Rollback Plan

If something breaks:
```bash
ssh -p 65002 u875570433@89.117.27.154
cd /home/u875570433
mv public_html public_html.broken
mv public_html.backup.[timestamp] public_html
```

## 📊 Performance Metrics

After deployment, check:
- Build size: ~166 KB gzipped ✅
- Load time: < 2 seconds
- Images: Properly cached (Cache-Control header set)
- Security: CSP headers enabled

## 🎯 Features Deployed

All features are included and ready:
- ✅ **Shop**: Product catalog with images
- ✅ **Cart**: Add/remove items with pricing tiers
- ✅ **Checkout**: Generate invoice PDFs
- ✅ **Contract Manufacturing**: RFQ form
- ✅ **RFQ Messenger**: AI-assisted drafting
- ✅ **User Auth**: Firebase authentication
- ✅ **Payment**: Razorpay integration
- ✅ **Shipping**: Shiprocket integration (if backend configured)

## 📞 Support

Backend issues? Check:
- Render: https://render.com/dashboard
- Backend logs: `https://nekxuz-backend-oqcn.onrender.com/logs`

Frontend issues? Check:
- Browser console (F12 → Console)
- Network tab for 404s
- Hostinger file manager for file existence

---

**Build Date**: March 6, 2026  
**Status**: Ready for deployment  
**Estimated Downtime**: < 5 minutes
