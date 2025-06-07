const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
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
router.get('/me', protect, getUserSubscription);
router.post('/create-payment', protect, createSubscriptionPayment);
router.get('/payment/:paymentId/status', protect, checkPaymentStatus);
router.post('/cancel', protect, cancelSubscription);

module.exports = router; 