#!/bin/bash
# ============================================================
# ADDRESSIFY VPS DEPLOYMENT SCRIPT
# Server: 72.61.114.103
# ============================================================

set -e

echo "=========================================="
echo "   ADDRESSIFY VPS DEPLOYMENT SCRIPT"
echo "=========================================="

# Configuration
APP_NAME="addressify"
APP_DIR="/var/www/addressify"
REPO_URL="https://github.com/cuongccna/Addressify.git"
NODE_VERSION="20"
PM2_NAME="addressify"
PORT=3002  # Use 3002 to avoid conflict with existing sites (3000, 3001)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Update system packages${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${YELLOW}Step 2: Install Node.js ${NODE_VERSION} if not exists${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt install -y nodejs
fi
node -v
npm -v

echo -e "${YELLOW}Step 3: Install PM2 globally if not exists${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
pm2 -v

echo -e "${YELLOW}Step 4: Create application directory${NC}"
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}

echo -e "${YELLOW}Step 5: Clone or pull repository${NC}"
if [ -d "${APP_DIR}/.git" ]; then
    cd ${APP_DIR}
    git pull origin main
else
    git clone ${REPO_URL} ${APP_DIR}
    cd ${APP_DIR}
fi

echo -e "${YELLOW}Step 6: Install dependencies${NC}"
npm ci --production=false

echo -e "${YELLOW}Step 7: Create .env.production file${NC}"
cat > ${APP_DIR}/.env.production << 'EOF'
# Database
DATABASE_URL="postgresql://addressify_user:AddressifyVPS2025!@#@localhost:5432/addressify_db?schema=public"
DIRECT_URL="postgresql://addressify_user:AddressifyVPS2025!@#@localhost:5432/addressify_db?schema=public"

# App
NEXT_PUBLIC_APP_URL=https://addressify.vn
NODE_ENV=production
PORT=3002

# Auth
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2025

# Shipping APIs
GHN_API_TOKEN=your-ghn-token
GHN_SHOP_ID=your-ghn-shop-id
GHTK_API_TOKEN=your-ghtk-token
VTP_API_TOKEN=your-vtp-token

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@addressify.vn

# Optional
NEXT_PUBLIC_ENABLE_ANALYTICS=true
EOF

echo -e "${YELLOW}Step 8: Generate Prisma client${NC}"
npx prisma generate

echo -e "${YELLOW}Step 9: Run database migrations${NC}"
npx prisma migrate deploy

echo -e "${YELLOW}Step 10: Build Next.js application${NC}"
npm run build

echo -e "${YELLOW}Step 11: Setup PM2 ecosystem${NC}"
cat > ${APP_DIR}/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${PM2_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${APP_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    error_file: '${APP_DIR}/logs/error.log',
    out_file: '${APP_DIR}/logs/output.log',
    log_file: '${APP_DIR}/logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p ${APP_DIR}/logs

echo -e "${YELLOW}Step 12: Start/Restart with PM2${NC}"
pm2 delete ${PM2_NAME} 2>/dev/null || true
pm2 start ${APP_DIR}/ecosystem.config.js --env production
pm2 save
pm2 startup

echo -e "${GREEN}=========================================="
echo "   DEPLOYMENT COMPLETED!"
echo "=========================================="
echo "App Name: ${PM2_NAME}"
echo "App Directory: ${APP_DIR}"
echo "Port: ${PORT}"
echo ""
echo "Next steps:"
echo "1. Update .env.production with real API keys"
echo "2. Configure Nginx reverse proxy"
echo "3. Setup SSL with Certbot"
echo "==========================================${NC}"

# Show PM2 status
pm2 status
