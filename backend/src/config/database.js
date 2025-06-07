const { Sequelize } = require('sequelize');
const envConfig = require('./environments');

const config = envConfig.current;

// Для PostgreSQL используем правильную конфигурацию
let sequelizeConfig;

if (config.database.dialect === 'postgres') {
  sequelizeConfig = new Sequelize(
    config.database.name,
    config.database.user,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: 'postgres',
      logging: config.features.logging ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // Для других баз данных
  sequelizeConfig = new Sequelize(config.database);
}

const sequelize = sequelizeConfig;

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Подключение к ${config.database.dialect.toUpperCase()} установлено успешно (${envConfig.environment})`);
    
    // Автосинхронизация отключена для всех окружений
    if (config.features.autoSync) {
      await sequelize.sync({ alter: true });
      console.log('📊 Синхронизация моделей завершена');
    }
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB }; 