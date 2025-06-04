const { sequelize } = require('../src/config/database');

const updateTaskEnum = async () => {
  try {
    console.log('🔄 Обновление ENUM для категорий задач...');
    
    // Подключаемся к базе данных
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');
    
    // Добавляем новое значение в ENUM
    await sequelize.query(`
      ALTER TYPE "enum_tasks_category" ADD VALUE IF NOT EXISTS 'garbage';
    `);
    
    console.log('✅ Значение "garbage" добавлено в ENUM');
    console.log('🎉 Обновление завершено успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка обновления ENUM:', error);
    
    if (error.message.includes('does not exist')) {
      console.log('📝 ENUM не существует, попробуем пересоздать таблицу...');
      
      try {
        // Пересоздаем таблицу (будьте осторожны - это удалит данные!)
        await sequelize.query('DROP TABLE IF EXISTS tasks CASCADE;');
        console.log('🗑️ Таблица tasks удалена');
        
        // Пересоздаем модели
        await sequelize.sync({ force: true });
        console.log('✅ Таблицы пересозданы с новым ENUM');
        
      } catch (recreateError) {
        console.error('❌ Ошибка пересоздания таблицы:', recreateError);
      }
    }
  } finally {
    await sequelize.close();
    console.log('🔌 Соединение с базой данных закрыто');
    process.exit(0);
  }
};

// Запускаем скрипт
updateTaskEnum(); 