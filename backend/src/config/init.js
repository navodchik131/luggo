import logger from '../utils/logger.js'
const { connectDB, sequelize } = require('./database');
const models = require('../models');

const initializeDatabase = async () => {
  try {
    // Подключение к базе данных
    await connectDB();
    
    logger.debug('📋 Доступные модели:', Object.keys(models));
    
    // Синхронизация моделей с базой данных
    logger.debug('🔄 Синхронизация моделей с базой данных...');
    await sequelize.sync({ alter: true });
    logger.debug('✅ Модели синхронизированы успешно');
    
    logger.debug('✅ База данных инициализирована успешно');
    
    return true;
  } catch (error) {
    logger.error('❌ Ошибка инициализации базы данных:', error);
    logger.error('Детали ошибки:', error.message);
    return false;
  }
};

module.exports = { initializeDatabase }; 