HOSTINGER DEPLOYMENT INSTRUCTIONS
=================================

1. Run `npm run build` in your project root terminal.
   (This will create a 'build' folder with your compiled React app).

2. Copy ALL contents from inside the 'build' folder into this 'nekxuz-hostinger-deploy' folder.
   - You should see 'index.html', 'static/', etc. here alongside this README.

3. Select ALL files in this folder (including .htaccess) and ZIP them.

4. Go to Hostinger File Manager -> public_html.

5. Delete everything in public_html.

6. Upload your ZIP file and Extract it.

7. Ensure 'index.html' and '.htaccess' are directly inside public_html (not in a subfolder).

8. Your site is live!
