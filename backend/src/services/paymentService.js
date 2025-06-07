const SubscriptionService = require('./subscriptionService');

class PaymentService {
  constructor() {
    this.yooCheckout = null;
    this.initialized = false;
  }

  // Ленивая инициализация - создается только при первом обращении
  _initializeYooKassa() {
    if (this.initialized) return;

    const { YooCheckout } = require('@a2seven/yoo-checkout');
    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    // Проверяем наличие ключей
    if (!shopId || !secretKey) {
      throw new Error('❌ YooKassa credentials не настроены! Добавьте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в .env файл');
    }

    // Проверяем, что это не placeholder значения
    if (shopId === 'your_shop_id' || secretKey === 'your_secret_key') {
      throw new Error(`
❌ YooKassa ключи не настроены!

Для работы платежей нужно:
1. Зарегистрироваться в YooKassa (yookassa.ru)
2. Получить SHOP_ID и SECRET_KEY
3. Добавить их в .env файл:
   YOOKASSA_SHOP_ID=ваш_shop_id
   YOOKASSA_SECRET_KEY=ваш_secret_key

Текущие значения: SHOP_ID="${shopId}", SECRET_KEY="${secretKey}"
      `);
    }

    this.yooCheckout = new YooCheckout({
      shopId: shopId,
      secretKey: secretKey,
    });
    
    this.initialized = true;
    console.log('✅ YooKassa инициализирована с реальными ключами');
  }

  // Создание платежа для ПРО подписки
  async createSubscriptionPayment(userId, subscriptionType = 'pro') {
    this._initializeYooKassa(); // Инициализируем только при использовании
    
    try {
      // Определяем стоимость подписки
      const subscriptionPrices = {
        'pro': 499.00,
        'pro_plus': 999.00
      };

      const amount = subscriptionPrices[subscriptionType];
      if (!amount) {
        throw new Error('Неизвестный тип подписки');
      }

      // Создаем запись подписки в БД
      const subscription = await SubscriptionService.createSubscription(
        userId, 
        subscriptionType, 
        amount
      );

      // Создаем платеж в YooKassa
      const payment = await this.yooCheckout.createPayment({
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        },
        description: `ПРО подписка Luggo (${subscriptionType === 'pro' ? 'ПРО' : 'ПРО Плюс'})`,
        metadata: {
          subscriptionId: subscription.id,
          userId: userId,
          subscriptionType: subscriptionType
        },
        confirmation: {
          type: 'redirect',
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/success`
        },
        capture: true
      });

      console.log(`💳 Создан платеж YooKassa: ${payment.id} на сумму ${amount}₽`);

      return {
        subscription,
        payment,
        paymentUrl: payment.confirmation.confirmation_url
      };

    } catch (error) {
      console.error('❌ Ошибка создания платежа:', error);
      throw error;
    }
  }

  // Обработка webhook от YooKassa
  async handlePaymentWebhook(paymentData) {
    try {
      const { object: payment } = paymentData;
      
      console.log(`🔔 Webhook от YooKassa: ${payment.id}, статус: ${payment.status}`);

      if (payment.status === 'succeeded') {
        const metadata = payment.metadata;
        const subscriptionId = metadata.subscriptionId;

        if (!subscriptionId) {
          console.error('❌ Отсутствует subscriptionId в metadata');
          return false;
        }

        // Активируем подписку
        await SubscriptionService.activateSubscription(subscriptionId, {
          paymentId: payment.id,
          paymentSystem: 'yookassa',
          amount: parseFloat(payment.amount.value),
          paymentMethod: payment.payment_method?.type || 'unknown'
        });

        console.log(`✅ Подписка ${subscriptionId} успешно активирована!`);
        return true;

      } else if (payment.status === 'canceled') {
        console.log(`❌ Платеж ${payment.id} отменен`);
        return false;
      }

      return false;
    } catch (error) {
      console.error('❌ Ошибка обработки webhook:', error);
      return false;
    }
  }

  // Получение информации о платеже
  async getPaymentInfo(paymentId) {
    this._initializeYooKassa();
    
    try {
      const payment = await this.yooCheckout.getPayment(paymentId);
      return payment;
    } catch (error) {
      console.error('❌ Ошибка получения информации о платеже:', error);
      throw error;
    }
  }

  // Создание возврата
  async createRefund(paymentId, amount, reason = 'Возврат по запросу клиента') {
    this._initializeYooKassa();
    
    try {
      const refund = await this.yooCheckout.createRefund({
        payment_id: paymentId,
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB'
        },
        description: reason
      });

      console.log(`💸 Создан возврат: ${refund.id} на сумму ${amount}₽`);
      return refund;
    } catch (error) {
      console.error('❌ Ошибка создания возврата:', error);
      throw error;
    }
  }

  // Проверка статуса платежа
  async checkPaymentStatus(paymentId) {
    this._initializeYooKassa();
    
    try {
      const payment = await this.getPaymentInfo(paymentId);
      return {
        status: payment.status,
        paid: payment.status === 'succeeded',
        amount: parseFloat(payment.amount.value),
        currency: payment.amount.currency,
        createdAt: payment.created_at
      };
    } catch (error) {
      console.error('❌ Ошибка проверки статуса платежа:', error);
      return { status: 'error', paid: false };
    }
  }
}

module.exports = new PaymentService(); 