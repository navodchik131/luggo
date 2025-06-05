const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Валидация для отправки сообщения
const validateSendMessage = [
  body('taskId')
    .notEmpty()
    .withMessage('ID заявки обязателен'),
  body('receiverId')
    .notEmpty()
    .withMessage('ID получателя обязателен'),
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Текст сообщения должен содержать от 1 до 500 символов')
];

// Все маршруты требуют авторизации
router.use(protect);

// GET /api/messages/task/:taskId/user/:userId - получить сообщения между пользователями по заявке
router.get('/task/:taskId/user/:userId', messageController.getMessagesByTaskAndUser);

// POST /api/messages - отправить сообщение
router.post('/', validateSendMessage, messageController.sendMessage);

// GET /api/messages/chats - получить все чаты пользователя
router.get('/chats', messageController.getUserChats);

// GET /api/messages/unread-count - получить количество непрочитанных сообщений
router.get('/unread-count', messageController.getUnreadCount);

// POST /api/messages/mark-read - отметить сообщения как прочитанные
router.post('/mark-read', messageController.markMessagesAsRead);

module.exports = router; 