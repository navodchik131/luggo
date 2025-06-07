module.exports = {
  apps: [{
    name: 'luggo-backend',
    script: 'server.js',
    cwd: '/home/luggo/luggo/backend',
    interpreter: '/home/luggo/.nvm/versions/node/v18.20.8/bin/node',
    interpreter_args: '',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001,
      FRONTEND_URL: 'http://localhost:5173'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      FRONTEND_URL: 'https://luggo.ru'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}; 