const express = require('express')
const router = express.Router()
const {
  getPublishedNews,
  getNewsBySlug,
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getPopularTags
} = require('../controllers/newsController')
const { protect } = require('../middleware/authMiddleware')

// Публичные маршруты
router.get('/', getPublishedNews)                    // GET /api/news - все опубликованные новости
router.get('/tags', getPopularTags)                 // GET /api/news/tags - популярные теги
router.get('/:slug', getNewsBySlug)                 // GET /api/news/:slug - новость по slug

// Админские маршруты (требуют авторизации)
router.get('/admin/all', protect, getAllNews)       // GET /api/news/admin/all - все новости для админки
router.get('/admin/:id', protect, getNewsById)      // GET /api/news/admin/:id - новость по ID
router.post('/admin', protect, createNews)          // POST /api/news/admin - создать новость
router.put('/admin/:id', protect, updateNews)       // PUT /api/news/admin/:id - обновить новость
router.delete('/admin/:id', protect, deleteNews)    // DELETE /api/news/admin/:id - удалить новость

module.exports = router 