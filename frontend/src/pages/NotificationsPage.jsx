import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import logger from '../utils/logger'

const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, unread, read
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      if (filter === 'unread') {
        params.unreadOnly = true
      }
      
      const response = await api.get('/notifications', { params })
      
      if (response.data.success) {
        setNotifications(response.data.notifications)
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }))
      } else {
        setError('Ошибка загрузки уведомлений')
      }
    } catch (err) {
      logger.error('Ошибка загрузки уведомлений:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки уведомлений')
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
    } catch (error) {
      logger.error('Ошибка отметки уведомления:', error)
    }
  }

  // Отметить все уведомления как прочитанные
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      )
    } catch (error) {
      logger.error('Ошибка отметки всех уведомлений:', error)
    }
  }

  // Удалить уведомление
  const deleteNotification = async (notificationId) => {
    if (!confirm('Удалить это уведомление?')) return
    
    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      )
    } catch (error) {
      logger.error('Ошибка удаления уведомления:', error)
    }
  }

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user, filter, pagination.page])

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const getTypeLabel = (type) => {
    const labels = {
      new_bid: 'Новый отклик',
      bid_accepted: 'Отклик принят',
      bid_rejected: 'Отклик отклонен',
      new_message: 'Новое сообщение',
      task_status_changed: 'Изменение статуса',
      new_task: 'Новая заявка',
      task_completed: 'Заявка завершена',
      review_received: 'Новый отзыв',
      system: 'Системное'
    }
    return labels[type] || 'Уведомление'
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="text-xl text-gray-600 mb-4">Для просмотра уведомлений необходимо войти в систему</div>
        <Link to="/login" className="btn btn-primary">
          Войти
        </Link>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Уведомления</h1>
          <p className="text-gray-600 mt-1">
            Управляйте своими уведомлениями
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn btn-secondary"
          >
            Отметить все как прочитанные ({unreadCount})
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div className="card mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Все
          </button>
          <button
            onClick={() => handleFilterChange('unread')}
            className={`btn btn-sm ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Непрочитанные
          </button>
          <button
            onClick={() => handleFilterChange('read')}
            className={`btn btn-sm ${filter === 'read' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Прочитанные
          </button>
        </div>
      </div>

      {/* Список уведомлений */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button onClick={loadNotifications} className="btn btn-primary">
            Попробовать еще раз
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔔</div>
          <div className="text-xl text-gray-600 mb-2">
            {filter === 'unread' ? 'Нет непрочитанных уведомлений' : 'Уведомления отсутствуют'}
          </div>
          <div className="text-gray-500">
            {filter === 'unread' 
              ? 'Все уведомления прочитаны!'
              : 'Уведомления будут появляться здесь при новых событиях'
            }
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`card hover:shadow-md transition-shadow ${
                !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Иконка типа */}
                <div className="flex-shrink-0">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>

                {/* Содержимое */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`font-semibold ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {getTypeLabel(notification.type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Удалить уведомление"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {formatTime(notification.createdAt)}
                    </div>

                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          Отметить как прочитанное
                        </button>
                      )}
                      
                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsRead(notification.id)
                            }
                          }}
                        >
                          Перейти
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn btn-secondary btn-sm disabled:opacity-50"
          >
            ← Назад
          </button>
          
          {[...Array(pagination.totalPages)].map((_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-sm ${
                  page === pagination.page 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                {page}
              </button>
            )
          })}
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-secondary btn-sm disabled:opacity-50"
          >
            Вперед →
          </button>
        </div>
      )}
      
      {/* Информация о результатах */}
      {notifications.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Показано {notifications.length} из {pagination.total} уведомлений
        </div>
      )}
    </div>
  )
}

export default NotificationsPage 