import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth'

export const useSocket = () => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (user && !socketRef.current) {
      // Создаем подключение только если пользователь авторизован
      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
        auth: {
          userId: user.id
        }
      })

      socketRef.current.on('connect', () => {
        console.log('🟢 WebSocket подключен')
        // Регистрируем пользователя в Socket.IO
        socketRef.current.emit('registerUser', user.id)
      })

      socketRef.current.on('disconnect', () => {
        console.log('🔴 WebSocket отключен')
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Ошибка WebSocket подключения:', error)
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
    if (socketRef.current) {
      socketRef.current.emit('joinTask', taskId)
      console.log('🚪 Подключились к комнате задачи:', taskId)
    }
  }

  const leaveTaskRoom = (taskId) => {
    if (socketRef.current) {
      socketRef.current.emit('leaveTask', taskId)
      console.log('🚪 Покинули комнату задачи:', taskId)
    }
  }

  const sendMessage = (messageData) => {
    if (socketRef.current) {
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
    joinTaskRoom,
    leaveTaskRoom,
    sendMessage,
    onNewMessage,
    offNewMessage
  }
} 