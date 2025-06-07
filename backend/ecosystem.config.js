module.exports = {
  apps: [
    {
      name: 'luggo-backend',
      script: 'server.js',
      cwd: '/home/luggo/luggo/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        ENV_FILE: '.env'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/home/luggo/.pm2/logs/luggo-backend-error.log',
      out_file: '/home/luggo/.pm2/logs/luggo-backend-out.log',
      log_file: '/home/luggo/.pm2/logs/luggo-backend-combined.log',
      time: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '500M',
      restart_delay: 4000
    }
  ]
}; 