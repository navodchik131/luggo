const { YooCheckout } = require('@a2seven/yoo-checkout');
const SubscriptionService = require('./subscriptionService');

class PaymentService {
  constructor() {
    this.yooCheckout = new YooCheckout({
      shopId: process.env.YOOKASSA_SHOP_ID,
      secretKey: process.env.YOOKASSA_SECRET_KEY,
    });
  }

  // Создание платежа для ПРО подписки
  async createSubscriptionPayment(userId, subscriptionType = 'pro') {
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
          return_url: `${process.env.FRONTEND_URL}/subscription/success`
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
        // Можно добавить логику обработки отмененных платежей
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
    try {
      const payment = await this.yooCheckout.getPayment(paymentId);
      return payment;
    } catch (error) {
      console.error('❌ Ошибка получения информации о платеже:', error);
      throw error;
    }
  }

  // Создание возврата (если нужно)
  async createRefund(paymentId, amount, reason = 'Возврат по запросу клиента') {
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