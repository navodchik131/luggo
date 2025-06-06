import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import logger from '../utils/logger'

const MyTasksPage = () => {
  const { user } = useAuth()
  
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const statusLabels = {
    draft: 'Черновик',
    active: 'Активная',
    in_progress: 'В процессе',
    awaiting_confirmation: 'Ожидает подтверждения',
    completed: 'Завершена'
  }

  const statusColors = {
    draft: 'status-draft',
    active: 'status-active',
    in_progress: 'status-pending',
    awaiting_confirmation: 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium',
    completed: 'status-completed'
  }

  const categoryLabels = {
    flat: 'Квартирный переезд',
    office: 'Офисный переезд',
    intercity: 'Межгородский переезд',
    garbage: 'Вывоз мусора'
  }

  useEffect(() => {
    loadMyTasks()
  }, [statusFilter, pagination.page])

  const loadMyTasks = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      if (statusFilter) {
        params.status = statusFilter
      }
      
      logger.log('Загружаю мои заявки с параметрами:', params)
      
      const response = await api.get('/tasks/my', { params })
      logger.log('Ответ API моих заявок:', response.data)
      
      if (response.data.success) {
        setTasks(response.data.tasks)
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }))
      } else {
        setError('Ошибка загрузки ваших заявок')
      }
    } catch (err) {
      logger.error('Ошибка загрузки моих заявок:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки ваших заявок')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusStats = () => {
    if (tasks.length === 0) return {}
    
    return tasks.reduce((stats, task) => {
      stats[task.status] = (stats[task.status] || 0) + 1
      return stats
    }, {})
  }

  const statusStats = getStatusStats()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Мои заявки</h1>
          <p className="text-gray-600 mt-2">
            Управляйте своими заявками и отслеживайте отклики
          </p>
        </div>
        <Link to="/create-task" className="btn btn-primary">
          + Создать заявку
        </Link>
      </div>

      {/* Статистика */}
      {!loading && tasks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {statusStats.active || 0}
            </div>
            <div className="text-sm text-green-700">Активные</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {statusStats.in_progress || 0}
            </div>
            <div className="text-sm text-yellow-700">В процессе</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {statusStats.completed || 0}
            </div>
            <div className="text-sm text-blue-700">Завершенные</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-600">
              {tasks.reduce((sum, task) => sum + (task.stats?.totalBids || 0), 0)}
            </div>
            <div className="text-sm text-gray-700">Всего откликов</div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-4">🔍 Фильтр по статусу</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('')}
            className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-secondary'}`}
          >
            Все
          </button>
          <button
            onClick={() => handleStatusFilter('active')}
            className={`btn btn-sm ${statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Активные
          </button>
          <button
            onClick={() => handleStatusFilter('in_progress')}
            className={`btn btn-sm ${statusFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
          >
            В процессе
          </button>
          <button
            onClick={() => handleStatusFilter('awaiting_confirmation')}
            className={`btn btn-sm ${statusFilter === 'awaiting_confirmation' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Ожидает подтверждения
          </button>
          <button
            onClick={() => handleStatusFilter('completed')}
            className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Завершенные
          </button>
        </div>
      </div>

      {/* Список заявок */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button onClick={loadMyTasks} className="btn btn-primary">
            Попробовать еще раз
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <div className="text-xl text-gray-600 mb-2">
            {statusFilter ? 'Заявок с таким статусом не найдено' : 'У вас пока нет заявок'}
          </div>
          <div className="text-gray-500 mb-4">
            Создайте первую заявку, чтобы найти исполнителей
          </div>
          <Link to="/create-task" className="btn btn-primary">
            Создать заявку
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {tasks.map(task => (
            <div key={task.id} className="card hover:shadow-md transition-shadow">
              {/* Заголовок заявки */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      <Link 
                        to={`/tasks/${task.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {task.title}
                      </Link>
                    </h3>
                    <span className={statusColors[task.status]}>
                      {statusLabels[task.status]}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">{categoryLabels[task.category]}</span>
                    <span className="mx-2">•</span>
                    <span>📅 {formatDate(task.date)}</span>
                    <span className="mx-2">•</span>
                    <span>🕒 Создана {formatDateTime(task.createdAt)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <Link
                    to={`/tasks/${task.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    Управление
                  </Link>
                </div>
              </div>

              {/* Адреса */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-500">Откуда:</span>
                  <div className="font-medium">{task.fromAddress}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Куда:</span>
                  <div className="font-medium">{task.toAddress}</div>
                </div>
              </div>

              {/* Статистика откликов */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">
                    📈 Отклики ({task.stats?.totalBids || 0})
                  </h4>
                  {task.stats?.totalBids > 0 && (
                    <div className="text-sm text-gray-600">
                      Средняя цена: {task.stats.averagePrice.toLocaleString()} ₽
                    </div>
                  )}
                </div>

                {task.stats?.totalBids === 0 ? (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                    <div className="text-2xl mb-1">📝</div>
                    <div className="text-sm">Пока нет откликов</div>
                  </div>
                ) : (
                  <div>
                    {/* Принятый отклик */}
                    {task.stats.acceptedBid && (
                      <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-semibold">✓ Принятый отклик</span>
                            <span className="text-sm text-gray-600">
                              от {task.stats.acceptedBid.executor?.name}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {task.stats.acceptedBid.price} ₽
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Кратная статистика */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold">{task.stats.totalBids}</div>
                        <div className="text-xs text-gray-600">Всего откликов</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          {task.stats.averagePrice.toLocaleString()} ₽
                        </div>
                        <div className="text-xs text-gray-600">Средняя цена</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {task.stats.latestBidDate ? formatDateTime(task.stats.latestBidDate) : '—'}
                        </div>
                        <div className="text-xs text-gray-600">Последний отклик</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Действия */}
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <Link 
                    to={`/tasks/${task.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {task.stats?.totalBids > 0 ? 'Просмотреть отклики →' : 'Подробнее →'}
                  </Link>
                  
                  {task.status === 'active' && task.stats?.totalBids > 0 && (
                    <span className="text-sm text-green-600 font-medium">
                      {task.stats.totalBids} новых откликов
                    </span>
                  )}
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
      {tasks.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Показано {tasks.length} из {pagination.total} заявок
        </div>
      )}
    </div>
  )
}

export default MyTasksPage 