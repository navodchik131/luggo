const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
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
    },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('pro', 'pro_plus'),
    allowNull: false,
    defaultValue: 'pro',
    comment: 'Тип подписки: pro (499₽), pro_plus (999₽)'
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled', 'pending'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Статус подписки'
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата начала подписки'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Дата окончания подписки'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Сумма оплаты в рублях'
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID платежа в платежной системе'
  },
  paymentSystem: {
    type: DataTypes.ENUM('yookassa', 'cloudpayments', 'tinkoff'),
    allowNull: true,
    comment: 'Платежная система'
  },
  paymentData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Дополнительные данные о платеже'
  },
  autoRenewal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Автоматическое продление'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['endDate']
    }
  ]
});

module.exports = Subscription; 