import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  UserX, 
  Shield, 
  ShieldOff, 
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import api from '../services/api'
import logger from '../utils/logger'

const AdminUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({})
  
  // Фильтры
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    role: searchParams.get('role') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  })

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await api.get(`/admin/users?${params}`)
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (error) {
      logger.error('Ошибка загрузки пользователей:', error)
      setError('Ошибка загрузки пользователей')
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

  const handleToggleBlock = async (userId, currentStatus) => {
    if (!window.confirm(`${currentStatus ? 'Разблокировать' : 'Заблокировать'} пользователя?`)) {
      return
    }

    try {
      await api.patch(`/admin/users/${userId}/toggle-block`)
      await fetchUsers() // Перезагружаем список
    } catch (error) {
      logger.error('Ошибка изменения статуса пользователя:', error)
      alert('Ошибка изменения статуса пользователя')
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Удалить пользователя "${userName}"? Это действие нельзя отменить.`)) {
      return
    }

    try {
      await api.delete(`/admin/users/${userId}`)
      await fetchUsers() // Перезагружаем список
    } catch (error) {
      logger.error('Ошибка удаления пользователя:', error)
      alert('Ошибка удаления пользователя')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleText = (role) => {
    const roles = {
      customer: 'Заказчик',
      executor: 'Исполнитель',
      admin: 'Администратор'
    }
    return roles[role] || role
  }

  const getRoleBadge = (role) => {
    const badges = {
      customer: 'bg-blue-100 text-blue-800',
      executor: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800'
    }
    return badges[role] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold text-gray-900">Управление пользователями</h1>
        </div>
        <div className="text-sm text-gray-600">
          Всего пользователей: {pagination.total || 0}
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
                placeholder="Поиск по имени или email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Фильтр по роли */}
          <div className="sm:w-48">
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Все роли</option>
              <option value="customer">Заказчики</option>
              <option value="executor">Исполнители</option>
              <option value="admin">Администраторы</option>
            </select>
          </div>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            Пользователи не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Рейтинг
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.rating ? user.rating.toFixed(1) : '0.0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.isBlocked ? 'Заблокирован' : 'Активен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* Просмотр профиля */}
                        <Link
                          to={`/users/${user.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Просмотр профиля"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        {/* Блокировка/разблокировка */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlock(user.id, user.isBlocked)}
                            className={`${
                              user.isBlocked 
                                ? 'text-green-600 hover:text-green-900' 
                                : 'text-orange-600 hover:text-orange-900'
                            }`}
                            title={user.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                          >
                            {user.isBlocked ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                          </button>
                        )}

                        {/* Удаление */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Удалить пользователя"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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

export default AdminUsersPage 