import logger from '../utils/logger.js'
// Безопасная утилита логирования для backend
const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Цвета для консоли (только в development)
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const formatLog = (level, ...args) => {
  const timestamp = new Date().toISOString()
  const colorCode = colors[level] || colors.reset
  
  if (isDevelopment) {
    return [`${colorCode}[${timestamp}] ${level.toUpperCase()}:${colors.reset}`, ...args]
  }
  return [`[${timestamp}] ${level.toUpperCase()}:`, ...args]
}

// Безопасное логирование
export const logger = {
  // Только для development
  debug: (...args) => {
    if (isDevelopment) {
      logger.debug(...formatLog('blue', ...args))
    }
  },

  // Информационные сообщения (development + некритичные в production)
  info: (...args) => {
    if (isDevelopment) {
      logger.info(...formatLog('cyan', ...args))
    } else if (isProduction) {
      // В продакшене логируем только важную информацию
      logger.info(`[INFO] ${new Date().toISOString()}:`, ...args)
    }
  },

  // Предупреждения (всегда логируем)
  warn: (...args) => {
    if (isDevelopment) {
      logger.warn(...formatLog('yellow', ...args))
    } else {
      logger.warn(`[WARN] ${new Date().toISOString()}:`, ...args)
    }
  },

  // Ошибки (всегда логируем)
  error: (...args) => {
    if (isDevelopment) {
      logger.error(...formatLog('red', ...args))
    } else {
      logger.error(`[ERROR] ${new Date().toISOString()}:`, ...args)
    }
  },

  // Критические ошибки (всегда логируем с полной информацией)
  critical: (...args) => {
    logger.error(`[CRITICAL] ${new Date().toISOString()}:`, ...args)
  },

  // Безопасное логирование пользовательских действий
  userAction: (action, userId, additionalData = {}) => {
    if (isDevelopment) {
      logger.debug(...formatLog('green', `User Action: ${action}`, `UserID: ${userId}`, additionalData))
    } else {
      // В продакшене логируем только ID пользователя, без чувствительных данных
      logger.debug(`[USER_ACTION] ${new Date().toISOString()}: ${action} by user ${userId}`)
    }
  },

  // Логирование API запросов
  apiRequest: (method, url, userId, status) => {
    if (isDevelopment) {
      logger.debug(...formatLog('magenta', `API ${method} ${url} - User: ${userId} - Status: ${status}`))
    }
    // В продакшене не логируем обычные API запросы
  },

  // Логирование работы с базой данных
  database: (operation, table, recordId = null) => {
    if (isDevelopment) {
      logger.debug(...formatLog('cyan', `DB ${operation} on ${table}`, recordId ? `ID: ${recordId}` : ''))
    }
    // В продакшене не логируем обычные операции БД
  },

  // Логирование WebSocket событий
  websocket: (event, socketId, userId = null) => {
    if (isDevelopment) {
      logger.debug(...formatLog('blue', `WebSocket ${event}`, `Socket: ${socketId}`, userId ? `User: ${userId}` : ''))
    }
    // В продакшене логируем только важные WebSocket события
  },

  // Логирование запуска сервера
  startup: (message) => {
    logger.debug(`[STARTUP] ${new Date().toISOString()}: ${message}`)
  },

  // Логирование аутентификации (всегда важно для безопасности)
  auth: (event, userId, ip, success) => {
    const statusText = success ? 'SUCCESS' : 'FAILED'
    logger.debug(`[AUTH] ${new Date().toISOString()}: ${event} - User: ${userId} - IP: ${ip} - Status: ${statusText}`)
  }
}

// Функция для логирования ошибок с контекстом
export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message,
    stack: isDevelopment ? error.stack : error.message, // Полный stack только в development
    timestamp: new Date().toISOString(),
    context: {
      // Безопасная информация о контексте
      url: context.url,
      method: context.method,
      userId: context.userId,
      ip: context.ip,
      userAgent: isDevelopment ? context.userAgent : 'hidden' // Скрываем userAgent в продакшене
    }
  }

  if (isDevelopment) {
    logger.error('[ERROR_REPORT]', errorInfo)
  } else {
    // В продакшене логируем минимум информации
    logger.error(`[ERROR] ${errorInfo.timestamp}: ${errorInfo.message}`)
  }
}

export default logger 