// Логирование вынесено в отдельные console.log для упрощения
const { User, Review, VehiclePhoto } = require('../models');
const { SERVICE_NAMES } = require('../config/constants');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Получение списка исполнителей с фильтрами и пагинацией
const getExecutors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      minRating = '',
      hasVehiclePhotos = '',
      services = '', // новый фильтр по услугам
      sortBy = 'rating' // rating, name, createdAt
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Базовые условия поиска
    const whereConditions = {
      role: 'executor'
    };

    // Поиск по имени
    if (search) {
      whereConditions.name = {
        [Op.like]: `%${search}%`
      };
    }

    // Фильтр по минимальному рейтингу
    if (minRating) {
      whereConditions.rating = {
        [Op.gte]: parseFloat(minRating)
      };
    }

    // Фильтр по услугам
    if (services) {
      // services может быть строкой "flat,office" или массивом
      const servicesList = Array.isArray(services) ? services : services.split(',');
      const validServices = servicesList.filter(s => s.trim() !== '');
      
      if (validServices.length > 0) {
        // Упрощенный подход - ищем исполнителей, у которых есть хотя бы одна из указанных услуг
        const serviceConditions = validServices.map(service => 
          sequelize.literal(`services::text LIKE '%"${service.trim()}"%'`)
        );
        
        whereConditions[Op.and] = whereConditions[Op.and] || [];
        whereConditions[Op.and].push({
          [Op.or]: serviceConditions
        });
      }
    }

    // Настройка сортировки
    let order = [];
    switch (sortBy) {
      case 'rating':
        order = [['rating', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'name':
        order = [['name', 'ASC']];
        break;
      case 'createdAt':
        order = [['createdAt', 'DESC']];
        break;
      default:
        order = [['rating', 'DESC'], ['createdAt', 'DESC']];
    }

    // Базовый запрос
    let queryOptions = {
      where: whereConditions,
      attributes: ['id', 'name', 'avatar', 'rating', 'services', 'createdAt'],
      include: [
        {
          model: VehiclePhoto,
          as: 'vehiclePhotos',
          attributes: ['id', 'path', 'description']
        },
        {
          model: Review,
          as: 'receivedReviews',
          attributes: ['rating'],
          separate: true // Для подсчета количества отзывов
        }
      ],
      order,
      limit: parseInt(limit),
      offset,
      distinct: true
    };

    // Если нужны только исполнители с фото автомобилей
    if (hasVehiclePhotos === 'true') {
      queryOptions.include[0].required = true; // INNER JOIN вместо LEFT JOIN
    }

    const { count, rows: executors } = await User.findAndCountAll(queryOptions);

    // Обогащаем данные исполнителей статистикой отзывов
    const executorsWithStats = await Promise.all(executors.map(async (executor) => {
      const reviewsCount = await Review.count({
        where: { targetId: executor.id }
      });
      
      return {
        ...executor.toJSON(),
        reviewsCount,
        vehiclePhotosCount: executor.vehiclePhotos?.length || 0
      };
    }));

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      executors: executorsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages
      },
      filters: {
        search,
        minRating,
        hasVehiclePhotos,
        services,
        sortBy
      }
    });

  } catch (error) {
    console.error('Ошибка получения списка исполнителей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка исполнителей'
    });
  }
};

// Получение статистики исполнителей (для общей информации)
const getExecutorStats = async (req, res) => {
  try {
    const totalExecutors = await User.count({
      where: { role: 'executor' }
    });

    const executorsWithPhotos = await User.count({
      where: { role: 'executor' },
      include: [
        {
          model: VehiclePhoto,
          as: 'vehiclePhotos',
          required: true
        }
      ]
    });

    const averageRating = await User.findOne({
      where: { 
        role: 'executor',
        rating: { [Op.not]: null }
      },
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating']
      ]
    });

    res.json({
      success: true,
      stats: {
        totalExecutors,
        executorsWithPhotos,
        averageRating: averageRating?.dataValues?.avgRating || 0
      }
    });

  } catch (error) {
    console.error('Ошибка получения статистики исполнителей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статистики'
    });
  }
};

// Получение списка доступных услуг
const getServices = async (req, res) => {
  try {
    res.json({
      success: true,
      services: SERVICE_NAMES
    });
  } catch (error) {
    console.error('Ошибка получения списка услуг:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения списка услуг'
    });
  }
};

module.exports = {
  getExecutors,
  getExecutorStats,
  getServices
}; 