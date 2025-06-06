import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import api from '../services/api'
import logger from '../utils/logger'

const UnreadContext = createContext()

export const useUnread = () => {
  const context = useContext(UnreadContext)
  if (!context) {
    throw new Error('useUnread must be used within UnreadProvider')
  }
  return context
}

export const UnreadProvider = ({ children }) => {
  const { user } = useAuth()
  const { onNewMessage, offNewMessage } = useSocket()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Загружаем количество непрочитанных сообщений при монтировании
    if (user) {
      loadUnreadCount()
      // Периодически обновляем счетчик каждые 30 секунд
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // WebSocket слушатель для обновления счетчика
  useEffect(() => {
    if (user) {
      const handleNewMessage = (messageData) => {
        // Если сообщение адресовано текущему пользователю, увеличиваем счетчик
        if (messageData.receiverId === user.id) {
          setUnreadCount(prev => prev + 1)
        }
      }
      
      onNewMessage(handleNewMessage)
      
      return () => {
        offNewMessage(handleNewMessage)
      }
    }
  }, [user, onNewMessage, offNewMessage])

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count')
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      logger.error('Ошибка загрузки счетчика непрочитанных сообщений:', error)
    }
  }

  const markAsRead = (count = 1) => {
    setUnreadCount(prev => Math.max(0, prev - count))
  }

  const resetUnreadCount = () => {
    setUnreadCount(0)
  }

  const value = {
    unreadCount,
    loadUnreadCount,
    markAsRead,
    resetUnreadCount
  }

  return (
    <UnreadContext.Provider value={value}>
      {children}
    </UnreadContext.Provider>
  )
} 