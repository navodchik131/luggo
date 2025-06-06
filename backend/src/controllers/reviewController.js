import logger from '../utils/logger.js'
const { Review, Task, User, Bid } = require('../models');
const { body, validationResult } = require('express-validator');

// Подтверждение завершения заявки с отзывом
const confirmTaskCompletion = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const { rating, comment, confirmed } = req.body;

    // Находим заявку
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Bid,
          as: 'bids',
          where: { accepted: true },
          include: [
            {
              model: User,
              as: 'executor',
              attributes: ['id', 'name', 'email', 'rating']
            }
          ]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    // Проверяем права доступа
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для подтверждения этой заявки'
      });
    }

    // Проверяем статус заявки
    if (task.status !== 'awaiting_confirmation') {
      return res.status(400).json({
        success: false,
        message: 'Заявка не ожидает подтверждения'
      });
    }

    const acceptedBid = task.bids[0];
    const executorId = acceptedBid.userId;

    // Валидация отзыва
    if (confirmed && rating) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Ошибка валидации данных',
          errors: errors.array()
        });
      }
    }

    if (confirmed) {
      // Подтверждаем завершение
      await task.update({ status: 'completed' });

      // Создаем отзыв, если указан рейтинг
      if (rating) {
        await Review.create({
          rating: parseInt(rating),
          comment: comment || '',
          taskId,
          authorId: userId,
          targetId: executorId
        });

        // Обновляем средний рейтинг исполнителя
        const reviews = await Review.findAll({
          where: { targetId: executorId }
        });
        
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        await User.update(
          { rating: avgRating },
          { where: { id: executorId } }
        );

        logger.debug(`✅ Отзыв создан. Новый рейтинг исполнителя: ${avgRating.toFixed(2)}`);
      }

      // Создаем уведомление для исполнителя
      const { Notification } = require('../models');
      await Notification.create({
        userId: executorId,
        type: 'task_completed',
        title: '🎉 Работа подтверждена!',
        message: `Заказчик подтвердил завершение работы "${task.title}". ${rating ? `Вы получили оценку ${rating}/5.` : ''}`,
        data: {
          taskId,
          rating: rating || null,
          hasReview: !!rating
        }
      });

      res.json({
        success: true,
        message: 'Завершение работы подтверждено',
        task,
        reviewCreated: !!rating
      });
    } else {
      // Отклоняем завершение - возвращаем в работу
      await task.update({ status: 'in_progress' });

      // Уведомляем исполнителя
      const { Notification } = require('../models');
      await Notification.create({
        userId: executorId,
        type: 'task_completed',
        title: '🔄 Нужны доработки',
        message: `Заказчик не подтвердил завершение работы "${task.title}". ${comment ? `Комментарий: ${comment}` : 'Пожалуйста, свяжитесь с заказчиком.'}`,
        data: {
          taskId,
          requiresWork: true,
          customerComment: comment || null
        }
      });

      res.json({
        success: true,
        message: 'Работа возвращена на доработку',
        task
      });
    }

  } catch (error) {
    logger.error('Ошибка подтверждения завершения:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка подтверждения завершения'
    });
  }
};

// Создание отзыва (отдельно от подтверждения)
const createReview = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { rating, comment } = req.body;
    const authorId = req.user.id;

    // Валидация
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: errors.array()
      });
    }

    // Находим заявку
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Bid,
          as: 'bids',
          where: { accepted: true }
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    // Определяем кто кому ставит отзыв
    let targetId;
    if (task.userId === authorId) {
      // Заказчик ставит отзыв исполнителю
      targetId = task.bids[0].userId;
    } else if (task.bids[0].userId === authorId) {
      // Исполнитель ставит отзыв заказчику
      targetId = task.userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для создания отзыва по этой заявке'
      });
    }

    // Проверяем, что заявка завершена
    if (task.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Отзыв можно оставить только по завершенным заявкам'
      });
    }

    // Проверяем, нет ли уже отзыва
    const existingReview = await Review.findOne({
      where: { taskId, authorId, targetId }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Вы уже оставили отзыв по этой заявке'
      });
    }

    // Создаем отзыв
    const review = await Review.create({
      rating: parseInt(rating),
      comment,
      taskId,
      authorId,
      targetId
    });

    // Обновляем средний рейтинг
    const reviews = await Review.findAll({
      where: { targetId }
    });
    
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await User.update(
      { rating: avgRating },
      { where: { id: targetId } }
    );

    // Получаем созданный отзыв с данными
    const createdReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'target',
          attributes: ['id', 'name', 'rating']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Отзыв успешно создан',
      review: createdReview
    });

  } catch (error) {
    logger.error('Ошибка создания отзыва:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания отзыва'
    });
  }
};

// Получение отзывов пользователя
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await Review.findAndCountAll({
      where: { targetId: userId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name']
        },
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'category']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      reviews: reviews.rows,
      pagination: {
        total: reviews.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(reviews.count / limit)
      }
    });

  } catch (error) {
    logger.error('Ошибка получения отзывов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения отзывов'
    });
  }
};

// Валидаторы
const validateConfirmCompletion = [
  body('confirmed')
    .isBoolean()
    .withMessage('Поле confirmed должно быть булевым'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Рейтинг должен быть от 1 до 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Комментарий не может превышать 1000 символов')
];

const validateCreateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Рейтинг должен быть от 1 до 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Комментарий не может превышать 1000 символов')
];

module.exports = {
  confirmTaskCompletion,
  createReview,
  getUserReviews,
  validateConfirmCompletion,
  validateCreateReview
}; 