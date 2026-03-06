# 🌐 Production Deployment Guide - Nekxuz B2B Platform

## Quick Start for Production Deployment

### 1. Environment Setup

#### Create Production Environment File
```bash
# Copy development env to production
cp .env .env.production

# Update with production values:
```

#### `.env.production` Template
```env
# Database (PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:5432/nekxuz_prod

# Backend Configuration
PORT=3002
NODE_ENV=production
LOG_LEVEL=info

# Frontend Configuration
REACT_APP_API_URL=https://api.nekxuz.com
REACT_APP_ENV=production

# Firebase
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_firebase_domain
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_STORAGE_BUCKET=your_storage_bucket

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Shipping Integration (Shiprocket)
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_AUTH_TOKEN=your_token

# Email Service (Gmail/SendGrid)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Admin Settings
ADMIN_PASSWORD=secure_password_here

# Storage
STORAGE_TYPE=firebase  # or aws-s3
AWS_ACCESS_KEY_ID=optional
AWS_SECRET_ACCESS_KEY=optional
AWS_S3_BUCKET=optional

# Session
SESSION_SECRET=generate_secure_random_string

# API Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=https://nekxuz.com

# Monitoring (optional)
SENTRY_DSN=your_sentry_dsn
LOG_SERVICE_TOKEN=optional
```

---

### 2. Database Migration (SQLite → PostgreSQL)

#### Step 1: Set up PostgreSQL
```bash
# Using Docker (recommended)
docker run --name nekxuz-db \
  -e POSTGRES_USER=nekxuz \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=nekxuz_prod \
  -p 5432:5432 \
  -d postgres:15

# Or use managed database (AWS RDS, DigitalOcean, Heroku)
```

#### Step 2: Update Prisma Schema
```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Keep existing models unchanged
```

#### Step 3: Run Migration
```bash
# Generate migration
npx prisma migrate dev --name production_init

# Deploy to production
npx prisma migrate deploy

# Verify with Prisma Studio
npx prisma studio
```

---

### 3. Security Hardening

#### Install Security Packages
```bash
npm install helmet express-rate-limit express-validator \
  dotenv-safe cors cookie-parser compression \
  js-cookie express-mongo-sanitize hpp
```

#### Update `server.js` with Security Middleware
```javascript
// At the top of server.js, add:
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');

// Apply security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Data sanitization
app.use(mongoSanitize()); // Remove $ and . from user input
app.use(hpp()); // Protect against HTTP Parameter Pollution

// CORS configuration
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3004',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### 4. Logging & Monitoring

#### Install Logging
```bash
npm install winston pino pino-pretty
```

#### Update Error Handling
```javascript
// Add at end of server.js

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  
  res.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
```

---

### 5. Docker Containerization (Recommended)

#### Create `Dockerfile`
```dockerfile
# Multi-stage build for production

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 3: Production image
FROM node:18-alpine
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builders
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/build ./public
COPY server.js .
COPY prisma ./prisma
COPY .env.production .env

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

EXPOSE 3002
```

#### Create `docker-compose.yml`
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: nekxuz-db
    environment:
      POSTGRES_USER: nekxuz
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: nekxuz_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nekxuz"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    container_name: nekxuz-app
    ports:
      - "3002:3002"
      - "3004:3004"
    environment:
      DATABASE_URL: postgresql://nekxuz:${DB_PASSWORD}@db:5432/nekxuz_prod
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Build and Run Docker
```bash
# Build image
docker build -t nekxuz:latest .

# Run with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

### 6. Deployment to Production

#### Option A: Traditional VPS (AWS EC2, DigitalOcean)

```bash
# 1. SSH into server
ssh root@your_server_ip

# 2. Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y postgresql postgresql-contrib

# 3. Clone repository
git clone https://github.com/your-org/nekxuz.git
cd nekxuz

# 4. Install dependencies
npm install

# 5. Build frontend
npm run build

# 6. Configure environment
cp .env.production .env
nano .env  # Edit with production values

# 7. Run database migrations
npx prisma migrate deploy

# 8. Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name "nekxuz-api"
pm2 save
pm2 startup

# 9. Configure Nginx as reverse proxy
sudo apt-get install -y nginx
# See nginx.conf below

# 10. Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Nginx Configuration (`/etc/nginx/sites-available/nekxuz`)
```nginx
upstream nekxuz_api {
    server 127.0.0.1:3002;
}

upstream nekxuz_frontend {
    server 127.0.0.1:3004;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name nekxuz.com www.nekxuz.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name nekxuz.com www.nekxuz.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/nekxuz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nekxuz.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/atom+xml image/svg+xml;

    # Frontend static files
    location / {
        proxy_pass http://nekxuz_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API routes
    location /api/ {
        proxy_pass http://nekxuz_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support if needed
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Enable Nginx config
```bash
sudo ln -s /etc/nginx/sites-available/nekxuz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Set up SSL with Let's Encrypt
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d nekxuz.com -d www.nekxuz.com
```

---

#### Option B: Vercel (Frontend) + Railway (Backend)

```bash
# 1. Deploy Frontend to Vercel
npm install -g vercel
vercel

# 2. Deploy Backend to Railway
# Create account at railway.app
# Connect GitHub repository
# Set environment variables
# Deploy

# 3. Update frontend API_BASE_URL to Railway URL
# Update src/App.js:
const API_BASE_URL = "https://your-railway-app.up.railway.app"
```

---

### 7. Health Checks & Monitoring

#### Add Health Check Endpoint (server.js)
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage()
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: err.message });
  }
});
```

#### Monitoring with Uptimerobot
```
1. Go to https://uptimerobot.com
2. Create monitor for https://nekxuz.com/health
3. Set interval: 5 minutes
4. Set alert email
```

---

### 8. Backup Strategy

#### Automated Database Backups
```bash
# Create backup script: scripts/backup.sh
#!/bin/bash
BACKUP_DIR="/backups/nekxuz"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump $DATABASE_URL > $BACKUP_DIR/db_$TIMESTAMP.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$TIMESTAMP.sql s3://nekxuz-backups/

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed at $TIMESTAMP"
```

#### Schedule with Cron
```bash
# Edit crontab
crontab -e

# Add line for daily backup at 2 AM
0 2 * * * /home/nekxuz/scripts/backup.sh >> /var/log/nekxuz-backup.log 2>&1
```

---

### 9. Performance Optimization

#### Enable Caching (Redis)
```bash
npm install redis

# In server.js
const redis = require('redis');
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Cache stock for 5 minutes
app.get('/api/stock', async (req, res) => {
  const cacheKey = 'stock_data';
  
  client.get(cacheKey, async (err, cached) => {
    if (cached) return res.json(JSON.parse(cached));
    
    const stock = await getStockFromDB();
    client.setex(cacheKey, 300, JSON.stringify(stock));
    res.json(stock);
  });
});
```

#### CDN Setup
```
1. Use Cloudflare (free tier available)
2. Point domain to Cloudflare nameservers
3. Enable caching for /static/* and /build/*
4. Enable minification & compression
```

---

## 📊 Pre-Launch Checklist

- [ ] Environment configured for production
- [ ] Database migrated to PostgreSQL
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error handling implemented
- [ ] Monitoring/health checks set up
- [ ] Backups automated
- [ ] CDN configured
- [ ] Domain DNS updated
- [ ] Email service configured
- [ ] Payment processor in live mode
- [ ] Shipping provider tested
- [ ] Analytics configured
- [ ] Logs aggregated

---

## 🚨 Emergency Recovery

```bash
# Restore from backup
pg_restore -d nekxuz_prod < db_backup.sql

# Rollback deployment
git checkout previous_commit_hash
npm install
npm run build
pm2 restart all

# Check disk space
df -h

# Check memory
free -h

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

---

*Last Updated: 28 February 2026*
*Production deployment ready to go!*
