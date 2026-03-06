# 🚀 Nekxuz Hostinger Deployment Guide

## Quick Deploy Steps

### 1. Prepare Files
The `build_hostinger/` folder contains:
- ✅ Optimized React build (production)
- ✅ All product images in `/assets/cataloges/`
- ✅ `.htaccess` for SPA routing

### 2. Upload to Hostinger

#### Via SFTP:
```bash
sftp -P 65002 u875570433@89.117.27.154
cd public_html
put -r build_hostinger/* .
```

#### Or via File Manager:
1. Go to Hostinger File Manager → public_html
2. Delete old files (except .htaccess initially)
3. Upload contents of `build_hostinger/`

### 3. Verify Deployment

After upload, test:
```bash
curl https://nekxuz.in
curl https://nekxuz.in/assets/cataloges/honey%20almond%20-600/1.jpg
```

Should see:
- ✅ React app loads (HTML with `<div id="root">`)
- ✅ Product images load (HTTP 200)
- ✅ Routes work (any path → index.html)

### 4. Environment Variables

Backend is configured in the app:
```javascript
const API_BASE_URL = "https://nekxuz-backend-oqcn.onrender.com";
```

No `.env` files needed on Hostinger (it's a static site).

## File Structure

```
build_hostinger/
├── index.html          (Entry point)
├── static/
│   ├── js/             (React bundle)
│   ├── css/            (Styles)
│   └── media/          (Optimized images)
├── assets/
│   └── cataloges/      (Product images)
├── favicon.ico
└── .htaccess           (Apache config)
```

## Troubleshooting

### Images Not Loading
- Check path: `/assets/cataloges/` must exist in `public_html`
- Verify MIME types: Add to `.htaccess`:
  ```apache
  AddType image/jpeg .jpg
  AddType image/png .png
  ```

### Routes Return 404
- Ensure `.htaccess` is in root of `public_html`
- Check `RewriteEngine On` is enabled in Apache
- Verify `public_html` has `AllowOverride All`

### Slow Loading
- Enable gzip in `.htaccess` (already included)
- Test with: `curl -H "Accept-Encoding: gzip" -v https://nekxuz.in`

## Size Optimization

Build is ~166 KB gzipped (very fast):
- Main JS: 157.6 KB
- CSS: 7.63 KB
- Chunk: 1.78 KB

## Monitoring

Monitor backend health:
```bash
curl https://nekxuz-backend-oqcn.onrender.com/api/health
```

Should return: `{"ok":true,...}`

## Rollback

Keep previous build folder:
1. Rename current: `mv public_html public_html.v1`
2. Restore: `mv public_html.v2 public_html`
3. Restart Apache: Through Hostinger panel

---

**Deployed**: March 6, 2026  
**Backend**: Render (https://nekxuz-backend-oqcn.onrender.com)  
**Frontend**: Hostinger (https://nekxuz.in)
