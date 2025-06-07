const cron = require('node-cron');
const SubscriptionService = require('../services/subscriptionService');

// Проверка истёкших подписок каждый день в 9:00
const scheduleSubscriptionCheck = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('🕘 Запуск проверки истёкших подписок...');
    
    try {
      const expiredCount = await SubscriptionService.checkExpiredSubscriptions();
      console.log(`✅ Проверка завершена. Истекло подписок: ${expiredCount}`);
    } catch (error) {
      console.error('❌ Ошибка при проверке истёкших подписок:', error);
    }
  });

  console.log('📅 Cron задача для проверки подписок запланирована (каждый день в 9:00)');
};

// Проверка раз в час (для отладки)
const scheduleHourlyCheck = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Почасовая проверка истёкших подписок...');
    
    try {
      const expiredCount = await SubscriptionService.checkExpiredSubscriptions();
      if (expiredCount > 0) {
        console.log(`⏰ Истекло подписок: ${expiredCount}`);
      }
    } catch (error) {
      console.error('❌ Ошибка при почасовой проверке:', error);
    }
  });
};

module.exports = {
  scheduleSubscriptionCheck,
  scheduleHourlyCheck
}; 