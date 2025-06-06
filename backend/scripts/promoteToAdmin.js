require('dotenv').config();
const { User } = require('../src/models');
const { initializeDatabase } = require('../src/config/init');

const promoteToAdmin = async () => {
  try {
    console.log('🔌 Подключение к базе данных...');
    await initializeDatabase();

    // Получаем email из аргументов
    const args = process.argv.slice(2);
    const email = args[0];

    if (!email) {
      console.log('❌ Укажите email пользователя для повышения до администратора');
      console.log('Использование: node promoteToAdmin.js user@example.com');
      process.exit(1);
    }

    // Ищем пользователя
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ Пользователь с email', email, 'не найден');
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log('✅ Пользователь', email, 'уже является администратором');
      process.exit(0);
    }

    // Повышаем до админа
    const oldRole = user.role;
    await user.update({ role: 'admin' });
    
    console.log('🎉 Пользователь успешно повышен до администратора!');
    console.log('👤 Имя:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔄 Старая роль:', oldRole);
    console.log('🚀 Новая роль: admin');
    console.log('\n🌐 Теперь пользователь может зайти в админ-панель: https://luggo.ru/admin');
    
  } catch (error) {
    console.error('❌ Ошибка при повышении пользователя:', error);
  } finally {
    process.exit(0);
  }
};

// Показываем справку
if (process.argv.includes('--help') || process.argv.length < 3) {
  console.log(`
🔧 Повышение пользователя до администратора

Использование:
  node promoteToAdmin.js <email>

Примеры:
  node promoteToAdmin.js user@example.com
  node promoteToAdmin.js manager@luggo.ru

Этот скрипт найдет пользователя по email и даст ему права администратора.
  `);
  process.exit(0);
}

promoteToAdmin(); 