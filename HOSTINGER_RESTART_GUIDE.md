# 🚀 HOSTINGER NODE.JS APPLICATION RESTART GUIDE

## Quick Steps to Update Your Backend

### 1. **SSH into Hostinger** (if needed)
```bash
ssh your-hostinger-username@your-hostinger-domain.com
# Or use Hostinger's File Manager in the control panel
```

### 2. **Pull Latest Code from GitHub**
```bash
cd your-app-directory
git pull origin main
```

### 3. **Install/Update Dependencies**
```bash
npm install
```

### 4. **Restart Node.js Application**
In Hostinger Control Panel:
- Go to **Manage** → **Advanced** → **Node.js**
- Click **Restart Application** button
- OR run: `pm2 restart all` (if using PM2)

### 5. **Verify Backend is Running**
```bash
curl https://api.nekxuz.in/
# Should return:
# {"ok":true,"message":"Nekxuz Backend Running on Hostinger",...}
```

### 6. **Test Orders Endpoint**
```bash
curl "https://api.nekxuz.in/api/orders?email=infodevayu@enterprisegmail.com"
# Should return:
# {"ok":true,"orders":[],"count":0}
```

## What Changed?

✅ **File-based order storage** - Orders now save to `data/orders.json` on your server
✅ **Firebase fallback** - Will try Firebase first, but doesn't break if unavailable
✅ **No external dependencies** - Works completely on Hostinger's file system

## Order Storage Location

Orders are stored at: `/home/your-username/your-app/data/orders.json`

## Next Steps

1. Restart your Node.js application
2. Test the payment flow at https://nekxuz.in
3. Complete a test purchase
4. Check if order appears in "My Orders" tab

---

**Questions?** Check your Hostinger logs in the control panel.
