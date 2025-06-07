// Логирование вынесено в отдельные console.log для упрощения
const { Task, User, Bid } = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sendTaskNotification } = require('../bot/telegramBot');

// Получение всех задач с пагинацией и фильтрацией
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user?.id; // Получаем ID пользователя если авторизован

    const whereClause = {};
    
    // Фильтр по категории
    if (category) {
      whereClause.category = category;
    }
    
    // Фильтр по статусу
    if (status) {
      whereClause.status = status;
    }
    
    // Поиск по заголовку и описанию
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const includeModels = [
      {
        model: User,
        as: 'customer',
        attributes: ['id', 'name', 'email', 'rating', 'avatar']
      }
    ];

    // Если пользователь авторизован, добавляем его отклики
    if (userId) {
      includeModels.push({
        model: Bid,
        as: 'bids',
        where: { userId },
        required: false, // LEFT JOIN чтобы показать заявки даже без откликов пользователя
        attributes: ['id', 'price', 'accepted', 'createdAt'],
        include: [
          {
            model: User,
            as: 'executor',
            attributes: ['id', 'name', 'avatar']
          }
        ]
      });
    }

    const tasks = await Task.findAndCountAll({
      where: whereClause,
      include: includeModels,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Обработка результатов для фронтенда
    const processedTasks = tasks.rows.map(task => {
      const taskData = task.toJSON();
      
      // Если есть отклики пользователя, оставляем только его отклик
      if (userId && taskData.bids && taskData.bids.length > 0) {
        taskData.userBid = taskData.bids[0]; // Первый отклик это отклик пользователя
        delete taskData.bids; // Удаляем массив откликов для экономии трафика
      } else {
        taskData.userBid = null;
        delete taskData.bids;
      }
      
      return taskData;
    });

    res.json({
      success: true,
      tasks: processedTasks,
      pagination: {
        total: tasks.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(tasks.count / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения задач:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка задач'
    });
  }
};

// Получение конкретной задачи
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'rating', 'avatar', 'createdAt']
        },
        {
          model: Bid,
          as: 'bids',
          include: [
            {
              model: User,
              as: 'executor',
              attributes: ['id', 'name', 'email', 'rating', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Ошибка получения задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения задачи'
    });
  }
};

// Создание новой задачи
const createTask = async (req, res) => {
  try {
    console.log('=== НАЧАЛО СОЗДАНИЯ ЗАДАЧИ ===');
    console.log('req.user:', req.user);
    console.log('req.body:', req.body);
    
    // Проверка авторизации
    if (!req.user || !req.user.id) {
      console.log('❌ Пользователь не авторизован');
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    // Проверка роли - только заказчики могут создавать заявки
    if (req.user.role === 'executor') {
      console.log('❌ Исполнители не могут создавать заявки');
      return res.status(403).json({
        success: false,
        message: 'Исполнители не могут создавать заявки. Только заказчики.'
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

    const { title, description, fromAddress, toAddress, date, category } = req.body;
    
    const userId = req.user.id;
    console.log('✅ Данные для создания задачи:', {
      title, description, fromAddress, toAddress, date, category, userId
    });

    // Создание задачи
    console.log('📝 Создаю задачу в БД...');
    const task = await Task.create({
      title,
      description,
      fromAddress,
      toAddress,
      date,
      category,
      userId,
      status: 'active'
    });
    console.log('✅ Задача создана:', task.toJSON());

    // Получение созданной задачи с пользователем
    console.log('📄 Получаю задачу с данными пользователя...');
    const createdTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'rating']
        }
      ]
    });
    console.log('✅ Задача с пользователем:', createdTask ? createdTask.toJSON() : 'null');

    // Отправляем уведомления в Telegram
    try {
      console.log('📲 Отправляю уведомления в Telegram...');
      await sendTaskNotification(createdTask.toJSON());
      console.log('✅ Уведомления отправлены');
    } catch (notificationError) {
      console.error('⚠️ Ошибка отправки уведомлений в Telegram:', notificationError);
      // Не прерываем выполнение, просто логируем ошибку
    }

    res.status(201).json({
      success: true,
      message: 'Задача успешно создана',
      task: createdTask
    });
    console.log('=== ЗАДАЧА СОЗДАНА УСПЕШНО ===');
  } catch (error) {
    console.error('💥 Ошибка создания задачи:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания задачи',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Обновление задачи
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fromAddress, toAddress, date, category, status } = req.body;
    const userId = req.user.id;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверка прав доступа (только автор может редактировать)
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для редактирования этой задачи'
      });
    }

    // Обновление полей
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (fromAddress !== undefined) updateData.fromAddress = fromAddress;
    if (toAddress !== undefined) updateData.toAddress = toAddress;
    if (date !== undefined) updateData.date = date;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;

    await task.update(updateData);

    // Получение обновленной задачи
    const updatedTask = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'rating', 'avatar']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Задача успешно обновлена',
      task: updatedTask
    });
  } catch (error) {
    console.error('Ошибка обновления задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления задачи'
    });
  }
};

// Удаление задачи
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Задача не найдена'
      });
    }

    // Проверка прав доступа (только автор может удалять)
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для удаления этой задачи'
      });
    }

    await task.destroy();

    res.json({
      success: true,
      message: 'Задача успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления задачи:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления задачи'
    });
  }
};

// Получение заявок текущего пользователя
const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    
    // Фильтр по статусу
    if (status) {
      whereClause.status = status;
    }

    const tasks = await Task.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'rating', 'avatar']
        },
        {
          model: Bid,
          as: 'bids',
          include: [
            {
              model: User,
              as: 'executor',
              attributes: ['id', 'name', 'email', 'rating', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Добавляем статистику для каждой заявки
    const tasksWithStats = tasks.rows.map(task => {
      const taskData = task.toJSON();
      const bids = taskData.bids || [];
      
      return {
        ...taskData,
        stats: {
          totalBids: bids.length,
          acceptedBid: bids.find(bid => bid.accepted) || null,
          averagePrice: bids.length > 0 
            ? Math.round(bids.reduce((sum, bid) => sum + parseFloat(bid.price), 0) / bids.length)
            : 0,
          latestBidDate: bids.length > 0 ? bids[0].createdAt : null
        }
      };
    });

    res.json({
      success: true,
      tasks: tasksWithStats,
      pagination: {
        total: tasks.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(tasks.count / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения заявок пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения ваших заявок'
    });
  }
};

// Валидаторы для создания/обновления задачи
const validateCreateTask = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Заголовок должен содержать от 10 до 200 символов'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Описание должно содержать от 20 до 2000 символов'),
  body('fromAddress')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Адрес отправления должен содержать от 5 до 500 символов'),
  body('toAddress')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Адрес назначения должен содержать от 5 до 500 символов'),
  body('date')
    .isISO8601()
    .withMessage('Некорректный формат даты')
    .custom((value) => {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        throw new Error('Дата не может быть в прошлом');
      }
      return true;
    }),
  body('category')
    .isIn(['flat', 'office', 'intercity', 'garbage'])
    .withMessage('Некорректная категория задачи')
];

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getUserTasks,
  validateCreateTask
}; 