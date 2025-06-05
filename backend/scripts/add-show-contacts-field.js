const { sequelize } = require('../src/config/database');

async function addShowContactsField() {
  try {
    console.log('🔄 Добавляю поле showContacts в таблицу users...');
    
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "showContacts" BOOLEAN DEFAULT TRUE NOT NULL;
    `);
    
    await sequelize.query(`
      COMMENT ON COLUMN users."showContacts" IS 'Показывать ли email и телефон другим пользователям';
    `);
    
    console.log('✅ Поле showContacts успешно добавлено');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при добавлении поля showContacts:', error);
    process.exit(1);
  }
}

addShowContactsField(); 