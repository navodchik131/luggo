const TelegramBot = require('node-telegram-bot-api');
const { TelegramUser, User } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Токен бота (нужно будет добавить в .env)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен в переменных окружения');
  process.exit(1);
}

// Проверяем, отключен ли бот
if (process.env.TELEGRAM_BOT_DISABLED) {
  console.log('🔇 Telegram бот отключен (TELEGRAM_BOT_DISABLED=true) в telegramBot.js');
  
  // Экспортируем пустые заглушки
  module.exports = {
    bot: null,
    sendTaskNotification: () => console.log('🔇 Telegram уведомления отключены')
  };
  return;
}

// Выбор режима в зависимости от окружения
const isProduction = process.env.NODE_ENV === 'production';
const WEBHOOK_URL = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/webhook/telegram` : null;

let bot;

// ВРЕМЕННО: принудительно используем polling для отладки
console.log('🔧 ОТЛАДКА: Принудительно включен polling режим');
bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log('🔄 Telegram бот запущен в режиме polling (отладка)');

// Категории заявок
const CATEGORIES = {
  flat: '🏠 Квартирный переезд',
  office: '🏢 Офисный переезд', 
  intercity: '🚛 Межгородский переезд',
  garbage: '🗑️ Вывоз мусора'
};

// Временное хранение состояния авторизации
const authSessions = new Map();

// Приветственное сообщение
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  
  try {
    // Проверяем, есть ли уже пользователь в БД
    let telegramUser = await TelegramUser.findOne({ 
      where: { telegramId },
      include: [{ model: User, as: 'user' }]
    });
    
    if (telegramUser && telegramUser.user) {
      // Пользователь уже авторизован
      await showMainMenu(chatId, telegramUser);
    } else {
      // Новый пользователь или не авторизован
      if (!telegramUser) {
        // Создаем новую запись
        telegramUser = await TelegramUser.create({
          telegramId,
          telegramUsername: msg.from.username,
          telegramFirstName: msg.from.first_name
        });
      }
      
      await showAuthMessage(chatId);
    }
  } catch (error) {
    console.error('Ошибка при обработке /start:', error);
    bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
  }
});

// Показать сообщение авторизации
async function showAuthMessage(chatId) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '🔑 Авторизоваться', callback_data: 'auth_start' }]
    ]
  };
  
  await bot.sendMessage(chatId, 
    `🤖 Добро пожаловать в бота Luggo!\n\n` +
    `Я буду присылать вам уведомления о новых заявках на переезд.\n\n` +
    `Для начала работы необходимо авторизоваться с помощью логина и пароля от сайта.`,
    { reply_markup: keyboard }
  );
}

// Показать главное меню
async function showMainMenu(chatId, telegramUser) {
  if (!telegramUser || !telegramUser.user) {
    console.error('❌ telegramUser или user отсутствует в showMainMenu');
    await bot.sendMessage(chatId, '❌ Ошибка загрузки данных пользователя');
    return;
  }
  
  const categories = telegramUser.subscribedCategories || [];
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '⚙️ Настроить категории', callback_data: 'settings_categories' }],
      [{ text: '📋 Мои подписки', callback_data: 'my_subscriptions' }],
      [{ text: categories.length > 0 ? '🔕 Отключить уведомления' : '🔔 Включить уведомления', 
         callback_data: telegramUser.isActive ? 'notifications_off' : 'notifications_on' }],
      [{ text: '❌ Отвязать аккаунт', callback_data: 'logout' }]
    ]
  };
  
  await bot.sendMessage(chatId, 
    `👋 Привет, ${telegramUser.user.name}!\n\n` +
    `🔔 Уведомления: ${telegramUser.isActive ? 'Включены' : 'Отключены'}\n` +
    `📂 Подписок на категории: ${categories.length}\n\n` +
    `Выберите действие:`,
    { reply_markup: keyboard }
  );
}

// Обработка callback запросов
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const telegramId = query.from.id.toString();
  const data = query.data;
  
  try {
    await bot.answerCallbackQuery(query.id);
    
    if (data === 'auth_start') {
      // Начинаем процесс авторизации
      authSessions.set(telegramId, { step: 'email' });
      await bot.sendMessage(chatId, '📧 Введите ваш email от аккаунта Luggo:');
      
    } else if (data === 'settings_categories') {
      await showCategoriesSettings(chatId, telegramId);
      
    } else if (data === 'my_subscriptions') {
      await showSubscriptions(chatId, telegramId);
      
    } else if (data === 'notifications_on' || data === 'notifications_off') {
      await toggleNotifications(chatId, telegramId, data === 'notifications_on');
      
    } else if (data === 'logout') {
      await logoutUser(chatId, telegramId);
      
    } else if (data.startsWith('category_')) {
      await toggleCategory(chatId, telegramId, data.replace('category_', ''));
      
    } else if (data === 'back_to_menu') {
      const telegramUser = await TelegramUser.findOne({ 
        where: { telegramId },
        include: [{ model: User, as: 'user' }]
      });
      if (telegramUser) {
        await showMainMenu(chatId, telegramUser);
      }
    }
  } catch (error) {
    console.error('Ошибка при обработке callback:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
  }
});

// Обработка текстовых сообщений (для авторизации)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const text = msg.text;
  
  // Пропускаем команды
  if (text && text.startsWith('/')) return;
  
  const session = authSessions.get(telegramId);
  if (!session) return;
  
  try {
    if (session.step === 'email') {
      session.email = text.trim();
      session.step = 'password';
      await bot.sendMessage(chatId, '🔐 Теперь введите ваш пароль:');
      
    } else if (session.step === 'password') {
      const { email } = session;
      const password = text.trim();
      
      // Ищем пользователя в БД
      const user = await User.findOne({ where: { email } });
      
      console.log(`🔍 Telegram авторизация: email=${email}`);
      
      if (!user) {
        console.log(`❌ Пользователь не найден: ${email}`);
        await bot.sendMessage(chatId, '❌ Пользователь с таким email не найден.');
        authSessions.delete(telegramId);
        await showAuthMessage(chatId);
        return;
      }
      
      console.log(`👤 Найден пользователь: ${user.name}, роль: "${user.role}"`);
      
      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log(`❌ Неверный пароль для: ${email}`);
        await bot.sendMessage(chatId, '❌ Неверный пароль.');
        authSessions.delete(telegramId);
        await showAuthMessage(chatId);
        return;
      }
      
      console.log(`✅ Пароль верный для: ${email}`);
      
      // Проверяем роль пользователя
      if (user.role !== 'executor') {
        console.log(`❌ Неверная роль: "${user.role}" !== "executor" для ${email}`);
        await bot.sendMessage(chatId, '❌ Доступ только для исполнителей.');
        authSessions.delete(telegramId);
        await showAuthMessage(chatId);
        return;
      }
      
      console.log(`✅ Роль исполнителя подтверждена для: ${email}`);
      
      // Успешная авторизация
      await TelegramUser.update(
        { userId: user.id, lastActiveAt: new Date() },
        { where: { telegramId } }
      );
      
      authSessions.delete(telegramId);
      
      const telegramUser = await TelegramUser.findOne({ 
        where: { telegramId },
        include: [{ model: User, as: 'user' }]
      });
      
      if (!telegramUser) {
        console.error('❌ Не удалось найти telegramUser после авторизации');
        await bot.sendMessage(chatId, '❌ Произошла ошибка при авторизации.');
        return;
      }
      
      await bot.sendMessage(chatId, '✅ Авторизация успешна!');
      await showMainMenu(chatId, telegramUser);
    }
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при авторизации.');
    authSessions.delete(telegramId);
  }
});

// Показать настройки категорий
async function showCategoriesSettings(chatId, telegramId) {
  const telegramUser = await TelegramUser.findOne({ where: { telegramId } });
  const subscribedCategories = telegramUser.subscribedCategories || [];
  
  const keyboard = {
    inline_keyboard: [
      ...Object.entries(CATEGORIES).map(([key, label]) => [
        { 
          text: `${subscribedCategories.includes(key) ? '✅' : '❌'} ${label}`, 
          callback_data: `category_${key}` 
        }
      ]),
      [{ text: '🔙 Назад в меню', callback_data: 'back_to_menu' }]
    ]
  };
  
  await bot.sendMessage(chatId, 
    '⚙️ Настройка категорий уведомлений:\n\n' +
    'Выберите категории заявок, о которых хотите получать уведомления:',
    { reply_markup: keyboard }
  );
}

// Показать подписки
async function showSubscriptions(chatId, telegramId) {
  const telegramUser = await TelegramUser.findOne({ where: { telegramId } });
  const subscribedCategories = telegramUser.subscribedCategories || [];
  
  let message = '📋 Ваши подписки:\n\n';
  
  if (subscribedCategories.length === 0) {
    message += 'У вас нет активных подписок.\n\n';
  } else {
    subscribedCategories.forEach(category => {
      message += `✅ ${CATEGORIES[category]}\n`;
    });
    message += '\n';
  }
  
  const keyboard = {
    inline_keyboard: [
      [{ text: '⚙️ Настроить категории', callback_data: 'settings_categories' }],
      [{ text: '🔙 Назад в меню', callback_data: 'back_to_menu' }]
    ]
  };
  
  await bot.sendMessage(chatId, message, { reply_markup: keyboard });
}

// Переключить категорию
async function toggleCategory(chatId, telegramId, category) {
  const telegramUser = await TelegramUser.findOne({ where: { telegramId } });
  let subscribedCategories = telegramUser.subscribedCategories || [];
  
  if (subscribedCategories.includes(category)) {
    subscribedCategories = subscribedCategories.filter(c => c !== category);
  } else {
    subscribedCategories.push(category);
  }
  
  await TelegramUser.update(
    { subscribedCategories },
    { where: { telegramId } }
  );
  
  await showCategoriesSettings(chatId, telegramId);
}

// Переключить уведомления
async function toggleNotifications(chatId, telegramId, isActive) {
  await TelegramUser.update(
    { isActive },
    { where: { telegramId } }
  );
  
  const telegramUser = await TelegramUser.findOne({ 
    where: { telegramId },
    include: [{ model: User, as: 'user' }]
  });
  
  await bot.sendMessage(chatId, 
    `🔔 Уведомления ${isActive ? 'включены' : 'отключены'}`
  );
  
  await showMainMenu(chatId, telegramUser);
}

// Выйти из аккаунта
async function logoutUser(chatId, telegramId) {
  await TelegramUser.update(
    { userId: null },
    { where: { telegramId } }
  );
  
  await bot.sendMessage(chatId, '👋 Аккаунт отвязан. До свидания!');
  await showAuthMessage(chatId);
}

// Отправка уведомления о новой заявке
async function sendTaskNotification(task) {
  try {
    console.log('📤 Начинаем отправку уведомлений о заявке:', task.id);
    
    // Находим всех исполнителей с активными подписками на эту категорию и ПРО аккаунтом
    const telegramUsers = await TelegramUser.findAll({
      where: {
        isActive: true,
        subscribedCategories: {
          [Op.contains]: [task.category]
        }
      },
      include: [{
        model: User,
        as: 'user',
        where: {
          role: 'executor',
          hasPro: true,  // 🎯 Только ПРО пользователи!
          proExpiresAt: {
            [Op.gt]: new Date()  // ПРО подписка не истекла
          }
        }
      }]
    });

    if (telegramUsers.length === 0) {
      console.log('📭 Нет исполнителей с ПРО подпиской для категории:', task.category);
      return;
    }

    console.log(`📤 Найдено ${telegramUsers.length} ПРО исполнителей для уведомления`);

    // Формируем сообщение
    const categoryNames = {
      'flat': '🏠 Квартирный переезд',
      'office': '🏢 Офисный переезд', 
      'intercity': '🚚 Межгородской переезд',
      'garbage': '🗑️ Вывоз мусора'
    };

    const message = `🔥 *Новая заявка!*\n\n` +
      `📋 *${task.title}*\n` +
      `📍 Откуда: ${task.fromAddress}\n` +
      `📍 Куда: ${task.toAddress}\n` +
      `📅 Дата: ${new Date(task.date).toLocaleDateString('ru-RU')}\n` +
      `🏷️ Категория: ${categoryNames[task.category] || task.category}\n\n` +
      `💰 *Только для ПРО пользователей!*\n\n` +
      `👀 [Посмотреть заявку](${process.env.FRONTEND_URL}/tasks/${task.id})`;

    // Отправляем уведомления
    for (const telegramUser of telegramUsers) {
      try {
        await bot.sendMessage(telegramUser.telegramId, message, {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [[
              { text: '👀 Посмотреть', url: `${process.env.FRONTEND_URL}/tasks/${task.id}` },
              { text: '💼 Откликнуться', url: `${process.env.FRONTEND_URL}/tasks/${task.id}#bid` }
            ]]
          }
        });
        console.log(`✅ Уведомление отправлено: @${telegramUser.user.name}`);
      } catch (error) {
        console.error(`❌ Ошибка отправки пользователю ${telegramUser.telegramId}:`, error.message);
      }
    }

    console.log('🎉 Уведомления отправлены всем ПРО исполнителям');
  } catch (error) {
    console.error('❌ Ошибка отправки уведомлений:', error);
  }
}

module.exports = {
  bot,
  sendTaskNotification
}; 