import logger from '../utils/logger.js'
const adminOnly = (req, res, next) => {
  try {
    // Проверяем, что пользователь авторизован
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Необходима авторизация'
      });
    }

    // Проверяем роль администратора
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен. Требуются права администратора'
      });
    }

    next();
  } catch (error) {
    logger.error('Ошибка проверки прав администратора:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

module.exports = { adminOnly }; 