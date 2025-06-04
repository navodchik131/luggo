import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import BidModal from '../components/BidModal'
import UserAvatar from '../components/UserAvatar'

const TasksPage = () => {
  const { user } = useAuth()
  
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const categoryLabels = {
    flat: 'Квартирный переезд',
    office: 'Офисный переезд',
    intercity: 'Межгородский переезд',
    garbage: 'Вывоз мусора'
  }

  const statusLabels = {
    draft: 'Черновик',
    active: 'Активная',
    in_progress: 'В процессе',
    completed: 'Завершена'
  }

  const statusColors = {
    draft: 'status-draft',
    active: 'status-active',
    in_progress: 'status-pending',
    completed: 'status-completed'
  }

  useEffect(() => {
    loadTasks()
  }, [filters, pagination.page])

  const loadTasks = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      }
      
      // Удаляем пустые значения
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })
      
      console.log('Загружаю заявки с параметрами:', params)
      
      const response = await api.get('/tasks', { params })
      console.log('Ответ API:', response.data)
      
      if (response.data.success) {
        setTasks(response.data.tasks)
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }))
      } else {
        setError('Ошибка загрузки заявок')
      }
    } catch (err) {
      console.error('Ошибка загрузки заявок:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки заявок')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({
      ...prev,
      page: 1
    }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      page
    }))
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

  const handleBidClick = (task) => {
    setSelectedTask(task)
    setBidModalOpen(true)
  }

  const handleBidCreated = (newBid) => {
    console.log('Новый отклик создан:', newBid)
    // Обновляем заявку в списке - добавляем отклик и помечаем как userBid
    setTasks(prev => prev.map(task => 
      task.id === selectedTask.id 
        ? { 
            ...task, 
            bids: [...(task.bids || []), newBid],
            userBid: newBid // Добавляем информацию о том, что пользователь откликнулся
          }
        : task
    ))
    setBidModalOpen(false)
    setSelectedTask(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Заявки на переезд</h1>
        {user && (
          <Link to="/create-task" className="btn btn-primary">
            + Создать заявку
          </Link>
        )}
      </div>

      {/* Фильтры */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-4">🔍 Фильтры</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Поиск */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Поиск
            </label>
            <input
              type="text"
              placeholder="Поиск по заголовку..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Категория */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип переезда
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все типы</option>
              <option value="flat">Квартирный</option>
              <option value="office">Офисный</option>
              <option value="intercity">Межгородский</option>
              <option value="garbage">Вывоз мусора</option>
            </select>
          </div>

          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="in_progress">В процессе</option>
              <option value="completed">Завершенные</option>
            </select>
          </div>

          {/* Сброс фильтров */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ category: '', status: '', search: '' })
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="btn btn-secondary w-full"
            >
              Сбросить
            </button>
          </div>
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
          <button onClick={loadTasks} className="btn btn-primary">
            Попробовать еще раз
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <div className="text-xl text-gray-600 mb-2">Заявок не найдено</div>
          <div className="text-gray-500 mb-4">
            {Object.values(filters).some(v => v) 
              ? 'Попробуйте изменить фильтры поиска'
              : 'Станьте первым, кто создаст заявку!'
            }
          </div>
          {user && (
            <Link to="/create-task" className="btn btn-primary">
              Создать первую заявку
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
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
                    <span>🕒 {formatDateTime(task.createdAt)}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-gray-500">Откуда:</span>
                      <div className="font-medium">{task.fromAddress}</div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Куда:</span>
                      <div className="font-medium">{task.toAddress}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 line-clamp-2">
                    {task.description}
                  </p>
                </div>
                
                <div className="ml-6 text-right">
                  {task.customer && (
                    <div className="flex items-center gap-2 mb-2">
                      <UserAvatar user={task.customer} size="md" />
                      <div className="text-sm">
                        <div className="font-medium">{task.customer.name}</div>
                        {task.customer.role === 'executor' && (
                          <div className="text-gray-500">
                            ⭐ {task.customer.rating || '—'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    Откликов: {task.bids?.length || 0}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t">
                <Link 
                  to={`/tasks/${task.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Подробнее →
                </Link>
                
                {/* Кнопка отклика или информация о статусе */}
                {user && user.role === 'executor' && task.status === 'active' && user.id !== task.customer?.id && (
                  <div>
                    {task.userBid ? (
                      <div className="text-right">
                        <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                          <div className="flex items-center gap-2 text-blue-800">
                            <span>✅</span>
                            <div className="text-sm">
                              <div className="font-medium">Вы откликнулись</div>
                              <div className="text-xs">
                                {task.userBid.price} ₽
                                {task.userBid.accepted && (
                                  <span className="ml-1 bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
                                    ✓ Принят
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleBidClick(task)}
                        className="btn btn-primary btn-sm"
                      >
                        Откликнуться
                      </button>
                    )}
                  </div>
                )}
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

      {/* Модальное окно создания отклика */}
      <BidModal
        isOpen={bidModalOpen}
        onClose={() => {
          setBidModalOpen(false)
          setSelectedTask(null)
        }}
        task={selectedTask}
        onBidCreated={handleBidCreated}
      />
    </div>
  )
}

export default TasksPage 