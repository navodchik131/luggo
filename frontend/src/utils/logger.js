// Безопасная утилита логирования для продакшена
const isDevelopment = import.meta.env.MODE === 'development'

// Безопасное логирование, работает только в development
const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args)
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  // Для критических ошибок, которые нужно видеть в продакшене
  critical: (...args) => {
    console.error('[CRITICAL]', ...args)
  },

  // Безопасное логирование пользовательских данных (только ID)
  userAction: (action, userId) => {
    if (isDevelopment) {
      console.log(`🔵 User Action: ${action}`, `User ID: ${userId}`)
    }
  },

  // Логирование API запросов (без чувствительных данных)
  apiCall: (method, url, status) => {
    if (isDevelopment) {
      console.log(`🌐 API ${method.toUpperCase()} ${url} - Status: ${status}`)
    }
  },

  // WebSocket события
  websocket: (event, data = '') => {
    if (isDevelopment) {
      console.log(`🔌 WebSocket: ${event}`, data)
    }
  }
}

// Для продакшена - отправка критических ошибок на сервер мониторинга
export const reportError = (error, context = {}) => {
  // В production можно добавить отправку в Sentry или другой сервис
  if (!isDevelopment) {
    // TODO: Интеграция с системой мониторинга
    // Пока просто консоль для критических ошибок
    console.error('[ERROR REPORT]', {
      message: error.message,
      timestamp: new Date().toISOString(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    })
  } else {
    console.error('Development Error:', error, context)
  }
}

export default logger 