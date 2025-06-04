const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { uploadAvatar, uploadVehiclePhotos, handleMulterError } = require('../middleware/uploadMiddleware');
const {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  uploadAvatar: uploadAvatarController,
  uploadVehiclePhotos: uploadVehiclePhotosController,
  deleteVehiclePhoto,
  updateVehiclePhotoDescription
} = require('../controllers/profileController');

const router = express.Router();

// Получение собственного профиля (требует авторизацию)
router.get('/me', protect, getMyProfile);

// Получение публичного профиля пользователя (не требует авторизацию)
router.get('/public/:userId', getPublicProfile);

// Обновление профиля
router.put('/me', protect, updateProfile);

// Загрузка аватара
router.post('/avatar', protect, uploadAvatar, handleMulterError, uploadAvatarController);

// Загрузка фотографий автомобиля (только для исполнителей)
router.post('/vehicle-photos', protect, uploadVehiclePhotos, handleMulterError, uploadVehiclePhotosController);

// Удаление фотографии автомобиля
router.delete('/vehicle-photos/:photoId', protect, deleteVehiclePhoto);

// Обновление описания фотографии автомобиля
router.put('/vehicle-photos/:photoId', protect, updateVehiclePhotoDescription);

module.exports = router; 