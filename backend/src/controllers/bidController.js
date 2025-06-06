// Логирование вынесено в отдельные console.log для упрощения
const { Bid, Task, User, Notification } = require('../models');
const { body, validationResult } = require('express-validator');
const { createNewBidNotification, createBidAcceptedNotification } = require('./notificationController');

// Создание отклика на заявку
const createBid = async (req, res) => {
  try {
    console.log('=== СОЗДАНИЕ ОТКЛИКА ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    console.log('req.params:', req.params);

    // Проверяем, что пользователь является исполнителем
    if (req.user.role !== 'executor') {
      return res.status(403).json({
        success: false,
        message: 'Только исполнители могут оставлять отклики на заявки'
      });
    }

    // Валидация данных
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Ошибки валидации:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors: errors.array()
      });
    }

    const { taskId } = req.params;
    const { price, comment } = req.body;
    const userId = req.user.id;

    // Проверяем существование задачи
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    // Проверяем, что пользователь не откликается на свою заявку
    if (task.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя откликнуться на собственную заявку'
      });
    }

    // Проверяем, что заявка активна
    if (task.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Можно откликнуться только на активные заявки'
      });
    }

    // Проверяем, нет ли уже отклика от этого пользователя
    const existingBid = await Bid.findOne({
      where: { taskId, userId }
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'Вы уже откликнулись на эту заявку'
      });
    }

    // Создаем отклик
    const bid = await Bid.create({
      taskId,
      userId,
      price,
      comment,
      accepted: false
    });

    // Получаем созданный отклик с данными пользователя
    const createdBid = await Bid.findByPk(bid.id, {
      include: [
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'name', 'email', 'rating', 'avatar']
        },
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'userId']
        }
      ]
    });

    console.log('✅ Отклик создан:', createdBid.toJSON());

    // Создаем уведомление для заказчика о новом отклике
    try {
      await createNewBidNotification(
        taskId, 
        bid.id, 
        createdBid.executor.name, 
        price
      );
      console.log('✅ Уведомление о новом отклике создано');
    } catch (notificationError) {
      console.error('❌ Ошибка создания уведомления:', notificationError);
      // Не прерываем выполнение из-за ошибки уведомления
    }

    res.status(201).json({
      success: true,
      message: 'Отклик успешно создан',
      bid: createdBid
    });

  } catch (error) {
    console.error('💥 Ошибка создания отклика:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания отклика',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Получение откликов для заявки
const getBidsForTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const currentUserId = req.user?.id;

    const bids = await Bid.findAll({
      where: { taskId },
      include: [
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'name', 'email', 'phone', 'rating', 'avatar', 'showContacts', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Фильтруем контакты исполнителей в зависимости от настроек приватности
    const filteredBids = bids.map(bid => {
      const bidData = bid.toJSON();
      
      // Если это не профиль самого исполнителя и контакты скрыты
      if (currentUserId !== bidData.executor.id && !bidData.executor.showContacts) {
        delete bidData.executor.email;
        delete bidData.executor.phone;
      }
      
      return bidData;
    });

    res.json({
      success: true,
      bids: filteredBids
    });

  } catch (error) {
    console.error('Ошибка получения откликов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения откликов'
    });
  }
};

// Получение откликов пользователя
const getUserBids = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const bids = await Bid.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'status', 'date', 'category'],
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'name', 'rating', 'avatar']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      bids: bids.rows,
      pagination: {
        total: bids.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(bids.count / limit)
      }
    });

  } catch (error) {
    console.error('Ошибка получения откликов пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения ваших откликов'
    });
  }
};

// Принятие отклика (только для владельца заявки)
const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const userId = req.user.id;

    const bid = await Bid.findByPk(bidId, {
      include: [
        {
          model: Task,
          as: 'task',
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'name', 'avatar']
            }
          ]
        },
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'name', 'email', 'avatar']
        }
      ]
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Отклик не найден'
      });
    }

    // Проверяем, что пользователь - владелец заявки
    if (bid.task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для принятия этого отклика'
      });
    }

    // Проверяем статус заявки
    if (bid.task.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Можно принимать отклики только для активных заявок'
      });
    }

    // Принимаем отклик и обновляем статус заявки
    await bid.update({ accepted: true });
    await bid.task.update({ 
      status: 'in_progress',
      acceptedBidId: bid.id
    });

    // Отклоняем все остальные отклики
    await Bid.update(
      { accepted: false },
      {
        where: {
          taskId: bid.taskId,
          id: { [require('sequelize').Op.ne]: bid.id }
        }
      }
    );

    // Создаем уведомление для исполнителя
    try {
      await createBidAcceptedNotification(
        bid.id, 
        bid.task.title, 
        bid.task.customer.name
      );
      console.log(`✅ Уведомление создано для исполнителя ${bid.executor.name} о принятии отклика`);
    } catch (notificationError) {
      console.error('❌ Ошибка создания уведомления:', notificationError);
      // Не прерываем выполнение из-за ошибки уведомления
    }

    res.json({
      success: true,
      message: 'Отклик принят успешно',
      bid
    });

  } catch (error) {
    console.error('Ошибка принятия отклика:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка принятия отклика'
    });
  }
};

// Обновление отклика
const updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { price, comment } = req.body;
    const userId = req.user.id;

    const bid = await Bid.findByPk(bidId);

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Отклик не найден'
      });
    }

    // Проверяем права доступа
    if (bid.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для редактирования этого отклика'
      });
    }

    // Проверяем, что отклик еще не принят
    if (bid.accepted) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя редактировать принятый отклик'
      });
    }

    // Обновляем отклик
    const updateData = {};
    if (price !== undefined) updateData.price = price;
    if (comment !== undefined) updateData.comment = comment;

    await bid.update(updateData);

    // Получаем обновленный отклик
    const updatedBid = await Bid.findByPk(bidId, {
      include: [
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'name', 'email', 'rating', 'avatar']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Отклик успешно обновлен',
      bid: updatedBid
    });

  } catch (error) {
    console.error('Ошибка обновления отклика:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления отклика'
    });
  }
};

// Валидаторы
const validateCreateBid = [
  body('price')
    .isFloat({ min: 1 })
    .withMessage('Цена должна быть положительным числом'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Комментарий не может превышать 1000 символов')
];

module.exports = {
  createBid,
  getBidsForTask,
  getUserBids,
  acceptBid,
  updateBid,
  validateCreateBid
}; 