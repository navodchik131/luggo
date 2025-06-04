import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import UserAvatar from '../components/UserAvatar'

const ExecutorsPage = () => {
  const [executors, setExecutors] = useState([])
  const [stats, setStats] = useState(null)
  const [services, setServices] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    minRating: '',
    hasVehiclePhotos: '',
    services: [],
    sortBy: 'rating'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    loadStats()
    loadServices()
  }, [])

  useEffect(() => {
    loadExecutors()
  }, [filters, pagination.page])

  const loadServices = async () => {
    try {
      const response = await api.get('/users/services')
      if (response.data.success) {
        setServices(response.data.services)
      }
    } catch (err) {
      console.error('Ошибка загрузки услуг:', err)
    }
  }

  const loadExecutors = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
        // Преобразуем массив услуг в строку для API
        services: filters.services.length > 0 ? filters.services.join(',') : ''
      }
      
      // Удаляем пустые значения
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })
      
      console.log('Загружаю исполнителей с параметрами:', params)
      
      const response = await api.get('/users/executors', { params })
      console.log('Ответ API:', response.data)
      
      if (response.data.success) {
        setExecutors(response.data.executors)
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }))
      } else {
        setError('Ошибка загрузки исполнителей')
      }
    } catch (err) {
      console.error('Ошибка загрузки исполнителей:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки исполнителей')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await api.get('/users/executors/stats')
      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err)
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

  const handleServiceFilterChange = (serviceKey, checked) => {
    setFilters(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, serviceKey]
        : prev.services.filter(s => s !== serviceKey)
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
      month: 'long'
    })
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    
    // Извлекаем тип папки и имя файла из пути
    const pathParts = imagePath.split('/')
    if (pathParts.length < 3) return null
    
    const type = pathParts[1] // avatars или vehicles
    const filename = pathParts[2] // имя файла
    
    // Используем API эндпоинт вместо прямого доступа к статическим файлам
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/image/${type}/${filename}`
  }

  const getRatingStars = (rating) => {
    if (!rating) return '—'
    const stars = Math.round(rating)
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Заголовок и статистика */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Исполнители</h1>
        <p className="text-gray-600 mb-6">
          Найдите надежных исполнителей для вашего переезда
        </p>
        
        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.totalExecutors}</div>
              <div className="text-sm text-blue-600">Всего исполнителей</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{stats.executorsWithPhotos}</div>
              <div className="text-sm text-green-600">С фото автомобилей</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
              </div>
              <div className="text-sm text-yellow-600">Средний рейтинг</div>
            </div>
          </div>
        )}
      </div>

      {/* Фильтры */}
      <div className="card mb-8">
        <h3 className="font-semibold mb-4">🔍 Фильтры и сортировка</h3>
        <div className="space-y-4">
          {/* Основные фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Поиск */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Поиск по имени
              </label>
              <input
                type="text"
                placeholder="Введите имя..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Минимальный рейтинг */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Минимальный рейтинг
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Любой</option>
                <option value="4">4+ звезд</option>
                <option value="3">3+ звезд</option>
                <option value="2">2+ звезд</option>
              </select>
            </div>

            {/* Фото автомобилей */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фото автомобилей
              </label>
              <select
                value={filters.hasVehiclePhotos}
                onChange={(e) => handleFilterChange('hasVehiclePhotos', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Не важно</option>
                <option value="true">Только с фото</option>
              </select>
            </div>

            {/* Сортировка */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сортировка
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">По рейтингу</option>
                <option value="name">По имени</option>
                <option value="createdAt">По дате регистрации</option>
              </select>
            </div>
          </div>

          {/* Фильтр по услугам */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Услуги
            </label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(services).map(([key, name]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.services.includes(key)}
                    onChange={(e) => handleServiceFilterChange(key, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">{name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Сброс фильтров */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setFilters({ search: '', minRating: '', hasVehiclePhotos: '', services: [], sortBy: 'rating' })
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="btn btn-secondary"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </div>

      {/* Список исполнителей */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button onClick={loadExecutors} className="btn btn-primary">
            Попробовать еще раз
          </button>
        </div>
      ) : executors.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👷</div>
          <div className="text-xl text-gray-600 mb-2">Исполнители не найдены</div>
          <div className="text-gray-500 mb-4">
            {Object.values(filters).some(v => v && v !== 'rating') 
              ? 'Попробуйте изменить фильтры поиска'
              : 'На платформе пока нет зарегистрированных исполнителей'
            }
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {executors.map(executor => (
            <div key={executor.id} className="card hover:shadow-lg transition-shadow">
              {/* Аватар и основная информация */}
              <div className="text-center mb-4">
                <div className="mx-auto mb-3">
                  <UserAvatar user={executor} size="2xl" />
                </div>
                
                <h3 className="text-lg font-semibold mb-1">
                  <Link 
                    to={`/executor/${executor.id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {executor.name}
                  </Link>
                </h3>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-yellow-600 text-sm">
                    {getRatingStars(executor.rating)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {executor.rating ? executor.rating.toFixed(1) : '—'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {executor.reviewsCount} отзыв{executor.reviewsCount === 1 ? '' : 
                    executor.reviewsCount < 5 ? 'а' : 'ов'}
                </div>
              </div>

              {/* Фотографии автомобилей */}
              {executor.vehiclePhotos && executor.vehiclePhotos.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">
                    Автомобиль ({executor.vehiclePhotosCount} фото)
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {executor.vehiclePhotos.slice(0, 4).map((photo, index) => (
                      <div key={photo.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                        <img
                          src={getImageUrl(photo.path)}
                          alt={photo.description || 'Фото автомобиля'}
                          className="w-full h-full object-cover"
                        />
                        {index === 3 && executor.vehiclePhotosCount > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              +{executor.vehiclePhotosCount - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Информация */}
              <div className="space-y-1 text-xs text-gray-500 mb-4">
                <div>📅 На платформе с {formatDate(executor.createdAt)}</div>
                {executor.vehiclePhotosCount === 0 && (
                  <div className="text-orange-600">⚠️ Нет фото автомобиля</div>
                )}
                
                {/* Услуги исполнителя */}
                {executor.services && executor.services.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-gray-600 mb-1">Услуги:</div>
                    <div className="flex flex-wrap gap-1">
                      {executor.services.map(serviceKey => (
                        <span 
                          key={serviceKey}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {services[serviceKey]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Кнопка просмотра профиля */}
              <Link 
                to={`/executor/${executor.id}`}
                className="btn btn-primary w-full text-sm"
              >
                Посмотреть профиль
              </Link>
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
      {executors.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Показано {executors.length} из {pagination.total} исполнителей
        </div>
      )}
    </div>
  )
}

export default ExecutorsPage 