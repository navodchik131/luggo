import logger from '../utils/logger.js'
const { User, Task, Bid, Message, Review, Notification } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Получение статистики для дашборда
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Общая статистика
    const [
      totalUsers,
      totalTasks,
      totalBids,
      totalExecutors,
      totalCustomers,
      activeTasks,
      completedTasks,
      weeklyUsers,
      weeklyTasks
    ] = await Promise.all([
      User.count(),
      Task.count(),
      Bid.count(),
      User.count({ where: { role: 'executor' } }),
      User.count({ where: { role: 'customer' } }),
      Task.count({ where: { status: 'active' } }),
      Task.count({ where: { status: 'completed' } }),
      User.count({ where: { createdAt: { [Op.gte]: weekAgo } } }),
      Task.count({ where: { createdAt: { [Op.gte]: weekAgo } } })
    ]);

    // Топ исполнители
    const topExecutors = await User.findAll({
      where: { role: 'executor' },
      attributes: ['id', 'name', 'rating', 'createdAt'],
      order: [['rating', 'DESC']],
      limit: 5
    });

    // Последние заявки
    const recentTasks = await Task.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name']
        }
      ],
      attributes: ['id', 'title', 'status', 'budget', 'createdAt']
    });

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          totalTasks,
          totalBids,
          totalExecutors,
          totalCustomers,
          activeTasks,
          completedTasks,
          monthlyRevenue: 0
        },
        growth: {
          weeklyUsers,
          weeklyTasks,
          dailyStats: []
        },
        topExecutors,
        recentTasks
      }
    });

  } catch (error) {
    logger.error('Ошибка получения статистики админки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статистики'
    });
  }
};

// Получение всех пользователей с фильтрацией
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search, 
      sortBy = 'createdAt',
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Фильтр по роли
    if (role && ['customer', 'executor', 'admin'].includes(role)) {
      whereClause.role = role;
    }

    // Поиск по имени или email
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'email', 'role', 'rating', 'isBlocked', 'createdAt'],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      users: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(users.count / limit)
      }
    });

  } catch (error) {
    logger.error('Ошибка получения пользователей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка пользователей'
    });
  }
};

// Блокировка/разблокировка пользователя
const toggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Нельзя блокировать других админов
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Нельзя блокировать администраторов'
      });
    }

    await user.update({ isBlocked: !user.isBlocked });

    res.json({
      success: true,
      message: `Пользователь ${user.isBlocked ? 'заблокирован' : 'разблокирован'}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });

  } catch (error) {
    logger.error('Ошибка блокировки пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка изменения статуса пользователя'
    });
  }
};

// Получение всех заявок для администрирования
const getAllTasks = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC' 
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Фильтр по статусу
    if (status) {
      whereClause.status = status;
    }

    // Фильтр по категории
    if (category) {
      whereClause.category = category;
    }

    // Поиск по названию
    if (search) {
      whereClause.title = { [Op.iLike]: `%${search}%` };
    }

    const tasks = await Task.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Bid,
          as: 'bids',
          required: false,
          attributes: ['id', 'price', 'accepted'],
          include: [
            {
              model: User,
              as: 'executor',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      tasks: tasks.rows,
      pagination: {
        total: tasks.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(tasks.count / limit)
      }
    });

  } catch (error) {
    logger.error('Ошибка получения заявок:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка заявок'
    });
  }
};

// Удаление заявки
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    await task.destroy();

    res.json({
      success: true,
      message: 'Заявка успешно удалена'
    });

  } catch (error) {
    logger.error('Ошибка удаления заявки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления заявки'
    });
  }
};

// Изменение статуса заявки
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['draft', 'active', 'in_progress', 'awaiting_confirmation', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Некорректный статус'
      });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      });
    }

    await task.update({ status });

    res.json({
      success: true,
      message: 'Статус заявки обновлен',
      task: {
        id: task.id,
        title: task.title,
        status: task.status
      }
    });

  } catch (error) {
    logger.error('Ошибка обновления статуса заявки:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления статуса заявки'
    });
  }
};

// Получение отчетов
const getReports = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Статистика по заявкам
    const taskStats = await Task.findAll({
      where: { createdAt: { [Op.gte]: startDate } },
      attributes: [
        'status',
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('budget')), 'avgBudget'],
        [sequelize.fn('SUM', sequelize.col('budget')), 'totalBudget']
      ],
      group: ['status', 'category'],
      raw: true
    });

    // Статистика по пользователям
    const userStats = await User.findAll({
      where: { createdAt: { [Op.gte]: startDate } },
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    // Топ активные пользователи
    const activeUsers = await User.findAll({
      attributes: ['id', 'name', 'role', 'rating'],
      include: [
        {
          model: Task,
          as: 'tasks',
          where: { createdAt: { [Op.gte]: startDate } },
          required: false,
          attributes: []
        }
      ],
      group: ['User.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('tasks.id')), 'DESC']],
      limit: 10,
      subQuery: false
    });

    res.json({
      success: true,
      reports: {
        period,
        startDate,
        endDate: now,
        taskStats,
        userStats,
        activeUsers
      }
    });

  } catch (error) {
    logger.error('Ошибка получения отчетов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения отчетов'
    });
  }
};

// Удаление пользователя
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Нельзя удалять админов
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Нельзя удалять администраторов'
      });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Пользователь успешно удален'
    });

  } catch (error) {
    logger.error('Ошибка удаления пользователя:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления пользователя'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserBlock,
  getAllTasks,
  deleteTask,
  updateTaskStatus,
  getReports,
  deleteUser
}; 