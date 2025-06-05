import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Star,
  Clock,
  AlertCircle
} from 'lucide-react'
import api from '../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error)
      setError('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Админ панель</h1>
        <div className="flex space-x-2">
          <Link 
            to="/admin/users" 
            className="btn btn-secondary"
          >
            Пользователи
          </Link>
          <Link 
            to="/admin/tasks" 
            className="btn btn-secondary"
          >
            Заявки
          </Link>
          <Link 
            to="/admin/reports" 
            className="btn btn-primary"
          >
            Отчеты
          </Link>
          <Link 
            to="/admin/news" 
            className="btn btn-secondary"
          >
            Новости
          </Link>
        </div>
      </div>

      {/* Обзорные карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalUsers || 0}</p>
              <p className="text-sm text-green-600">+{stats?.growth?.weeklyUsers || 0} за неделю</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего заявок</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.totalTasks || 0}</p>
              <p className="text-sm text-green-600">+{stats?.growth?.weeklyTasks || 0} за неделю</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активные заявки</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.activeTasks || 0}</p>
              <p className="text-sm text-orange-600">В работе</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Доход за месяц</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats?.overview?.monthlyRevenue)}
              </p>
              <p className="text-sm text-green-600">Завершенные заявки</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Детальная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Пользователи по ролям</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Заказчики</span>
              <span className="font-semibold">{stats?.overview?.totalCustomers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Исполнители</span>
              <span className="font-semibold">{stats?.overview?.totalExecutors || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Всего откликов</span>
              <span className="font-semibold">{stats?.overview?.totalBids || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Статус заявок</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Активные</span>
              <span className="font-semibold text-orange-600">{stats?.overview?.activeTasks || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Завершенные</span>
              <span className="font-semibold text-green-600">{stats?.overview?.completedTasks || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Всего</span>
              <span className="font-semibold">{stats?.overview?.totalTasks || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Быстрые действия</h3>
          <div className="space-y-2">
            <Link 
              to="/admin/users?role=executor" 
              className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Управление исполнителями
            </Link>
            <Link 
              to="/admin/tasks?status=active" 
              className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Активные заявки
            </Link>
            <Link 
              to="/admin/reports?period=week" 
              className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Отчет за неделю
            </Link>
            <Link 
              to="/admin/news" 
              className="block p-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Управление новостями
            </Link>
          </div>
        </div>
      </div>

      {/* Топ исполнители */}
      {stats?.topExecutors?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Топ исполнители</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2">Имя</th>
                  <th className="pb-2">Рейтинг</th>
                  <th className="pb-2">Дата регистрации</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {stats.topExecutors.map((executor, index) => (
                  <tr key={executor.id} className="border-t">
                    <td className="py-2">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span>{executor.name}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{executor.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </td>
                    <td className="py-2 text-gray-600">
                      {formatDate(executor.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Последние заявки */}
      {stats?.recentTasks?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Последние заявки</h3>
            <Link to="/admin/tasks" className="text-sm text-blue-600 hover:underline">
              Все заявки
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2">Заявка</th>
                  <th className="pb-2">Заказчик</th>
                  <th className="pb-2">Статус</th>
                  <th className="pb-2">Бюджет</th>
                  <th className="pb-2">Дата</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTasks.map((task) => (
                  <tr key={task.id} className="border-t">
                    <td className="py-2">
                      <Link 
                        to={`/tasks/${task.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {task.title}
                      </Link>
                    </td>
                    <td className="py-2">{task.customer?.name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'active' ? 'bg-green-100 text-green-800' :
                        task.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        task.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'active' ? 'Активна' :
                         task.status === 'completed' ? 'Завершена' :
                         task.status === 'in_progress' ? 'В работе' :
                         task.status}
                      </span>
                    </td>
                    <td className="py-2">{formatCurrency(task.budget)}</td>
                    <td className="py-2 text-gray-600">
                      {formatDate(task.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard 