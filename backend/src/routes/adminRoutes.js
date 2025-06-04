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

module.exports = router; 