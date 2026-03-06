# Hostinger VPS Deployment Guide for Nekxuz Backend

This guide provides step-by-step instructions to deploy your Node.js backend to a Hostinger VPS.

## Prerequisites

1.  **Hostinger VPS Plan:** Ensure you have a VPS plan (e.g., KVM 1 or higher).
2.  **SSH Access:** You need the IP address of your VPS and the root password.
3.  **Domain Name (Optional but Recommended):** `nekxuz.in` pointing to your VPS IP.

## Option 1: Direct Integration via SSH (Recommended)

This method gives you full control and is the standard way to deploy Node.js apps.

### Step 1: Connect to your VPS

Open your terminal (Mac/Linux) or PowerShell (Windows) and run:

```bash
ssh root@<YOUR_VPS_IP_ADDRESS>
```

*   Replace `<YOUR_VPS_IP_ADDRESS>` with the actual IP from your Hostinger dashboard.
*   Enter your root password when prompted.

### Step 2: Update System and Install Dependencies

Once logged in, run the following commands to update the server and install necessary tools:

```bash
apt update && apt upgrade -y
apt install curl git unzip -y
```

### Step 3: Install Node.js (Version 20)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verify installation:
```bash
node -v
npm -v
```

### Step 4: Install PM2 (Process Manager)

PM2 keeps your app running in the background and restarts it if it crashes.

```bash
npm install -g pm2
```

### Step 5: Set Up Your Project

1.  **Create a directory for your app:**
    ```bash
    mkdir -p /var/www/nekxuz-backend
    cd /var/www/nekxuz-backend
    ```

2.  **Upload your files:**
    *   **Method A (Git):** If your code is on GitHub/GitLab:
        ```bash
        git clone <YOUR_REPO_URL> .
        ```
    *   **Method B (SCP/SFTP):** Upload your project files from your local machine using `scp` or an FTP client like FileZilla.
        *   *From your local machine terminal:*
            ```bash
            scp -r /path/to/your/project/* root@<YOUR_VPS_IP>:/var/www/nekxuz-backend/
            ```
        *   *Note:* Exclude `node_modules` and `.git` folders to save time.

3.  **Install Project Dependencies:**
    ```bash
    npm install
    ```

4.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```

### Step 6: Configure Environment Variables

Create a `.env` file in your project directory:

```bash
nano .env
```

Paste your environment variables (from your local `.env` file):

```env
PORT=3002
DATABASE_URL="file:./dev.db"
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
# Add other variables as needed
```

Press `Ctrl+X`, then `Y`, then `Enter` to save and exit.

### Step 7: Start the Application with PM2

```bash
pm2 start server.js --name "nekxuz-backend"
pm2 save
pm2 startup
```

(Run the command output by `pm2 startup` to ensure it starts on boot).

### Step 8: Set Up Nginx as a Reverse Proxy

This allows you to access your API via your domain (e.g., `api.nekxuz.in` or `nekxuz.in/api`) instead of `http://<IP>:3002`.

1.  **Install Nginx:**
    ```bash
    apt install nginx -y
    ```

2.  **Create a configuration file:**
    ```bash
    nano /etc/nginx/sites-available/nekxuz
    ```

3.  **Paste the following configuration:**

    ```nginx
    server {
        listen 80;
        server_name nekxuz.in www.nekxuz.in; # Replace with your domain

        location / {
            proxy_pass http://localhost:3002; # Your Node.js port
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

4.  **Enable the site:**
    ```bash
    ln -s /etc/nginx/sites-available/nekxuz /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default # Remove default site if needed
    nginx -t # Test configuration
    systemctl restart nginx
    ```

### Step 9: Secure with SSL (HTTPS)

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d nekxuz.in -d www.nekxuz.in
```

Follow the prompts to enable HTTPS.

---

## Option 2: Hostinger "VPS AI Assistant" or Panel

If you prefer a GUI approach via Hostinger's hPanel:

1.  **Log in to Hostinger hPanel.**
2.  **Navigate to VPS Dashboard.**
3.  **Use the "Browser Terminal"** to perform the steps in "Option 1" without needing a separate SSH client.
4.  **File Manager:** You can use the VPS File Manager in hPanel to upload your project files (zip them locally, upload, and unzip).

## Troubleshooting

*   **Check Logs:** `pm2 logs nekxuz-backend`
*   **Check Status:** `pm2 status`
*   **Restart App:** `pm2 restart nekxuz-backend`
*   **Database Issues:** Ensure `dev.db` exists and has write permissions.
    ```bash
    chmod 777 dev.db
    ```

## Summary Checklist

- [ ] Node.js v20 installed
- [ ] Project files uploaded to `/var/www/nekxuz-backend`
- [ ] `npm install` run successfully
- [ ] `npx prisma generate` run successfully
- [ ] `.env` file created with correct credentials
- [ ] App started with PM2
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (Certbot)
