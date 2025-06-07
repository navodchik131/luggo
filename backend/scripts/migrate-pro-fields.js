const { sequelize } = require('../src/config/database');

async function migratePROFields() {
  try {
    console.log('🔄 Подключение к базе данных...');
    await sequelize.authenticate();
    console.log('✅ Подключение установлено');

    console.log('🔄 Добавление поля hasPro...');
    await sequelize.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS hasPro BOOLEAN DEFAULT FALSE NOT NULL;
    `);

    console.log('🔄 Добавление поля proExpiresAt...');
    await sequelize.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS proExpiresAt TIMESTAMP NULL;
    `);

    console.log('🔄 Добавление поля proType...');
    await sequelize.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS proType VARCHAR(20) NULL;
    `);

    console.log('🔄 Создание enum типа...');
    await sequelize.query(`
      DO $$ BEGIN
          CREATE TYPE "enum_users_proType" AS ENUM ('pro', 'pro_plus');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    console.log('🔄 Применение enum типа к колонке...');
    await sequelize.query(`
      ALTER TABLE users ALTER COLUMN proType TYPE "enum_users_proType" USING proType::"enum_users_proType";
    `);

    console.log('🔄 Добавление комментариев...');
    await sequelize.query(`
      COMMENT ON COLUMN users.hasPro IS 'Есть ли активная ПРО подписка';
    `);
    await sequelize.query(`
      COMMENT ON COLUMN users.proExpiresAt IS 'Дата окончания ПРО подписки';
    `);
    await sequelize.query(`
      COMMENT ON COLUMN users.proType IS 'Тип активной ПРО подписки';
    `);

    console.log('✅ Миграция PRO полей выполнена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error.message);
    console.error('Детали:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

migratePROFields(); 