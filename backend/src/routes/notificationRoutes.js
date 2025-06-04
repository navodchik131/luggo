const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

const router = express.Router();

// Все маршруты требуют авторизации
router.use(protect);

// Получение уведомлений пользователя
router.get('/', getNotifications);

// Получение количества непрочитанных уведомлений
router.get('/unread-count', getUnreadCount);

// Отметить все уведомления как прочитанные
router.put('/mark-all-read', markAllAsRead);

// Отметить конкретное уведомление как прочитанное
router.put('/:id/read', markAsRead);

// Удалить уведомление
router.delete('/:id', deleteNotification);

module.exports = router; 