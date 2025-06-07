const { bot } = require('./telegramBot');

console.log('🤖 Запуск Telegram бота...');

// Обработка ошибок бота
bot.on('error', (error) => {
  console.error('Ошибка Telegram бота:', error);
});

bot.on('polling_error', (error) => {
  console.error('Ошибка polling Telegram бота:', error);
});

console.log('✅ Telegram бот запущен и ожидает сообщения');

module.exports = { bot }; 