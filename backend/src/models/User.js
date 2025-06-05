const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
      len: [10, 15]
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('customer', 'executor', 'admin'),
    defaultValue: 'customer',
    allowNull: false
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  services: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    comment: 'Услуги исполнителя: ["flat", "office", "intercity", "garbage"]'
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  showContacts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Показывать ли email и телефон другим пользователям'
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Методы экземпляра
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

// Определяем связи
User.associate = (models) => {
  // Пользователь может иметь много заявок как заказчик
  User.hasMany(models.Task, {
    foreignKey: 'userId',
    as: 'tasks'
  });

  // Пользователь может иметь много откликов как исполнитель
  User.hasMany(models.Bid, {
    foreignKey: 'userId',
    as: 'bids'
  });

  // Пользователь может иметь много отправленных сообщений
  User.hasMany(models.Message, {
    foreignKey: 'senderId',
    as: 'sentMessages'
  });

  // Пользователь может иметь много полученных сообщений
  User.hasMany(models.Message, {
    foreignKey: 'receiverId',
    as: 'receivedMessages'
  });

  // Пользователь может иметь много отзывов как автор
  User.hasMany(models.Review, {
    foreignKey: 'authorId',
    as: 'writtenReviews'
  });

  // Пользователь может иметь много отзывов как получатель
  User.hasMany(models.Review, {
    foreignKey: 'targetId',
    as: 'receivedReviews'
  });

  // Пользователь может иметь много фотографий транспорта
  User.hasMany(models.VehiclePhoto, {
    foreignKey: 'userId',
    as: 'vehiclePhotos'
  });
};

module.exports = User; 