// Логирование вынесено в отдельные console.log для упрощения
const { Notification, User, Task, Bid } = require('../models');
const { Op } = require('sequelize');

// Получение уведомлений пользователя
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    
    // Фильтр только непрочитанных
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      notifications: notifications.rows,
      pagination: {
        total: notifications.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(notifications.count / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения уведомлений:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения уведомлений'
    });
  }
};

// Получение количества непрочитанных уведомлений
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Ошибка получения количества уведомлений:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения количества уведомлений'
    });
  }
};

// Отметить уведомление как прочитанное
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Уведомление не найдено'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Уведомление отмечено как прочитанное'
    });
  } catch (error) {
    console.error('Ошибка отметки уведомления:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка отметки уведомления'
    });
  }
};

// Отметить все уведомления как прочитанные
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'Все уведомления отмечены как прочитанные'
    });
  } catch (error) {
    console.error('Ошибка отметки всех уведомлений:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка отметки всех уведомлений'
    });
  }
};

// Удаление уведомления
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: {
        id,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Уведомление не найдено'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Уведомление удалено'
    });
  } catch (error) {
    console.error('Ошибка удаления уведомления:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления уведомления'
    });
  }
};

// Вспомогательная функция для создания уведомления
const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    console.log('✅ Уведомление создано:', notification.toJSON());
    return notification;
  } catch (error) {
    console.error('❌ Ошибка создания уведомления:', error);
    throw error;
  }
};

// Функции для создания типовых уведомлений

// Новый отклик на заявку
const createNewBidNotification = async (taskId, bidId, executorName, price) => {
  try {
    const task = await Task.findByPk(taskId, {
      include: [{ model: User, as: 'customer' }]
    });

    if (!task) return null;

    return await createNotification({
      userId: task.userId,
      type: 'new_bid',
      title: 'Новый отклик на вашу заявку',
      message: `${executorName} откликнулся на заявку "${task.title}" с предложением ${price} ₽`,
      actionUrl: `/tasks/${taskId}`,
      relatedType: 'bid',
      relatedId: bidId,
      metadata: {
        executorName,
        price,
        taskTitle: task.title
      }
    });
  } catch (error) {
    console.error('Ошибка создания уведомления о новом отклике:', error);
  }
};

// Отклик принят
const createBidAcceptedNotification = async (bidId, taskTitle, customerName) => {
  try {
    const bid = await Bid.findByPk(bidId, {
      include: [{ model: User, as: 'executor' }]
    });

    if (!bid) return null;

    return await createNotification({
      userId: bid.userId,
      type: 'bid_accepted',
      title: 'Ваш отклик принят!',
      message: `${customerName} принял ваш отклик на заявку "${taskTitle}" на сумму ${bid.price} ₽`,
      actionUrl: `/tasks/${bid.taskId}`,
      relatedType: 'bid',
      relatedId: bidId,
      metadata: {
        customerName,
        taskTitle,
        price: bid.price
      }
    });
  } catch (error) {
    console.error('Ошибка создания уведомления о принятии отклика:', error);
  }
};

// Изменение статуса заявки
const createTaskStatusChangeNotification = async (taskId, newStatus, userId) => {
  try {
    const task = await Task.findByPk(taskId);
    if (!task) return null;

    const statusMessages = {
      'active': 'Заявка активирована',
      'in_progress': 'Работа началась',
      'awaiting_confirmation': 'Работа завершена, ожидает подтверждения',
      'completed': 'Заявка успешно завершена',
      'cancelled': 'Заявка отменена'
    };

    const title = statusMessages[newStatus] || 'Статус заявки изменен';

    return await createNotification({
      userId,
      type: 'task_status_changed',
      title,
      message: `Статус заявки "${task.title}" изменен на "${title}"`,
      actionUrl: `/tasks/${taskId}`,
      relatedType: 'task',
      relatedId: taskId,
      metadata: {
        taskTitle: task.title,
        oldStatus: task.status,
        newStatus
      }
    });
  } catch (error) {
    console.error('Ошибка создания уведомления о изменении статуса:', error);
  }
};

// Новое сообщение
const createNewMessageNotification = async (messageId, receiverId, senderName, taskTitle) => {
  try {
    return await createNotification({
      userId: receiverId,
      type: 'new_message',
      title: 'Новое сообщение',
      message: `${senderName} написал вам сообщение по заявке "${taskTitle}"`,
      actionUrl: `/messages/${messageId}`,
      relatedType: 'message',
      relatedId: messageId,
      metadata: {
        senderName,
        taskTitle
      }
    });
  } catch (error) {
    console.error('Ошибка создания уведомления о сообщении:', error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createNewBidNotification,
  createBidAcceptedNotification,
  createTaskStatusChangeNotification,
  createNewMessageNotification
}; 