require('dotenv').config();
const { User } = require('../src/models');
const { initializeDatabase } = require('../src/config/init');

const createAdminUser = async () => {
  try {
    console.log('🔌 Подключение к базе данных...');
    await initializeDatabase();

    // Парсим аргументы командной строки
    const args = process.argv.slice(2);
    const emailArg = args.find(arg => arg.startsWith('--email='));
    const passwordArg = args.find(arg => arg.startsWith('--password='));
    const nameArg = args.find(arg => arg.startsWith('--name='));
    const phoneArg = args.find(arg => arg.startsWith('--phone='));

    // Дефолтные значения или из аргументов
    const adminData = {
      email: emailArg ? emailArg.split('=')[1] : 'admin@luggo.ru',
      password: passwordArg ? passwordArg.split('=')[1] : 'LuggoAdmin2025!',
      name: nameArg ? nameArg.split('=')[1] : 'Главный Администратор',
      phone: phoneArg ? phoneArg.split('=')[1] : '79991234567',
      role: 'admin'
    };

    // Проверяем, есть ли уже администратор с таким email
    const existingAdmin = await User.findOne({ where: { email: adminData.email } });
    if (existingAdmin) {
      console.log('⚠️  Пользователь с таким email уже существует:', existingAdmin.email);
      console.log('🔍 Роль:', existingAdmin.role);
      
      if (existingAdmin.role !== 'admin') {
        console.log('🔄 Обновляю роль до администратора...');
        await existingAdmin.update({ role: 'admin' });
        console.log('✅ Роль успешно обновлена до администратора!');
      }
      return;
    }

    // Создаем администратора
    const admin = await User.create(adminData);
    
    console.log('\n🎉 Администратор успешно создан!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Пароль:', adminData.password);
    console.log('👤 Имя:', admin.name);
    console.log('📱 Телефон:', admin.phone);
    console.log('🆔 ID:', admin.id);
    console.log('\n🚀 Теперь можно войти в админ-панель: https://luggo.ru/admin');
    
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
  } finally {
    process.exit(0);
  }
};

// Показываем справку если запрашивают
if (process.argv.includes('--help')) {
  console.log(`
🔧 Создание администратора Luggo

Использование:
  node createAdmin.js [опции]

Опции:
  --email=admin@example.com    Email администратора (по умолчанию: admin@luggo.ru)
  --password=securePassword    Пароль (по умолчанию: LuggoAdmin2025!)
  --name="Имя Админа"          Имя администратора
  --phone=79001234567          Телефон администратора
  --help                       Показать эту справку

Примеры:
  node createAdmin.js
  node createAdmin.js --email=boss@luggo.ru --password=MySecurePass123
  node createAdmin.js --name="Иван Иванов" --phone=79123456789
  `);
  process.exit(0);
}

createAdminUser(); 