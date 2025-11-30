# ============================================================
# ADDRESSIFY VPS DEPLOYMENT GUIDE
# Server: 72.61.114.103
# ============================================================

## 📋 Pre-requisites

VPS đã có:
- 2 sites đang chạy (ports 3000, 3001)
- PM2 để quản lý services
- Nginx làm reverse proxy
- PostgreSQL installed

## 🗄️ STEP 1: Setup PostgreSQL Database

SSH vào VPS:
```bash
ssh root@72.61.114.103
```

### 1.1 Tạo database và user

```bash
# Login vào PostgreSQL
sudo -u postgres psql

# Trong psql, chạy các lệnh sau:
```

```sql
-- Tạo user
CREATE USER addressify_user WITH PASSWORD 'AddressifyVPS2025!@#';

-- Tạo database
CREATE DATABASE addressify_db OWNER addressify_user ENCODING 'UTF8';

-- Kết nối vào database mới
\c addressify_db

-- Tạo extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant quyền
GRANT ALL PRIVILEGES ON DATABASE addressify_db TO addressify_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO addressify_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO addressify_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO addressify_user;

-- Thoát
\q
```

### 1.2 Test kết nối

```bash
psql -h localhost -U addressify_user -d addressify_db -c "SELECT version();"
# Nhập password: AddressifyVPS2025!@#
```

## 📂 STEP 2: Deploy Application

### 2.1 Tạo thư mục và clone code

```bash
# Tạo thư mục
mkdir -p /var/www/addressify
cd /var/www/addressify

# Clone repository
git clone https://github.com/cuongccna/Addressify.git .

# Hoặc upload code từ local
# scp -r ./dist/* root@72.61.114.103:/var/www/addressify/
```

### 2.2 Tạo file .env.production

```bash
nano /var/www/addressify/.env
```

Nội dung:
```env
# Database
DATABASE_URL="postgresql://addressify_user:AddressifyVPS2025!@#@localhost:5432/addressify_db?schema=public"
DIRECT_URL="postgresql://addressify_user:AddressifyVPS2025!@#@localhost:5432/addressify_db?schema=public"

# App
NEXT_PUBLIC_APP_URL=https://addressify.vn
NODE_ENV=production
PORT=3002

# Auth - THAY ĐỔI JWT SECRET!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2025-random-string

# Shipping APIs - THAY BẰNG API KEYS THẬT
GHN_API_TOKEN=your-real-ghn-token
GHN_SHOP_ID=your-ghn-shop-id
GHTK_API_TOKEN=your-real-ghtk-token
VTP_API_TOKEN=your-real-vtp-token

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@addressify.vn
```

### 2.3 Install dependencies và build

```bash
cd /var/www/addressify

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build
npm run build
```

### 2.4 Tạo PM2 ecosystem config

```bash
nano /var/www/addressify/ecosystem.config.js
```

Nội dung:
```javascript
module.exports = {
  apps: [{
    name: 'addressify',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/addressify',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/var/www/addressify/logs/error.log',
    out_file: '/var/www/addressify/logs/output.log',
    time: true
  }]
};
```

### 2.5 Start với PM2

```bash
# Tạo thư mục logs
mkdir -p /var/www/addressify/logs

# Start app
pm2 start /var/www/addressify/ecosystem.config.js

# Save PM2 config
pm2 save

# Kiểm tra status
pm2 status
pm2 logs addressify
```

## 🌐 STEP 3: Configure Nginx

### 3.1 Tạo Nginx config

```bash
nano /etc/nginx/sites-available/addressify
```

Copy nội dung từ file `scripts/nginx-addressify.conf`

### 3.2 Enable site

```bash
# Tạo symlink
ln -s /etc/nginx/sites-available/addressify /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload nginx
systemctl reload nginx
```

## 🔒 STEP 4: Setup SSL với Certbot

```bash
# Install certbot nếu chưa có
apt install certbot python3-certbot-nginx -y

# Tạo SSL certificate
certbot --nginx -d addressify.vn -d www.addressify.vn

# Test auto-renewal
certbot renew --dry-run
```

## ✅ STEP 5: Verify Deployment

### 5.1 Kiểm tra services

```bash
# PM2 status
pm2 status

# Xem logs
pm2 logs addressify --lines 50

# Kiểm tra port
netstat -tlnp | grep 3002
```

### 5.2 Test endpoints

```bash
# Health check
curl http://localhost:3002

# API test
curl http://localhost:3002/api/auth/user
```

### 5.3 DNS Configuration

Trỏ domain về IP VPS:
```
A    addressify.vn      72.61.114.103
A    www.addressify.vn  72.61.114.103
```

## 📊 STEP 6: Sync Master Data

Sau khi deploy xong, vào UI để sync master data:

1. Truy cập: https://addressify.vn/master-data
2. Đăng nhập với tài khoản admin
3. Click "Sync từ GHN API" để đồng bộ dữ liệu địa chỉ

Hoặc qua API:
```bash
curl -X POST https://addressify.vn/api/master-data/sync
```

## 🔄 Update Deployment

Khi có code mới:

```bash
cd /var/www/addressify

# Pull code mới
git pull origin main

# Install dependencies (nếu có thay đổi)
npm ci

# Generate Prisma client (nếu có thay đổi schema)
npx prisma generate
npx prisma migrate deploy

# Build lại
npm run build

# Restart app
pm2 restart addressify

# Kiểm tra logs
pm2 logs addressify --lines 20
```

## 🛠️ Troubleshooting

### Database connection failed
```bash
# Kiểm tra PostgreSQL status
systemctl status postgresql

# Kiểm tra connection
psql -h localhost -U addressify_user -d addressify_db
```

### PM2 process crashed
```bash
# Xem error logs
pm2 logs addressify --err --lines 100

# Restart
pm2 restart addressify
```

### Nginx 502 Bad Gateway
```bash
# Kiểm tra app đang chạy
pm2 status

# Kiểm tra port
netstat -tlnp | grep 3002

# Xem nginx error log
tail -f /var/log/nginx/addressify_error.log
```

## 📁 File Structure on VPS

```
/var/www/addressify/
├── .env                    # Environment variables
├── .next/                  # Next.js build output
├── ecosystem.config.js     # PM2 config
├── logs/                   # Application logs
│   ├── error.log
│   └── output.log
├── node_modules/
├── prisma/
│   └── schema.prisma
├── public/
├── src/
└── package.json

/etc/nginx/sites-available/
└── addressify              # Nginx config

/etc/letsencrypt/live/addressify.vn/
├── fullchain.pem           # SSL certificate
└── privkey.pem             # SSL private key
```

## 🔑 Credentials Summary

| Service | Username | Password |
|---------|----------|----------|
| PostgreSQL | addressify_user | AddressifyVPS2025!@# |
| Database | addressify_db | - |
| App Port | - | 3002 |

---

**Note:** Nhớ thay đổi các API keys và JWT_SECRET trong file .env trước khi go live!
