import logger from '../utils/logger.js'
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validateRegister, validateLogin } = require('../utils/validation');
const { SERVICE_TYPES } = require('../config/constants');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const register = async (req, res) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ 
        message: error.details[0].message 
      });
    }

    const { email, password, name, phone, role = 'customer', services } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Валидация услуг для исполнителей
    let validatedServices = null;
    if (role === 'executor' && services && Array.isArray(services)) {
      const validServices = Object.values(SERVICE_TYPES);
      validatedServices = services.filter(service => 
        validServices.includes(service) && service.trim() !== ''
      );
      
      // Если исполнитель, но не выбрал услуги - ошибка
      if (validatedServices.length === 0) {
        return res.status(400).json({ 
          message: 'Исполнитель должен выбрать хотя бы одну услугу' 
        });
      }
    }

    // Создаём пользователя
    const user = await User.create({
      email,
      password,
      name,
      phone,
      role,
      services: validatedServices
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        rating: user.rating,
        avatar: user.avatar,
        services: user.services
      }
    });
  } catch (error) {
    logger.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      message: 'Ошибка при регистрации пользователя' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ 
        message: error.details[0].message 
      });
    }

    const { email, password } = req.body;

    // Ищем пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    // Проверяем пароль
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Неверный email или пароль' 
      });
    }

    // Проверяем, не заблокирован ли пользователь
    if (user.isBlocked) {
      return res.status(403).json({ 
        message: 'Ваш аккаунт заблокирован' 
      });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        rating: user.rating,
        avatar: user.avatar,
        services: user.services
      }
    });
  } catch (error) {
    logger.error('Ошибка входа:', error);
    res.status(500).json({ 
      message: 'Ошибка при входе в систему' 
    });
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getMe
}; 