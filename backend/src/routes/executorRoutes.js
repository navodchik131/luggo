const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getMyJobs,
  startJob,
  completeJob,
  getJobDetails
} = require('../controllers/executorController');

const router = express.Router();

// Middleware для проверки роли исполнителя
const requireExecutorRole = (req, res, next) => {
  if (req.user.role !== 'executor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Доступ разрешен только исполнителям'
    });
  }
  next();
};

// Получение работ исполнителя (принятые заявки)
router.get('/jobs', protect, requireExecutorRole, getMyJobs);

// Получение деталей работы
router.get('/jobs/:taskId', protect, requireExecutorRole, getJobDetails);

// Начать выполнение заявки
router.post('/jobs/:taskId/start', protect, requireExecutorRole, startJob);

// Завершить выполнение заявки
router.post('/jobs/:taskId/complete', protect, requireExecutorRole, completeJob);

module.exports = router; 