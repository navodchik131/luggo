const express = require('express');
const { protect, optionalAuth, executorOnly } = require('../middleware/authMiddleware');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getUserTasks,
  validateCreateTask
} = require('../controllers/taskController');

const { 
  createBid, 
  getBidsForTask, 
  acceptBid, 
  updateBid, 
  validateCreateBid 
} = require('../controllers/bidController');

const router = express.Router();

// Получение всех задач (с опциональной авторизацией)
router.get('/', optionalAuth, getTasks);

// Получение заявок текущего пользователя (только для авторизованных)
router.get('/my', protect, getUserTasks);

// Получение конкретной задачи
router.get('/:id', optionalAuth, getTaskById);

// Создание новой задачи (только для авторизованных пользователей)
router.post('/', protect, validateCreateTask, createTask);

// Обновление задачи (только для автора)
router.put('/:id', protect, validateCreateTask, updateTask);

// Удаление задачи (только для автора)
router.delete('/:id', protect, deleteTask);

// Роуты откликов для задач
// Создание отклика на заявку (только для исполнителей)
router.post('/:taskId/bids', protect, executorOnly, validateCreateBid, createBid);

// Получение откликов для конкретной заявки
router.get('/:taskId/bids', getBidsForTask);

module.exports = router; 