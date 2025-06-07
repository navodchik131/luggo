const { User, Subscription } = require('../models');
const { Op } = require('sequelize');

class SubscriptionService {
  
  // Проверка активной ПРО подписки
  static async checkProStatus(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Subscription,
          as: 'activeSubscription',
          where: {
            status: 'active',
            endDate: {
              [Op.gt]: new Date()
            }
          },
          required: false
        }]
      });

      if (!user) return false;

      const hasActivePro = user.activeSubscription && 
                          user.hasPro && 
                          user.proExpiresAt > new Date();

      return hasActivePro;
    } catch (error) {
      console.error('❌ Ошибка проверки ПРО статуса:', error);
      return false;
    }
  }

  // Создание новой подписки
  static async createSubscription(userId, type = 'pro', amount) {
    try {
      const subscription = await Subscription.create({
        userId,
        type,
        amount,
        status: 'pending'
      });

      return subscription;
    } catch (error) {
      console.error('❌ Ошибка создания подписки:', error);
      throw error;
    }
  }

  // Активация подписки после оплаты
  static async activateSubscription(subscriptionId, paymentData) {
    try {
      const subscription = await Subscription.findByPk(subscriptionId);
      if (!subscription) {
        throw new Error('Подписка не найдена');
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // +1 месяц

      // Обновляем подписку
      await subscription.update({
        status: 'active',
        startDate,
        endDate,
        paymentId: paymentData.paymentId,
        paymentSystem: paymentData.paymentSystem,
        paymentData
      });

      // Обновляем пользователя
      await User.update({
        hasPro: true,
        proExpiresAt: endDate,
        proType: subscription.type
      }, {
        where: { id: subscription.userId }
      });

      console.log(`✅ ПРО подписка активирована для пользователя ${subscription.userId}`);
      return subscription;
    } catch (error) {
      console.error('❌ Ошибка активации подписки:', error);
      throw error;
    }
  }

  // Отмена подписки
  static async cancelSubscription(userId) {
    try {
      // Деактивируем текущую подписку
      await Subscription.update({
        status: 'cancelled'
      }, {
        where: {
          userId,
          status: 'active'
        }
      });

      // Обновляем пользователя
      await User.update({
        hasPro: false,
        proExpiresAt: null,
        proType: null
      }, {
        where: { id: userId }
      });

      console.log(`❌ ПРО подписка отменена для пользователя ${userId}`);
    } catch (error) {
      console.error('❌ Ошибка отмены подписки:', error);
      throw error;
    }
  }

  // Проверка истёкших подписок (для cron задач)
  static async checkExpiredSubscriptions() {
    try {
      const expiredUsers = await User.findAll({
        where: {
          hasPro: true,
          proExpiresAt: {
            [Op.lt]: new Date()
          }
        }
      });

      for (const user of expiredUsers) {
        await User.update({
          hasPro: false,
          proExpiresAt: null,
          proType: null
        }, {
          where: { id: user.id }
        });

        await Subscription.update({
          status: 'expired'
        }, {
          where: {
            userId: user.id,
            status: 'active'
          }
        });

        console.log(`⏰ ПРО подписка истекла у пользователя ${user.email}`);
      }

      return expiredUsers.length;
    } catch (error) {
      console.error('❌ Ошибка проверки истёкших подписок:', error);
      return 0;
    }
  }

  // Получение информации о подписке пользователя
  static async getUserSubscriptionInfo(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Subscription,
          as: 'subscriptions',
          order: [['createdAt', 'DESC']]
        }]
      });

      if (!user) return null;

      return {
        hasPro: user.hasPro,
        proType: user.proType,
        proExpiresAt: user.proExpiresAt,
        subscriptions: user.subscriptions
      };
    } catch (error) {
      console.error('❌ Ошибка получения информации о подписке:', error);
      return null;
    }
  }
}

module.exports = SubscriptionService; 