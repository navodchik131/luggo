const { Sequelize } = require('sequelize');
require('dotenv').config();

// Используем настройки из .env файла, как в основном приложении
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

async function addShowContactsField() {
  try {
    console.log('🔄 Подключаюсь к базе данных...');
    console.log(`📊 Использую настройки: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    
    await sequelize.authenticate();
    console.log('✅ Подключение установлено');
    
    // Проверяем существует ли таблица users
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users';
    `);
    
    if (tables.length === 0) {
      console.log('❌ Таблица users не существует');
      console.log('💡 Сначала запустите сервер для создания таблиц или выполните синхронизацию');
      
      // Можно попробовать загрузить модели и создать таблицы
      console.log('🔄 Пытаюсь создать таблицы через синхронизацию...');
      
      // Загружаем модели
      const User = require('../src/models/User');
      
      // Синхронизируем базу данных (создаем таблицы)
      await sequelize.sync({ alter: true });
      console.log('✅ Таблицы созданы/обновлены');
    } else {
      console.log('✅ Таблица users найдена');
    }
    
    // Проверяем есть ли уже поле showContacts
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'showContacts';
    `);
    
    if (columns.length > 0) {
      console.log('✅ Поле showContacts уже существует');
    } else {
      console.log('🔄 Добавляю поле showContacts в таблицу users...');
      
      // Добавляем поле
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN "showContacts" BOOLEAN DEFAULT TRUE NOT NULL;
      `);
      
      // Добавляем комментарий
      await sequelize.query(`
        COMMENT ON COLUMN users."showContacts" IS 'Показывать ли email и телефон другим пользователям';
      `);
      
      console.log('✅ Поле showContacts успешно добавлено');
    }
    
    // Проверяем финальное состояние
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'showContacts';
    `);
    
    if (results.length > 0) {
      console.log('✅ Поле showContacts присутствует в базе:');
      console.table(results);
    }
    
    await sequelize.close();
    console.log('✅ Миграция завершена успешно');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграции:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addShowContactsField(); 