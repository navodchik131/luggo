import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth'

export const useSocket = () => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (user && !socketRef.current) {
      // Создаем подключение только если пользователь авторизован
      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
      
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
        console.log('🟢 WebSocket подключен к:', socketUrl)
        console.log('🔗 Transport:', socketRef.current.io.engine.transport.name)
        // Регистрируем пользователя в Socket.IO
        socketRef.current.emit('registerUser', user.id)
      })

      socketRef.current.on('disconnect', (reason) => {
        console.log('🔴 WebSocket отключен. Причина:', reason)
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Ошибка WebSocket подключения:', error)
        console.log('🔄 Попытка переподключения...')
      })

      socketRef.current.on('reconnect', (attemptNumber) => {
        console.log('🔄 WebSocket переподключен после', attemptNumber, 'попыток')
      })

      socketRef.current.on('reconnect_error', (error) => {
        console.error('❌ Ошибка переподключения WebSocket:', error)
      })

      // Логируем смену транспорта
      socketRef.current.io.on('upgrade', () => {
        console.log('⬆️ Upgraded to', socketRef.current.io.engine.transport.name)
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
      console.log('🚪 Подключились к комнате задачи:', taskId)
    }
  }

  const leaveTaskRoom = (taskId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leaveTask', taskId)
      console.log('🚪 Покинули комнату задачи:', taskId)
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