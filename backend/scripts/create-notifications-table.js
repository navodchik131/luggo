const { sequelize } = require('../src/config/database');

async function createNotificationsTable() {
  try {
    console.log('🔄 Создаю таблицу notifications...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN (
          'new_bid', 'bid_accepted', 'bid_rejected', 'new_message', 
          'task_status_changed', 'new_task', 'task_completed', 
          'review_received', 'system'
        )),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        "isRead" BOOLEAN DEFAULT FALSE NOT NULL,
        "actionUrl" VARCHAR(500),
        "relatedType" VARCHAR(50) CHECK ("relatedType" IN ('task', 'bid', 'message', 'review', 'user')),
        "relatedId" UUID,
        metadata JSON,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('🔄 Создаю индексы для notifications...');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
      ON notifications("userId", "isRead", "createdAt");
    `);
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_type 
      ON notifications("userId", type);
    `);
    
    console.log('✅ Таблица notifications успешно создана');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при создании таблицы notifications:', error);
    process.exit(1);
  }
}

createNotificationsTable(); 