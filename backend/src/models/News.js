const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

const News = sequelize.define('News', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9-]+$/i
    }
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      customValidator(value) {
        // Разрешаем пустую строку, null и undefined
        if (!value || value.trim() === '') {
          return;
        }
        // Для непустых значений проверяем URL
        try {
          new URL(value.trim());
        } catch (error) {
          throw new Error('Введите корректный URL изображения');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
    allowNull: false
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'news',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['publishedAt']
    },
    {
      fields: ['authorId']
    },
    {
      unique: true,
      fields: ['slug']
    }
  ],
  hooks: {
    beforeSave: async (news) => {
      // Автоматически генерируем slug из заголовка если не указан
      if (!news.slug && news.title) {
        news.slug = news.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-')
      }
      
      // Устанавливаем дату публикации при изменении статуса на published
      if (news.status === 'published' && !news.publishedAt) {
        news.publishedAt = new Date()
      }
      
      // Очищаем дату публикации если статус не published
      if (news.status !== 'published') {
        news.publishedAt = null
      }
    }
  }
})

// Ассоциации
News.associate = (models) => {
  News.belongsTo(models.User, {
    foreignKey: 'authorId',
    as: 'author'
  })
}

module.exports = News 