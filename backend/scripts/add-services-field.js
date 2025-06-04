const { sequelize } = require('../src/config/database');

async function addServicesField() {
  try {
    console.log('🔄 Добавляю поле services в таблицу users...');
    
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS services JSON;
    `);
    
    console.log('✅ Поле services успешно добавлено');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при добавлении поля services:', error);
    process.exit(1);
  }
}

addServicesField(); 