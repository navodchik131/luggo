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
  
  // Подписки на категории заявок (JSON массив)
  subscribedCategories: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('subscribedCategories');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('subscribedCategories', JSON.stringify(value || []));
    }
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