import logger from '../utils/logger.js'
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.debug('✅ Подключение к PostgreSQL установлено успешно');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.debug('📊 Синхронизация моделей завершена');
    }
  } catch (error) {
    logger.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB }; 