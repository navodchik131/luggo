// Безопасная утилита логирования для продакшена
const isDevelopment = import.meta.env.MODE === 'development'

// Уровни логирования (можно настраивать)
const LOG_LEVELS = {
  ERROR: 0,   // Только критические ошибки
  WARN: 1,    // Предупреждения  
  INFO: 2,    // Важная информация
  DEBUG: 3    // Детальная отладка
}

// Текущий уровень логирования (можно менять для разработки)
const CURRENT_LEVEL = isDevelopment ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR

// Проверка нужно ли выводить лог
const shouldLog = (level) => {
  return isDevelopment && level <= CURRENT_LEVEL
}

// Безопасное логирование с уровнями
const logger = {
  // Только критические ошибки (всегда выводятся)
  error: (...args) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error('❌', ...args)
    }
  },
  
  // Предупреждения
  warn: (...args) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn('⚠️', ...args)
    }
  },
  
  // Важная информация (по умолчанию включена в dev)
  info: (...args) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log('ℹ️', ...args)
    }
  },
  
  // Детальная отладка (отключена по умолчанию)
  debug: (...args) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log('🔍', ...args)
    }
  },

  // Обычные логи (используем info уровень)
  log: (...args) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log('📝', ...args)
    }
  },

  // Безопасное логирование пользовательских действий (только ID)
  userAction: (action, userId) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(`👤 ${action}`, `User: ${userId}`)
    }
  },

  // Логирование API запросов (без чувствительных данных)
  apiCall: (method, url, status) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(`🌐 ${method.toUpperCase()} ${url}`, `Status: ${status}`)
    }
  },

  // WebSocket события (только важные)
  websocket: (event, data = '') => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      if (event === 'connect' || event === 'disconnect' || event === 'error') {
        console.log(`🔌 WebSocket: ${event}`, data)
      }
    }
  },

  // Успешные операции
  success: (...args) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log('✅', ...args)
    }
  },

  // Для критических ошибок, которые нужно видеть в продакшене
  critical: (...args) => {
    console.error('[CRITICAL]', ...args)
  },

  // Безопасное логирование пользовательских данных (только ID)
  userAction: (action, userId) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(`🔵 User Action: ${action}`, `User ID: ${userId}`)
    }
  },

  // Логирование API запросов (без чувствительных данных)
  apiCall: (method, url, status) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(`🌐 API ${method.toUpperCase()} ${url} - Status: ${status}`)
    }
  },

  // WebSocket события
  websocket: (event, data = '') => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(`🔌 WebSocket: ${event}`, data)
    }
  }
}

// Для продакшена - отправка критических ошибок на сервер мониторинга
export const reportError = (error, context = {}) => {
  if (!isDevelopment) {
    // TODO: Интеграция с системой мониторинга (Sentry, LogRocket)
    // Пока просто console.error для критических ошибок
    console.error('[ERROR REPORT]', {
      message: error.message,
      timestamp: new Date().toISOString(),
      url: window.location.href
    })
  } else {
    logger.error('Development Error:', error, context)
  }
}

// Функция для изменения уровня логирования в runtime (для отладки)
logger.setLevel = (level) => {
  if (isDevelopment) {
    window.LUGGO_LOG_LEVEL = level
    console.log(`📊 Log level changed to: ${Object.keys(LOG_LEVELS)[level]}`)
  }
}

export default logger 