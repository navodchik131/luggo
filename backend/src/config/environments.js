const path = require('path');

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

const currentEnv = (process.env.NODE_ENV || 'development').trim();
const config = environments[currentEnv];

console.log(`🔧 Environments.js:`);
console.log(`   NODE_ENV raw: "${process.env.NODE_ENV}"`);
console.log(`   currentEnv: "${currentEnv}"`);
console.log(`   currentEnv length: ${currentEnv.length}`);
console.log(`   config найден: ${!!config}`);
console.log(`   доступные ключи: [${Object.keys(environments).join(', ')}]`);

if (!config) {
  console.error(`❌ Доступные окружения: ${Object.keys(environments).join(', ')}`);
  throw new Error(`Неизвестное окружение: ${currentEnv}`);
}

module.exports = {
  current: config,
  environment: currentEnv,
  isDevelopment: currentEnv === 'development',
  isProduction: currentEnv === 'production'
}; 