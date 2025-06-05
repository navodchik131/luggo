const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 2000]
    }
  },
  fromAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 500]
    }
  },
  toAddress: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 500]
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString().split('T')[0]
    }
  },
  category: {
    type: DataTypes.ENUM('flat', 'office', 'intercity', 'garbage'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'in_progress', 'awaiting_confirmation', 'completed', 'cancelled'),
    defaultValue: 'draft',
    allowNull: false
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  acceptedBidId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'bids',
      key: 'id'
    }
  }
}, {
  tableName: 'tasks'
});

// Определяем связи
Task.associate = (models) => {
  // Заявка принадлежит пользователю (заказчику)
  Task.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'customer'
  });

  // Заявка может иметь много откликов
  Task.hasMany(models.Bid, {
    foreignKey: 'taskId',
    as: 'bids'
  });

  // Заявка может иметь принятый отклик
  Task.belongsTo(models.Bid, {
    foreignKey: 'acceptedBidId',
    as: 'acceptedBid'
  });

  // Заявка может иметь много сообщений
  Task.hasMany(models.Message, {
    foreignKey: 'taskId',
    as: 'messages'
  });

  // Заявка может иметь много отзывов
  Task.hasMany(models.Review, {
    foreignKey: 'taskId',
    as: 'reviews'
  });
};

module.exports = Task; 