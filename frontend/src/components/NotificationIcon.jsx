import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import logger from '../utils/logger'

const NotificationIcon = () => {
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Загрузка счетчика непрочитанных уведомлений
  const loadUnreadCount = async () => {
    if (!user) return
    
    try {
      const response = await api.get('/notifications/unread-count')
      if (response.data.success) {
        setUnreadCount(response.data.count)
      }
    } catch (error) {
      logger.error('Ошибка загрузки счетчика уведомлений:', error)
    }
  }

  // Загрузка последних уведомлений для dropdown
  const loadRecentNotifications = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await api.get('/notifications?limit=5')
      if (response.data.success) {
        setNotifications(response.data.notifications)
      }
    } catch (error) {
      logger.error('Ошибка загрузки уведомлений:', error)
    } finally {
      setLoading(false)
    }
  }

  // Отметить уведомление как прочитанное
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      logger.error('Ошибка отметки уведомления:', error)
    }
  }

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Загрузка данных при монтировании и авторизации
  useEffect(() => {
    if (user) {
      loadUnreadCount()
    }
  }, [user])

  // Загрузка уведомлений при открытии dropdown
  useEffect(() => {
    if (isOpen && user) {
      loadRecentNotifications()
    }
  }, [isOpen, user])

  // Периодическое обновление счетчика
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      loadUnreadCount()
    }, 30000) // Каждые 30 секунд

    return () => clearInterval(interval)
  }, [user])

  if (!user) return null

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'только что'
    if (diffMins < 60) return `${diffMins} мин назад`
    if (diffHours < 24) return `${diffHours} ч назад`
    if (diffDays < 7) return `${diffDays} дн назад`
    return date.toLocaleDateString('ru-RU')
  }

  const getNotificationIcon = (type) => {
    const icons = {
      new_bid: '💼',
      bid_accepted: '✅',
      bid_rejected: '❌',
      new_message: '💬',
      task_status_changed: '📋',
      new_task: '🆕',
      task_completed: '🎉',
      review_received: '⭐',
      system: '🔔'
    }
    return icons[type] || '🔔'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Иконка уведомлений */}
      <button
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        
        {/* Счетчик непрочитанных */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown с уведомлениями */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-w-[calc(100vw-2rem)] sm:max-w-none">
          {/* Заголовок */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Уведомления</h3>
              <Link
                to="/notifications"
                className="text-sm text-blue-600 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Все
              </Link>
            </div>
          </div>

          {/* Список уведомлений */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl sm:text-3xl mb-2">🔔</div>
                <div className="text-sm sm:text-base">Нет новых уведомлений</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id)
                    }
                    if (notification.actionUrl) {
                      setIsOpen(false)
                      // Переход по ссылке будет обработан через Link компонент
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                        {notification.title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Футер */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <Link
                to="/notifications"
                className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Посмотреть все уведомления
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationIcon 