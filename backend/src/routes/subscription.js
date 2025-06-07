const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserSubscription,
  createSubscriptionPayment,
  handlePaymentWebhook,
  checkPaymentStatus,
  cancelSubscription,
  getSubscriptionPlans
} = require('../controllers/subscriptionController');

// Публичные роуты
router.get('/plans', getSubscriptionPlans);
router.post('/webhook/yookassa', handlePaymentWebhook);

// Защищенные роуты (требуют авторизации)
router.get('/me', auth, getUserSubscription);
router.post('/create-payment', auth, createSubscriptionPayment);
router.get('/payment/:paymentId/status', auth, checkPaymentStatus);
router.post('/cancel', auth, cancelSubscription);

module.exports = router; 