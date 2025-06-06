import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import UserAvatar from '../components/UserAvatar'
import logger from '../utils/logger'

const ExecutorProfilePage = () => {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/profile/public/${userId}`)
      
      if (response.data.success) {
        setProfile(response.data.user)
      } else {
        setError('Профиль не найден')
      }
    } catch (err) {
      logger.error('Ошибка загрузки профиля:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки профиля')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const calculateRatingStats = (reviews) => {
    if (!reviews || reviews.length === 0) return null

    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: reviews.filter(review => review.rating === rating).length,
      percentage: (reviews.filter(review => review.rating === rating).length / totalReviews) * 100
    }))

    return {
      totalReviews,
      averageRating,
      ratingDistribution
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">{error}</div>
        <Link to="/tasks" className="btn btn-primary">
          Вернуться к заявкам
        </Link>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-xl mb-4">Профиль не найден</div>
        <Link to="/tasks" className="btn btn-primary">
          Вернуться к заявкам
        </Link>
      </div>
    )
  }

  const ratingStats = calculateRatingStats(profile.receivedReviews)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Хлебные крошки */}
      <nav className="text-sm">
        <Link to="/" className="text-blue-600 hover:underline">Главная</Link>
        <span className="mx-2">→</span>
        <Link to="/tasks" className="text-blue-600 hover:underline">Заявки</Link>
        <span className="mx-2">→</span>
        <span className="text-gray-600">Профиль исполнителя</span>
      </nav>

      {/* Основная информация */}
      <div className="card">
        <div className="flex items-start gap-6">
          {/* Аватар */}
          <div className="flex-shrink-0">
            <UserAvatar user={profile} size="2xl" />
          </div>

          {/* Информация об исполнителе */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                Исполнитель
              </span>
            </div>

            <div className="space-y-2 text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span className="font-medium">
                  {profile.rating ? profile.rating.toFixed(1) : '—'}/5
                </span>
                {ratingStats && (
                  <span className="text-sm">
                    ({ratingStats.totalReviews} отзыв{ratingStats.totalReviews === 1 ? '' : 
                    ratingStats.totalReviews < 5 ? 'а' : 'ов'})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>На платформе с {formatDate(profile.createdAt)}</span>
              </div>
            </div>

            {/* Статистика рейтинга */}
            {ratingStats && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-3">Распределение оценок</h3>
                <div className="space-y-2">
                  {ratingStats.ratingDistribution.reverse().map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm w-6">{rating}⭐</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Контактная информация */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-medium mb-3">Контактная информация</h3>
              {profile.email && profile.phone ? (
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                      {profile.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <a href={`tel:${profile.phone}`} className="text-blue-600 hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <span>🔒</span>
                    <span className="text-sm font-medium">Контактная информация скрыта</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-1">
                    Исполнитель скрыл свои контакты. Вы сможете связаться через чат после создания заявки.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Фотографии автомобиля */}
      {profile.vehiclePhotos && profile.vehiclePhotos.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Автомобиль исполнителя</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profile.vehiclePhotos.map(photo => (
              <div key={photo.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getImageUrl(photo.path)}
                  alt={photo.description || 'Фото автомобиля'}
                  className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => {
                    // Можно добавить модальное окно для просмотра в полном размере
                    window.open(getImageUrl(photo.path), '_blank')
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Отзывы */}
      {profile.receivedReviews && profile.receivedReviews.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium mb-4">
            Отзывы ({profile.receivedReviews.length})
          </h3>
          
          <div className="space-y-6">
            {profile.receivedReviews.map(review => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={review.author} size="lg" />
                    <div>
                      <div className="font-medium">{review.author?.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: review.rating }, (_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                    <span className="ml-1 text-sm text-gray-600 font-medium">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
                
                {review.comment && (
                  <div className="text-gray-700 leading-relaxed pl-13">
                    {review.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Пустое состояние для отзывов */}
      {(!profile.receivedReviews || profile.receivedReviews.length === 0) && (
        <div className="card text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Пока нет отзывов
          </h3>
          <p className="text-gray-500">
            Этот исполнитель еще не получил ни одного отзыва
          </p>
        </div>
      )}

      {/* Кнопка связи */}
      <div className="card text-center">
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Хотите работать с этим исполнителем?</h3>
          <p className="text-gray-600">
            Создайте заявку и пригласите исполнителя для выполнения вашего переезда
          </p>
          <Link to="/create-task" className="btn btn-primary">
            Создать заявку
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ExecutorProfilePage 