const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getExecutors, getExecutorStats, getServices } = require('../controllers/userController');

const router = express.Router();

// Получение списка исполнителей (публичный доступ)
router.get('/executors', getExecutors);

// Получение статистики исполнителей (публичный доступ)
router.get('/executors/stats', getExecutorStats);

// Получение списка услуг (публичный доступ)
router.get('/services', getServices);

// Получение профиля пользователя
router.get('/:id', (req, res) => {
  res.json({ message: `Получение профиля пользователя ${req.params.id}` });
});

// Обновление собственного профиля
router.put('/profile', protect, (req, res) => {
  res.json({ message: 'Обновление профиля' });
});

// Загрузка аватара
router.post('/avatar', protect, (req, res) => {
  res.json({ message: 'Загрузка аватара' });
});

// Получение списка пользователей (только для админа)
router.get('/', protect, restrictTo('admin'), (req, res) => {
  res.json({ message: 'Получение списка пользователей' });
});

// Блокировка пользователя (только для админа)
router.put('/:id/block', protect, restrictTo('admin'), (req, res) => {
  res.json({ message: `Блокировка пользователя ${req.params.id}` });
});

module.exports = router; 