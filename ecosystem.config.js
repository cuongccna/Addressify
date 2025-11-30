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
    env_production: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    // Logs
    error_file: '/var/www/addressify/logs/error.log',
    out_file: '/var/www/addressify/logs/output.log',
    log_file: '/var/www/addressify/logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Restart settings
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    
    // Health check
    exp_backoff_restart_delay: 100,
  }]
};
