import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth'
import logger from '../utils/logger'

export const useSocket = () => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (user && !socketRef.current) {
      // Создаем подключение только если пользователь авторизован
      // Извлекаем базовый домен из API URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const socketUrl = apiUrl.replace('/api', '') // Убираем /api из URL
      
      socketRef.current = io(socketUrl, {
        // Поддержка различных транспортов для лучшей совместимости
        transports: ['websocket', 'polling'],
        // Таймауты для продакшена
        timeout: 20000,
        // Настройки переподключения
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 5,
        // Аутентификация
        auth: {
          userId: user.id
        },
        // Для работы за прокси
        forceNew: false,
        // Дополнительные заголовки для CORS
        extraHeaders: {
          'Access-Control-Allow-Origin': '*'
        },
        // Явно указываем path и namespace для избежания ошибок
        path: '/socket.io/',
        // Подключаемся к корневому namespace
        namespace: '/',
        // Дополнительные настройки для исправления namespace ошибок
        autoConnect: true,
        withCredentials: true
      })

      socketRef.current.on('connect', () => {
        logger.websocket('connect', socketUrl)
        // Регистрируем пользователя в Socket.IO
        socketRef.current.emit('registerUser', user.id)
      })

      socketRef.current.on('disconnect', (reason) => {
        logger.websocket('disconnect', reason)
      })

      socketRef.current.on('connect_error', (error) => {
        logger.websocket('error', error.message)
      })

      socketRef.current.on('reconnect', (attemptNumber) => {
        logger.info('WebSocket переподключен после попыток:', attemptNumber)
      })

      socketRef.current.on('reconnect_error', (error) => {
        logger.error('Ошибка переподключения WebSocket:', error.message)
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user])

  const joinTaskRoom = (taskId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('joinTask', taskId)
      logger.debug('Подключились к комнате задачи:', taskId)
    }
  }

  const leaveTaskRoom = (taskId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leaveTask', taskId)
      logger.debug('Покинули комнату задачи:', taskId)
    }
  }

  const sendMessage = (messageData) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sendMessage', messageData)
    }
  }

  const onNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('newMessage', callback)
    }
  }

  const offNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.off('newMessage', callback)
    }
  }

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    joinTaskRoom,
    leaveTaskRoom,
    sendMessage,
    onNewMessage,
    offNewMessage
  }
} 