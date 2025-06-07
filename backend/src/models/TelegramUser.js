const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TelegramUser = sequelize.define('TelegramUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  
  // ID пользователя в Telegram
  telegramId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  
  // Username в Telegram (может быть null)
  telegramUsername: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Имя пользователя в Telegram
  telegramFirstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // ID пользователя в нашей системе (после авторизации)
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  
  // Активна ли подписка на уведомления
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  
  // Подписки на категории заявок (PostgreSQL массив)
  subscribedCategories: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    defaultValue: []
  },
  
  // Последний раз был активен
  lastActiveAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'telegram_users',
  timestamps: true
});

module.exports = TelegramUser; 