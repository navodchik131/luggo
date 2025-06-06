// Логирование вынесено в отдельные console.log для упрощения
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findByPk(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      if (req.user.isBlocked) {
        return res.status(403).json({ message: 'Аккаунт заблокирован' });
      }

      next();
    } catch (error) {
      console.error('Ошибка аутентификации:', error);
      return res.status(401).json({ message: 'Недействительный токен' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Токен не предоставлен' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'У вас нет прав для выполнения этого действия' 
      });
    }
    next();
  };
};

const executorOnly = (req, res, next) => {
  if (req.user.role !== 'executor') {
    return res.status(403).json({
      success: false,
      message: 'Только исполнители могут оставлять отклики на заявки'
    });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id);
    } catch (error) {
      req.user = null;
    }
  }

  next();
};

module.exports = { protect, restrictTo, optionalAuth, executorOnly }; 