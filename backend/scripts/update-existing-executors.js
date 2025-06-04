const { User } = require('../src/models');
const { connectDB } = require('../src/config/database');

async function updateExistingExecutors() {
  try {
    await connectDB();
    
    console.log('🔄 Обновляю существующих исполнителей...');
    
    // Найти всех исполнителей без услуг
    const executors = await User.findAll({
      where: {
        role: 'executor',
        services: null
      }
    });
    
    console.log(`Найдено ${executors.length} исполнителей без услуг`);
    
    // Обновить каждого исполнителя с базовым набором услуг
    for (const executor of executors) {
      const defaultServices = ['flat', 'office']; // Даем базовые услуги
      
      await executor.update({
        services: defaultServices
      });
      
      console.log(`✅ Обновлен исполнитель: ${executor.name} (ID: ${executor.id})`);
    }
    
    console.log('✅ Все исполнители обновлены');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при обновлении исполнителей:', error);
    process.exit(1);
  }
}

updateExistingExecutors(); 