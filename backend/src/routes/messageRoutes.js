const express = require('express');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Получение сообщений для задачи
router.get('/task/:taskId', protect, (req, res) => {
  res.json({ message: `Получение сообщений для задачи ${req.params.taskId}` });
});

// Отправка сообщения
router.post('/', protect, (req, res) => {
  res.json({ message: 'Отправка сообщения' });
});

// Отметка сообщений как прочитанных
router.put('/read/:taskId', protect, (req, res) => {
  res.json({ message: `Отметка сообщений как прочитанных для задачи ${req.params.taskId}` });
});

module.exports = router; 