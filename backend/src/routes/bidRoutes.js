const express = require('express');
const router = express.Router();
const { 
  getUserBids, 
  acceptBid, 
  updateBid, 
  validateCreateBid 
} = require('../controllers/bidController');
const { protect, executorOnly } = require('../middleware/authMiddleware');

// Получение откликов текущего пользователя (только для исполнителей)
router.get('/bids/my', protect, executorOnly, getUserBids);

// Принятие отклика (только для владельца заявки)
router.patch('/bids/:bidId/accept', protect, acceptBid);

// Обновление отклика (только для исполнителей)
router.patch('/bids/:bidId', protect, executorOnly, validateCreateBid, updateBid);

module.exports = router; 