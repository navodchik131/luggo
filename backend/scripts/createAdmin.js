require('dotenv').config();
const { User } = require('../src/models');
const { initializeDatabase } = require('../src/config/init');

const createAdminUser = async () => {
  try {
    console.log('🔌 Подключение к базе данных...');
    await initializeDatabase();

    // Проверяем, есть ли уже администратор
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      console.log('✅ Администратор уже существует:', existingAdmin.email);
      return;
    }

    // Создаем администратора
    const adminData = {
      email: 'admin@luggo.ru',
      password: 'admin123456',
      name: 'Администратор',
      phone: '79991234567',
      role: 'admin'
    };

    const admin = await User.create(adminData);
    
    console.log('✅ Администратор успешно создан!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Пароль: admin123456');
    console.log('👤 ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
  } finally {
    process.exit(0);
  }
};

createAdminUser(); 