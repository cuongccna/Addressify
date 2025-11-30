#!/bin/bash
# ============================================================
# QUICK COMMANDS FOR VPS MANAGEMENT
# Server: 72.61.114.103
# ============================================================

# ========== SSH Commands ==========

# SSH vào VPS
# ssh root@72.61.114.103

# Upload file từ local lên VPS
# scp -r ./dist/* root@72.61.114.103:/var/www/addressify/

# ========== Database Commands ==========

# Login PostgreSQL
# sudo -u postgres psql

# Backup database
# pg_dump -U addressify_user -h localhost addressify_db > backup_$(date +%Y%m%d).sql

# Restore database  
# psql -U addressify_user -h localhost addressify_db < backup_20251130.sql

# ========== PM2 Commands ==========

# Xem tất cả apps
# pm2 list

# Xem logs addressify
# pm2 logs addressify

# Restart addressify
# pm2 restart addressify

# Stop addressify
# pm2 stop addressify

# Delete addressify
# pm2 delete addressify

# Save PM2 config
# pm2 save

# ========== Nginx Commands ==========

# Test nginx config
# nginx -t

# Reload nginx
# systemctl reload nginx

# Xem nginx error logs
# tail -f /var/log/nginx/addressify_error.log

# ========== SSL Commands ==========

# Renew SSL
# certbot renew

# Test renewal
# certbot renew --dry-run

# ========== Deploy New Version ==========

deploy() {
    cd /var/www/addressify
    git pull origin main
    npm ci
    npx prisma generate
    npx prisma migrate deploy
    npm run build
    pm2 restart addressify
    echo "Deploy completed!"
}

# ========== Health Check ==========

healthcheck() {
    echo "=== PM2 Status ==="
    pm2 status
    echo ""
    echo "=== Port Check ==="
    netstat -tlnp | grep -E "3000|3001|3002"
    echo ""
    echo "=== Nginx Status ==="
    systemctl status nginx --no-pager -l
    echo ""
    echo "=== PostgreSQL Status ==="
    systemctl status postgresql --no-pager -l
}

# ========== Logs ==========

logs() {
    pm2 logs addressify --lines 100
}

# Run function if passed as argument
"$@"
