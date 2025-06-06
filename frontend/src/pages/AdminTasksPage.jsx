import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import api from '../services/api'
import logger from '../utils/logger'

const AdminTasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({})
  
  // Фильтры
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    category: searchParams.get('category') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  })

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/admin/tasks?${params}`)
      setTasks(response.data.tasks)
      setPagination(response.data.pagination)
    } catch (error) {
      logger.error('Ошибка загрузки заявок:', error)
      setError('Ошибка загрузки заявок')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)
    
    // Обновляем URL
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && k !== 'limit' && k !== 'sortBy' && k !== 'sortOrder') {
        newSearchParams.set(k, v)
      }
    })
    setSearchParams(newSearchParams)
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusChange = async (taskId, newStatus) => {
    if (!window.confirm(`Изменить статус заявки на "${getStatusText(newStatus)}"?`)) {
      return
    }

    try {
      await api.patch(`/admin/tasks/${taskId}/status`, { status: newStatus })
      await fetchTasks() // Перезагружаем список
    } catch (error) {
      logger.error('Ошибка изменения статуса заявки:', error)
      alert('Ошибка изменения статуса заявки')
    }
  }

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Удалить заявку "${taskTitle}"? Это действие нельзя отменить.`)) {
      return
    }

    try {
      await api.delete(`/admin/tasks/${taskId}`)
      await fetchTasks() // Перезагружаем список
    } catch (error) {
      logger.error('Ошибка удаления заявки:', error)
      alert('Ошибка удаления заявки')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount || 0)
  }

  const getStatusText = (status) => {
    const statuses = {
      draft: 'Черновик',
      active: 'Активна',
      in_progress: 'В работе',
      awaiting_confirmation: 'Ожидает подтверждения',
      completed: 'Завершена',
      cancelled: 'Отменена'
    }
    return statuses[status] || status
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      in_progress: 'bg-orange-100 text-orange-800',
      awaiting_confirmation: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryText = (category) => {
    const categories = {
      flat: 'Квартирный переезд',
      office: 'Офисный переезд',
      intercity: 'Межгород',
      garbage: 'Вывоз мусора'
    }
    return categories[category] || category
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и навигация */}
      <div className="flex justify-between items-center">
        <div>
          <Link 
            to="/admin" 
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Назад к админ панели
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Управление заявками</h1>
        </div>
        <div className="text-sm text-gray-600">
          Всего заявок: {pagination.total || 0}
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию заявки..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Фильтр по статусу */}
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Все статусы</option>
              <option value="draft">Черновик</option>
              <option value="active">Активна</option>
              <option value="in_progress">В работе</option>
              <option value="awaiting_confirmation">Ожидает подтверждения</option>
              <option value="completed">Завершена</option>
              <option value="cancelled">Отменена</option>
            </select>
          </div>

          {/* Фильтр по категории */}
          <div className="sm:w-48">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Все категории</option>
              <option value="flat">Квартирный</option>
              <option value="office">Офисный</option>
              <option value="intercity">Межгород</option>
              <option value="garbage">Вывоз мусора</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица заявок */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Заявки не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заявка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заказчик
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Бюджет
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 max-w-xs truncate" title={task.title}>
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          Откликов: {task.bids?.length || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{task.customer?.name}</div>
                        <div className="text-sm text-gray-500">{task.customer?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryText(task.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                        {/* Быстрое изменение статуса */}
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="text-xs border-gray-300 rounded"
                        >
                          <option value="draft">Черновик</option>
                          <option value="active">Активна</option>
                          <option value="in_progress">В работе</option>
                          <option value="awaiting_confirmation">Ожидает подтверждения</option>
                          <option value="completed">Завершена</option>
                          <option value="cancelled">Отменена</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(task.budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Просмотр заявки */}
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Просмотр заявки"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Открыть в новой вкладке */}
                        <Link
                          to={`/tasks/${task.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900"
                          title="Открыть в новой вкладке"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {/* Удаление */}
                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="text-red-600 hover:text-red-900"
                          title="Удалить заявку"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 border rounded-lg flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Показано {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-2 text-sm">
              {pagination.page} из {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminTasksPage 