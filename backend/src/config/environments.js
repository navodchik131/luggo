const path = require('path');
require('dotenv').config();

const environments = {
  development: {
    database: {
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'luggo_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    },
    server: {
      port: 5000,
      frontendUrl: 'http://localhost:5173'
    },
    features: {
      autoSync: false, // Отключаем автосинхронизацию
      logging: true
    }
  },
  
  production: {
    database: {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    server: {
      port: process.env.PORT || 5000,
      frontendUrl: process.env.FRONTEND_URL
    },
    features: {
      autoSync: false,
      logging: false
    }
  }
};

const currentEnv = process.env.NODE_ENV || 'development';
const config = environments[currentEnv];

if (!config) {
  throw new Error(`Неизвестное окружение: ${currentEnv}`);
}

module.exports = {
  current: config,
  environment: currentEnv,
  isDevelopment: currentEnv === 'development',
  isProduction: currentEnv === 'production'
}; 