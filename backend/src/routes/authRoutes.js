const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// ТЕСТОВЫЙ РОУТ: Создание исполнителя для тестирования
router.post('/create-test-executor', async (req, res) => {
  try {
    const { User } = require('../models');
    
    // Проверяем есть ли уже тестовый исполнитель
    let user = await User.findOne({ where: { email: 'test.executor@luggo.ru' } });
    
    if (!user) {
      user = await User.create({
        email: 'test.executor@luggo.ru',
        password: '$2b$10$rQrQrQrQrQrQrQrQrQrQrO', // hash for 'password123'
        name: 'Тестовый Исполнитель',
        phone: '+7 900 123-45-67',
        role: 'executor',
        rating: 4.5,
        isEmailVerified: true
      });
    }
    
    res.json({
      success: true,
      message: 'Тестовый исполнитель создан',
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка создания тестового исполнителя'
    });
  }
});

module.exports = router; 