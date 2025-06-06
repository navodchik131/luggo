import logger from '../utils/logger.js'
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Данные уже существуют';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Недействительный токен';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Срок действия токена истёк';
    error = { message, statusCode: 401 };
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Связанные данные не найдены';
    error = { message, statusCode: 400 };
  }

  logger.error('Ошибка:', {
    message: error.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler }; 