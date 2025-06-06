import logger from '../utils/logger'
// Безопасная утилита логирования для продакшена
const isDevelopment = import.meta.env.MODE === 'development'

// Безопасное логирование, работает только в development
export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      logger.log(...args)
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      logger.error(...args)
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      logger.warn(...args)
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      logger.info(...args)
    }
  },

  // Для критических ошибок, которые нужно видеть в продакшене
  critical: (...args) => {
    logger.error('[CRITICAL]', ...args)
  },

  // Безопасное логирование пользовательских данных (только ID)
  userAction: (action, userId) => {
    if (isDevelopment) {
      logger.log(`🔵 User Action: ${action}`, `User ID: ${userId}`)
    }
  },

  // Логирование API запросов (без чувствительных данных)
  apiCall: (method, url, status) => {
    if (isDevelopment) {
      logger.log(`🌐 API ${method.toUpperCase()} ${url} - Status: ${status}`)
    }
  },

  // WebSocket события
  websocket: (event, data = '') => {
    if (isDevelopment) {
      logger.log(`🔌 WebSocket: ${event}`, data)
    }
  }
}

// Для продакшена - отправка критических ошибок на сервер мониторинга
export const reportError = (error, context = {}) => {
  // В production можно добавить отправку в Sentry или другой сервис
  if (!isDevelopment) {
    // TODO: Интеграция с системой мониторинга
    // Пока просто консоль для критических ошибок
    logger.error('[ERROR REPORT]', {
      message: error.message,
      timestamp: new Date().toISOString(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    })
  } else {
    logger.error('Development Error:', error, context)
  }
}

export default logger 