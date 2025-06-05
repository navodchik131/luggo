const { User, VehiclePhoto, Review } = require('../models');
const { SERVICE_TYPES } = require('../config/constants');
const path = require('path');
const fs = require('fs');

// Получение собственного профиля
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      include: [
        {
          model: VehiclePhoto,
          as: 'vehiclePhotos'
        },
        {
          model: Review,
          as: 'receivedReviews',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'avatar']
            }
          ],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения профиля'
    });
  }
};

// Получение публичного профиля
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id; // ID текущего пользователя
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'avatar', 'role', 'rating', 'showContacts', 'createdAt'],
      include: [
        {
          model: VehiclePhoto,
          as: 'vehiclePhotos'
        },
        {
          model: Review,
          as: 'receivedReviews',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'avatar']
            }
          ],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Публичный профиль доступен только для исполнителей
    if (user.role !== 'executor') {
      return res.status(403).json({
        success: false,
        message: 'Профиль недоступен для просмотра'
      });
    }

    // Проверяем приватность контактов
    const userProfile = user.toJSON();
    
    // Если это не владелец профиля и контакты скрыты - убираем email и phone
    if (currentUserId !== userId && !user.showContacts) {
      delete userProfile.email;
      delete userProfile.phone;
    }

    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Ошибка получения публичного профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения профиля'
    });
  }
};

// Обновление профиля
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, services, showContacts } = req.body;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Обновляем только разрешенные поля
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (showContacts !== undefined) updateData.showContacts = Boolean(showContacts);

    // Обработка услуг для исполнителей
    if (user.role === 'executor' && services !== undefined) {
      let validatedServices = null;
      
      if (services && Array.isArray(services)) {
        const validServices = Object.values(SERVICE_TYPES);
        validatedServices = services.filter(service => 
          validServices.includes(service) && service.trim() !== ''
        );
        
        // Если исполнитель, но не выбрал услуги - ошибка
        if (validatedServices.length === 0) {
          return res.status(400).json({ 
            success: false,
            message: 'Исполнитель должен выбрать хотя бы одну услугу' 
          });
        }
      }
      
      updateData.services = validatedServices;
    }

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Профиль успешно обновлен',
      user
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления профиля'
    });
  }
};

// Загрузка аватара
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не был загружен'
      });
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Удаляем старый аватар, если он есть
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Сохраняем путь к новому аватару
    const avatarPath = `uploads/avatars/${req.file.filename}`;
    await user.update({ avatar: avatarPath });

    res.json({
      success: true,
      message: 'Аватар успешно загружен',
      avatar: avatarPath
    });
  } catch (error) {
    console.error('Ошибка загрузки аватара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка загрузки аватара'
    });
  }
};

// Загрузка фотографий автомобиля (только для исполнителей)
const uploadVehiclePhotos = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Проверяем роль пользователя
    if (req.user.role !== 'executor') {
      return res.status(403).json({
        success: false,
        message: 'Только исполнители могут загружать фотографии автомобилей'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Файлы не были загружены'
      });
    }

    // Проверяем лимит фотографий (максимум 10)
    const existingPhotos = await VehiclePhoto.count({ where: { userId } });
    const newPhotosCount = req.files.length;
    
    if (existingPhotos + newPhotosCount > 10) {
      return res.status(400).json({
        success: false,
        message: `Превышен лимит фотографий. У вас уже ${existingPhotos} фото, можно добавить еще ${10 - existingPhotos}`
      });
    }

    // Сохраняем информацию о каждой фотографии
    const vehiclePhotos = [];
    
    for (const file of req.files) {
      const photoData = {
        userId,
        filename: file.filename,
        originalName: file.originalname,
        path: `uploads/vehicles/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype
      };
      
      const photo = await VehiclePhoto.create(photoData);
      vehiclePhotos.push(photo);
    }

    res.json({
      success: true,
      message: `Успешно загружено ${vehiclePhotos.length} фотографий`,
      photos: vehiclePhotos
    });
  } catch (error) {
    console.error('Ошибка загрузки фотографий автомобиля:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка загрузки фотографий'
    });
  }
};

// Удаление фотографии автомобиля
const deleteVehiclePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;
    
    const photo = await VehiclePhoto.findOne({
      where: { id: photoId, userId }
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Фотография не найдена'
      });
    }

    // Удаляем файл с диска
    const filePath = path.join(__dirname, '../../', photo.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Удаляем запись из базы данных
    await photo.destroy();

    res.json({
      success: true,
      message: 'Фотография успешно удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления фотографии:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления фотографии'
    });
  }
};

// Обновление описания фотографии
const updateVehiclePhotoDescription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;
    const { description } = req.body;
    
    const photo = await VehiclePhoto.findOne({
      where: { id: photoId, userId }
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Фотография не найдена'
      });
    }

    await photo.update({ description: description || '' });

    res.json({
      success: true,
      message: 'Описание обновлено',
      photo
    });
  } catch (error) {
    console.error('Ошибка обновления описания:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления описания'
    });
  }
};

module.exports = {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  uploadAvatar,
  uploadVehiclePhotos,
  deleteVehiclePhoto,
  updateVehiclePhotoDescription
}; 