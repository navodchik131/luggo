// Логирование вынесено в отдельные console.log для упрощения
const { News, User } = require('../models')
const { Op } = require('sequelize')

// Получить все опубликованные новости (публичный эндпоинт)
const getPublishedNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query
    const offset = (page - 1) * limit

    const whereCondition = {
      status: 'published',
      publishedAt: {
        [Op.lte]: new Date()
      }
    }

    // Фильтр по тегам
    if (tag) {
      whereCondition.tags = {
        [Op.contains]: [tag]
      }
    }

    const { count, rows: news } = await News.findAndCountAll({
      where: whereCondition,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('Ошибка получения новостей:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения новостей'
    })
  }
}

// Получить новость по slug (публичный эндпоинт)
const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const news = await News.findOne({
      where: {
        slug,
        status: 'published',
        publishedAt: {
          [Op.lte]: new Date()
        }
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }]
    })

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Новость не найдена'
      })
    }

    // Увеличиваем счетчик просмотров
    await news.increment('views')
    news.views += 1

    res.json({
      success: true,
      data: news
    })
  } catch (error) {
    console.error('Ошибка получения новости:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения новости'
    })
  }
}

// Получить все новости для админки
const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query
    const offset = (page - 1) * limit

    const whereCondition = {}

    // Фильтр по статусу
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      whereCondition.status = status
    }

    // Поиск по заголовку
    if (search) {
      whereCondition.title = {
        [Op.iLike]: `%${search}%`
      }
    }

    const { count, rows: news } = await News.findAndCountAll({
      where: whereCondition,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    })
  } catch (error) {
    console.error('Ошибка получения новостей для админки:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения новостей'
    })
  }
}

// Получить новость по ID для редактирования
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params

    const news = await News.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }]
    })

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Новость не найдена'
      })
    }

    res.json({
      success: true,
      data: news
    })
  } catch (error) {
    console.error('Ошибка получения новости по ID:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения новости'
    })
  }
}

// Создать новость
const createNews = async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      imageUrl,
      status = 'draft',
      tags = []
    } = req.body

    const authorId = req.user.id

    // Проверяем права доступа
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для создания новостей'
      })
    }

    // Валидация
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Заголовок и содержимое обязательны'
      })
    }

    const newsData = {
      title,
      slug,
      excerpt,
      content,
      imageUrl,
      status,
      tags: Array.isArray(tags) ? tags : [],
      authorId
    }

    const news = await News.create(newsData)

    // Получаем созданную новость с автором
    const createdNews = await News.findByPk(news.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }]
    })

    res.status(201).json({
      success: true,
      message: 'Новость создана',
      data: createdNews
    })
  } catch (error) {
    console.error('Ошибка создания новости:', error)
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Новость с таким slug уже существует'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка создания новости'
    })
  }
}

// Обновить новость
const updateNews = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      slug,
      excerpt,
      content,
      imageUrl,
      status,
      tags
    } = req.body

    // Проверяем права доступа
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для редактирования новостей'
      })
    }

    const news = await News.findByPk(id)

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Новость не найдена'
      })
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (slug !== undefined) updateData.slug = slug
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (content !== undefined) updateData.content = content
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (status !== undefined) updateData.status = status
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : []

    await news.update(updateData)

    // Получаем обновленную новость с автором
    const updatedNews = await News.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'avatar']
      }]
    })

    res.json({
      success: true,
      message: 'Новость обновлена',
      data: updatedNews
    })
  } catch (error) {
    console.error('Ошибка обновления новости:', error)
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Новость с таким slug уже существует'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка обновления новости'
    })
  }
}

// Удалить новость
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params

    // Проверяем права доступа
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для удаления новостей'
      })
    }

    const news = await News.findByPk(id)

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Новость не найдена'
      })
    }

    await news.destroy()

    res.json({
      success: true,
      message: 'Новость удалена'
    })
  } catch (error) {
    console.error('Ошибка удаления новости:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления новости'
    })
  }
}

// Получить популярные теги
const getPopularTags = async (req, res) => {
  try {
    const news = await News.findAll({
      where: {
        status: 'published',
        tags: {
          [Op.ne]: null
        }
      },
      attributes: ['tags']
    })

    const tagCount = {}
    news.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    })

    const popularTags = Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }))

    res.json({
      success: true,
      data: popularTags
    })
  } catch (error) {
    console.error('Ошибка получения тегов:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения тегов'
    })
  }
}

module.exports = {
  getPublishedNews,
  getNewsBySlug,
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getPopularTags
} 