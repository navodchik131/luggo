const Joi = require('joi');

const validateRegister = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Введите корректный email',
      'any.required': 'Email обязателен'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Пароль должен содержать минимум 6 символов',
      'any.required': 'Пароль обязателен'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Имя должно содержать минимум 2 символа',
      'string.max': 'Имя не должно превышать 100 символов',
      'any.required': 'Имя обязательно'
    }),
    phone: Joi.string().pattern(/^\d{10,15}$/).required().messages({
      'string.pattern.base': 'Телефон должен содержать от 10 до 15 цифр',
      'any.required': 'Телефон обязателен'
    }),
    role: Joi.string().valid('customer', 'executor').optional(),
    services: Joi.array().items(
      Joi.string().valid('flat', 'office', 'intercity', 'garbage')
    ).optional().messages({
      'array.base': 'Услуги должны быть массивом',
      'any.only': 'Недопустимый тип услуги'
    })
  });

  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Введите корректный email',
      'any.required': 'Email обязателен'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Пароль обязателен'
    })
  });

  return schema.validate(data);
};

module.exports = {
  validateRegister,
  validateLogin
}; 