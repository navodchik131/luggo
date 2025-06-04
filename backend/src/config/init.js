const { connectDB, sequelize } = require('./database');
const models = require('../models');

const initializeDatabase = async () => {
  try {
    // Подключение к базе данных
    await connectDB();
    
    console.log('📋 Доступные модели:', Object.keys(models));
    
    // Синхронизация моделей с базой данных
    console.log('🔄 Синхронизация моделей с базой данных...');
    await sequelize.sync({ alter: true });
    console.log('✅ Модели синхронизированы успешно');
    
    console.log('✅ База данных инициализирована успешно');
    
    return true;
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    console.error('Детали ошибки:', error.message);
    return false;
  }
};

module.exports = { initializeDatabase }; 