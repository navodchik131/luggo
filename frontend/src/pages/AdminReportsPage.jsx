import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Calendar, 
  Download, 
  TrendingUp, 
  Users,
  FileText,
  DollarSign,
  BarChart3
} from 'lucide-react'
import api from '../services/api'
import logger from '../utils/logger'

const AdminReportsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [selectedPeriod, setSelectedPeriod] = useState(
    searchParams.get('period') || 'week'
  )

  useEffect(() => {
    fetchReports()
  }, [selectedPeriod])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/reports?period=${selectedPeriod}`)
      setReports(response.data.reports)
    } catch (error) {
      logger.error('Ошибка загрузки отчетов:', error)
      setError('Ошибка загрузки отчетов')
    } finally {
      setLoading(false)
    }
  }

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    setSearchParams({ period })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount || 0)
  }

  const getPeriodText = (period) => {
    const periods = {
      week: 'Неделя',
      month: 'Месяц',
      year: 'Год'
    }
    return periods[period] || period
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

  const getCategoryText = (category) => {
    const categories = {
      flat: 'Квартирный переезд',
      office: 'Офисный переезд',
      intercity: 'Межгород',
      garbage: 'Вывоз мусора'
    }
    return categories[category] || category
  }

  const getRoleText = (role) => {
    const roles = {
      customer: 'Заказчики',
      executor: 'Исполнители',
      admin: 'Администраторы'
    }
    return roles[role] || role
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
          <h1 className="text-3xl font-bold text-gray-900">Отчеты и аналитика</h1>
        </div>
        
        {/* Фильтр периода */}
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {getPeriodText(period)}
            </button>
          ))}
        </div>
      </div>

      {/* Информация о периоде */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="font-medium">Период отчета:</span>
            <span className="text-gray-600">
              {formatDate(reports?.startDate)} - {formatDate(reports?.endDate)}
            </span>
          </div>
          <button className="btn btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Экспорт</span>
          </button>
        </div>
      </div>

      {/* Статистика по заявкам */}
      {reports?.taskStats?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Статистика по заявкам
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* По статусам */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">По статусам</h4>
              <div className="space-y-2">
                {reports.taskStats
                  .reduce((acc, item) => {
                    const existing = acc.find(x => x.status === item.status)
                    if (existing) {
                      existing.count = parseInt(existing.count) + parseInt(item.count)
                      existing.totalBudget = parseFloat(existing.totalBudget || 0) + parseFloat(item.totalBudget || 0)
                    } else {
                      acc.push(item)
                    }
                    return acc
                  }, [])
                  .map((stat) => (
                    <div key={stat.status} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{getStatusText(stat.status)}</span>
                      <div className="text-right">
                        <div className="font-semibold">{stat.count} заявок</div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(stat.totalBudget)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* По категориям */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">По категориям</h4>
              <div className="space-y-2">
                {reports.taskStats
                  .reduce((acc, item) => {
                    const existing = acc.find(x => x.category === item.category)
                    if (existing) {
                      existing.count = parseInt(existing.count) + parseInt(item.count)
                      existing.avgBudget = (parseFloat(existing.avgBudget || 0) + parseFloat(item.avgBudget || 0)) / 2
                    } else {
                      acc.push(item)
                    }
                    return acc
                  }, [])
                  .map((stat) => (
                    <div key={stat.category} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">{getCategoryText(stat.category)}</span>
                      <div className="text-right">
                        <div className="font-semibold">{stat.count} заявок</div>
                        <div className="text-sm text-gray-600">
                          Средний бюджет: {formatCurrency(stat.avgBudget)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Статистика по пользователям */}
      {reports?.userStats?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Новые пользователи
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.userStats.map((stat) => (
              <div key={stat.role} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                <div className="text-sm text-gray-600">{getRoleText(stat.role)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Самые активные пользователи */}
      {reports?.activeUsers?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Самые активные пользователи
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2">#</th>
                  <th className="pb-2">Имя</th>
                  <th className="pb-2">Роль</th>
                  <th className="pb-2">Рейтинг</th>
                  <th className="pb-2">Активность</th>
                </tr>
              </thead>
              <tbody>
                {reports.activeUsers.map((user, index) => (
                  <tr key={user.id} className="border-t">
                    <td className="py-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 font-medium">{user.name}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'executor' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center space-x-1">
                        <span>{user.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="text-sm text-gray-600">
                        Высокая активность
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Общая сводка */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Общая сводка за {getPeriodText(selectedPeriod).toLowerCase()}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {reports?.userStats?.reduce((sum, stat) => sum + parseInt(stat.count), 0) || 0}
            </div>
            <div className="text-sm text-gray-600">Новых пользователей</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {reports?.taskStats?.reduce((sum, stat) => sum + parseInt(stat.count), 0) || 0}
            </div>
            <div className="text-sm text-gray-600">Новых заявок</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {reports?.activeUsers?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Активных пользователей</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                reports?.taskStats?.reduce((sum, stat) => sum + parseFloat(stat.totalBudget || 0), 0) || 0
              )}
            </div>
            <div className="text-sm text-gray-600">Общий оборот</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReportsPage 