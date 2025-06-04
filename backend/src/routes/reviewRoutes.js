const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  confirmTaskCompletion,
  createReview,
  getUserReviews,
  validateConfirmCompletion,
  validateCreateReview
} = require('../controllers/reviewController');

const router = express.Router();

// Подтверждение завершения заявки (для заказчиков)
router.post('/confirm/:taskId', protect, validateConfirmCompletion, confirmTaskCompletion);

// Создание отзыва
router.post('/task/:taskId', protect, validateCreateReview, createReview);

// Получение отзывов пользователя
router.get('/user/:userId', getUserReviews);

module.exports = router; 