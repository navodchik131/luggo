const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'new_bid',           // Новый отклик на заявку
      'bid_accepted',      // Отклик принят
      'bid_rejected',      // Отклик отклонен
      'new_message',       // Новое сообщение
      'task_status_changed', // Изменение статуса заявки
      'new_task',          // Новая заявка (для исполнителей)
      'task_completed',    // Заявка завершена
      'review_received',   // Получен отзыв
      'system'             // Системное уведомление
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000]
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true, // URL для перехода при клике на уведомление
    validate: {
      len: [0, 500]
    }
  },
  relatedType: {
    type: DataTypes.ENUM('task', 'bid', 'message', 'review', 'user'),
    allowNull: true
  },
  relatedId: {
    type: DataTypes.UUID,
    allowNull: true // ID связанной сущности
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true // Дополнительные данные (например, имя отправителя, цена отклика и т.д.)
  }
}, {
  tableName: 'notifications',
  indexes: [
    {
      fields: ['userId', 'isRead', 'createdAt']
    },
    {
      fields: ['userId', 'type']
    }
  ]
});

module.exports = Notification; 