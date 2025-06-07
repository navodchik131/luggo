const SubscriptionService = require('../services/subscriptionService');
const PaymentService = require('../services/paymentService');
const { User } = require('../models');

// Получение информации о подписке пользователя
const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscriptionInfo = await SubscriptionService.getUserSubscriptionInfo(userId);
    
    if (!subscriptionInfo) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      data: subscriptionInfo
    });
  } catch (error) {
    console.error('❌ Ошибка получения подписки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

// Создание платежа для ПРО подписки
const createSubscriptionPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'pro' } = req.body;

    // Проверяем роль пользователя
    if (req.user.role !== 'executor') {
      return res.status(403).json({
        success: false,
        message: 'ПРО подписка доступна только исполнителям'
      });
    }

    // Проверяем, есть ли уже активная подписка
    const hasActivePro = await SubscriptionService.checkProStatus(userId);
    if (hasActivePro) {
      return res.status(400).json({
        success: false,
        message: 'У вас уже есть активная ПРО подписка'
      });
    }

    // Создаем платеж
    const paymentResult = await PaymentService.createSubscriptionPayment(userId, type);

    res.json({
      success: true,
      data: {
        subscriptionId: paymentResult.subscription.id,
        paymentUrl: paymentResult.paymentUrl,
        amount: paymentResult.subscription.amount,
        type: paymentResult.subscription.type
      },
      message: 'Платеж создан. Перенаправляем на оплату...'
    });

  } catch (error) {
    console.error('❌ Ошибка создания платежа:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Ошибка создания платежа'
    });
  }
};

// Webhook от YooKassa
const handlePaymentWebhook = async (req, res) => {
  try {
    console.log('🔔 Получен webhook от YooKassa');
    
    const success = await PaymentService.handlePaymentWebhook(req.body);
    
    if (success) {
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).json({ status: 'error' });
    }
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    res.status(500).json({ status: 'error' });
  }
};

// Проверка статуса платежа
const checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    // Проверяем статус платежа
    const paymentStatus = await PaymentService.checkPaymentStatus(paymentId);

    res.json({
      success: true,
      data: paymentStatus
    });
  } catch (error) {
    console.error('❌ Ошибка проверки статуса платежа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка проверки статуса платежа'
    });
  }
};

// Отмена подписки
const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    // Проверяем, есть ли активная подписка
    const hasActivePro = await SubscriptionService.checkProStatus(userId);
    if (!hasActivePro) {
      return res.status(400).json({
        success: false,
        message: 'У вас нет активной ПРО подписки'
      });
    }

    // Отменяем подписку
    await SubscriptionService.cancelSubscription(userId);

    res.json({
      success: true,
      message: 'ПРО подписка отменена'
    });
  } catch (error) {
    console.error('❌ Ошибка отмены подписки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка отмены подписки'
    });
  }
};

// Получение тарифов подписки
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: 'pro',
        name: 'ПРО',
        price: 499,
        currency: 'RUB',
        period: 'месяц',
        features: [
          '📱 Уведомления в Telegram о новых заявках',
          '⚡ Приоритетный показ в списке исполнителей',
          '📊 Статистика просмотров профиля',
          '💬 Безлимитный чат с заказчиками'
        ],
        popular: true
      },
      {
        id: 'pro_plus',
        name: 'ПРО Плюс',
        price: 999,
        currency: 'RUB',
        period: 'месяц',
        features: [
          '✨ Все возможности ПРО',
          '🎯 Персональный менеджер',
          '📈 Расширенная аналитика',
          '🔝 Топ позиция в поиске',
          '💎 Золотой бейдж исполнителя'
        ],
        popular: false
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('❌ Ошибка получения тарифов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения тарифов'
    });
  }
};

module.exports = {
  getUserSubscription,
  createSubscriptionPayment,
  handlePaymentWebhook,
  checkPaymentStatus,
  cancelSubscription,
  getSubscriptionPlans
}; 