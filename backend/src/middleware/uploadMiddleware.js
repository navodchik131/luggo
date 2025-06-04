const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем папки для загрузок, если их нет
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/avatars',
    'uploads/vehicles'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'avatar') {
      cb(null, 'uploads/avatars/');
    } else if (file.fieldname === 'vehiclePhotos') {
      cb(null, 'uploads/vehicles/');
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Фильтр файлов - только изображения
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения (jpeg, jpg, png, gif, webp)'));
  }
};

// Настройки multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB максимум
    files: 10 // максимум 10 файлов за раз
  },
  fileFilter: fileFilter
});

// Middleware для загрузки аватара
const uploadAvatar = upload.single('avatar');

// Middleware для загрузки фотографий автомобилей (до 5 фото)
const uploadVehiclePhotos = upload.array('vehiclePhotos', 5);

// Обработчик ошибок multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Файл слишком большой. Максимальный размер: 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Превышено максимальное количество файлов'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Неожиданное поле файла'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Ошибка загрузки файла'
    });
  }
  
  next();
};

module.exports = {
  uploadAvatar,
  uploadVehiclePhotos,
  handleMulterError
}; 