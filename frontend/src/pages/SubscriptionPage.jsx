import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/SubscriptionPage.scss';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadPlans();
    if (user) {
      loadUserSubscription();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const response = await api.get('/subscription/plans');
      setPlans(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки тарифов:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscription = async () => {
    try {
      const response = await api.get('/subscription/me');
      setUserSubscription(response.data.data);
    } catch (error) {
      console.error('Ошибка загрузки подписки:', error);
    }
  };

  const handlePurchase = async (planId) => {
    if (!user) {
      alert('Необходимо войти в аккаунт');
      return;
    }

    if (user.role !== 'executor') {
      alert('ПРО подписка доступна только исполнителям');
      return;
    }

    setPurchasing(planId);

    try {
      const response = await api.post('/subscription/create-payment', {
        type: planId
      });

      if (response.data.success) {
        // Перенаправляем на страницу оплаты YooKassa
        window.location.href = response.data.data.paymentUrl;
      }
    } catch (error) {
      console.error('Ошибка создания платежа:', error);
      alert(error.response?.data?.message || 'Ошибка создания платежа');
    } finally {
      setPurchasing(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Вы уверены, что хотите отменить ПРО подписку?')) {
      return;
    }

    try {
      const response = await api.post('/subscription/cancel');
      if (response.data.success) {
        alert('Подписка отменена');
        loadUserSubscription();
      }
    } catch (error) {
      console.error('Ошибка отмены подписки:', error);
      alert('Ошибка отмены подписки');
    }
  };

  if (loading) {
    return (
      <div className="subscription-page">
        <div className="loading">Загрузка тарифов...</div>
      </div>
    );
  }

  return (
    <div className="subscription-page">
      <div className="container">
        <div className="subscription-header">
          <h1>⭐ ПРО подписка для исполнителей</h1>
          <p>Получайте больше заказов и зарабатывайте с Luggo ПРО!</p>
        </div>

        {user && user.role === 'executor' && userSubscription?.hasPro && (
          <div className="current-subscription">
            <div className="pro-badge">
              <span className="icon">💎</span>
              <div className="info">
                <h3>Активная ПРО подписка</h3>
                <p>Действует до: {new Date(userSubscription.proExpiresAt).toLocaleDateString('ru-RU')}</p>
                <p>Тип: {userSubscription.proType === 'pro' ? 'ПРО' : 'ПРО Плюс'}</p>
              </div>
            </div>
            <button 
              className="cancel-btn"
              onClick={handleCancelSubscription}
            >
              Отменить подписку
            </button>
          </div>
        )}

        <div className="plans-grid">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">Популярный</div>
              )}
              
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="price">
                  <span className="amount">{plan.price}</span>
                  <span className="currency">₽</span>
                  <span className="period">/{plan.period}</span>
                </div>
              </div>

              <div className="features">
                {plan.features.map((feature, index) => (
                  <div key={index} className="feature">
                    <span className="check">✅</span>
                    {feature}
                  </div>
                ))}
              </div>

              <button
                className={`purchase-btn ${purchasing === plan.id ? 'loading' : ''}`}
                onClick={() => handlePurchase(plan.id)}
                disabled={
                  purchasing === plan.id || 
                  !user || 
                  user.role !== 'executor' ||
                  (userSubscription?.hasPro && userSubscription?.proType === plan.id)
                }
              >
                {purchasing === plan.id ? (
                  'Создание платежа...'
                ) : userSubscription?.hasPro && userSubscription?.proType === plan.id ? (
                  'Активна'
                ) : user?.role !== 'executor' ? (
                  'Только для исполнителей'
                ) : !user ? (
                  'Войдите в аккаунт'
                ) : (
                  'Купить'
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="benefits-section">
          <h2>🎯 Почему стоит купить ПРО?</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-icon">📱</div>
              <h3>Мгновенные уведомления</h3>
              <p>Первым узнавайте о новых заявках через Telegram бота</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">⚡</div>
              <h3>Приоритет в поиске</h3>
              <p>Ваш профиль будет показываться выше в списке исполнителей</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">💰</div>
              <h3>Больше заказов</h3>
              <p>ПРО исполнители получают в 3 раза больше откликов</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🏆</div>
              <h3>Статус эксперта</h3>
              <p>ПРО бейдж повышает доверие заказчиков</p>
            </div>
          </div>
        </div>

        <div className="faq-section">
          <h2>❓ Частые вопросы</h2>
          <div className="faq-list">
            <div className="faq-item">
              <h4>Можно ли отменить подписку?</h4>
              <p>Да, вы можете отменить подписку в любой момент. Доступ к ПРО функциям сохранится до конца оплаченного периода.</p>
            </div>
            <div className="faq-item">
              <h4>Что происходит после окончания подписки?</h4>
              <p>После окончания подписки вы перестанете получать уведомления о новых заявках, но сможете продолжить работу с уже принятыми заказами.</p>
            </div>
            <div className="faq-item">
              <h4>Безопасна ли оплата?</h4>
              <p>Мы используем надежную платежную систему YooKassa. Все платежи защищены и проходят через безопасные каналы.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage; 