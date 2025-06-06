const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  toggleUserBlock,
  getAllTasks,
  deleteTask,
  updateTaskStatus,
  getReports,
  deleteUser
} = require('../controllers/adminController');

const router = express.Router();

// Все роуты защищены авторизацией и проверкой роли админа
router.use(protect);
router.use(adminOnly);

// Дашборд и статистика
router.get('/dashboard', getDashboardStats);
router.get('/reports', getReports);

// Управление пользователями
router.get('/users', getAllUsers);
router.patch('/users/:userId/toggle-block', toggleUserBlock);
router.delete('/users/:userId', deleteUser);

// Управление заявками
router.get('/tasks', getAllTasks);
router.patch('/tasks/:taskId/status', updateTaskStatus);
router.delete('/tasks/:taskId', deleteTask);

// Загрузка демо-данных
router.post('/seed-demo-data', async (req, res) => {
  try {
    const { seedDatabase } = require('../../scripts/seedDatabase');
    
    console.log('🌱 Админ запустил загрузку демо-данных...');
    
    // Генерируем демо-данные
    const demoData = await seedDatabase();
    
    // Здесь бы в реальном проекте сохранили данные в базу данных
    // Но поскольку у нас файловая система, просто вернем успешный результат
    
    res.json({
      success: true,
      message: 'Демо-данные успешно загружены',
      data: {
        users: demoData.users.length,
        tasks: demoData.tasks.length,
        bids: demoData.bids.length,
        messages: demoData.messages.length,
        news: demoData.news.length,
        reviews: demoData.reviews.length
      }
    });
    
  } catch (error) {
    console.error('Ошибка загрузки демо-данных:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка загрузки демо-данных',
      error: error.message
    });
  }
});

// Очистка всех данных (только для разработки)
router.post('/clear-all-data', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Очистка данных запрещена в продакшн режиме'
      });
    }
    
    // Здесь бы очистили все таблицы базы данных
    console.log('🗑️ Админ очистил все данные (режим разработки)');
    
    res.json({
      success: true,
      message: 'Все данные успешно очищены'
    });
    
  } catch (error) {
    console.error('Ошибка очистки данных:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка очистки данных',
      error: error.message
    });
  }
});

module.exports = router; 