import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import ImageUpload from '../components/ImageUpload'
import UserAvatar from '../components/UserAvatar'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [vehiclePhotos, setVehiclePhotos] = useState([])
  const [services, setServices] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    services: [],
    showContacts: true
  })

  useEffect(() => {
    loadProfile()
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await api.get('/users/services')
      if (response.data.success) {
        setServices(response.data.services)
      }
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error)
    }
  }

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await api.get('/profile/me')
      
      if (response.data.success) {
        setProfile(response.data.user)
        setVehiclePhotos(response.data.user.vehiclePhotos || [])
        setFormData({
          name: response.data.user.name,
          phone: response.data.user.phone,
          services: response.data.user.services || [],
          showContacts: response.data.user.showContacts !== undefined ? response.data.user.showContacts : true
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleServiceChange = (serviceKey, checked) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, serviceKey]
        : prev.services.filter(s => s !== serviceKey)
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    // Если исполнитель и не выбрал услуги
    if (profile.role === 'executor' && formData.services.length === 0) {
      alert('Исполнитель должен выбрать хотя бы одну услугу')
      return
    }
    
    try {
      const response = await api.put('/profile/me', formData)
      
      if (response.data.success) {
        setProfile(response.data.user)
        updateUser(response.data.user)
        setEditing(false)
        alert('Профиль успешно обновлен')
      }
    } catch (error) {
      console.error('Ошибка обновления профиля:', error)
      alert(error.response?.data?.message || 'Ошибка обновления профиля')
    }
  }

  const handleAvatarUpload = async (files) => {
    try {
      const formData = new FormData()
      formData.append('avatar', files[0])
      
      const response = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        // Обновляем профиль и пользователя в контексте
        await loadProfile()
        alert('Аватар успешно загружен')
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error)
      alert(error.response?.data?.message || 'Ошибка загрузки аватара')
    }
  }

  const handleVehiclePhotosUpload = async (files) => {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('vehiclePhotos', file)
      })
      
      const response = await api.post('/profile/vehicle-photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        setVehiclePhotos(prev => [...prev, ...response.data.photos])
        alert(`Загружено ${response.data.photos.length} фотографий`)
      }
    } catch (error) {
      console.error('Ошибка загрузки фотографий:', error)
      alert(error.response?.data?.message || 'Ошибка загрузки фотографий')
    }
  }

  const handleDeleteVehiclePhoto = async (photoId) => {
    if (!confirm('Удалить эту фотографию?')) return
    
    try {
      const response = await api.delete(`/profile/vehicle-photos/${photoId}`)
      
      if (response.data.success) {
        setVehiclePhotos(prev => prev.filter(photo => photo.id !== photoId))
        alert('Фотография удалена')
      }
    } catch (error) {
      console.error('Ошибка удаления фотографии:', error)
      alert(error.response?.data?.message || 'Ошибка удаления фотографии')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">Ошибка загрузки профиля</div>
        <button onClick={loadProfile} className="btn btn-primary">
          Попробовать еще раз
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Мой профиль</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="btn btn-secondary"
        >
          {editing ? 'Отменить' : 'Редактировать'}
        </button>
      </div>

      {/* Основная информация */}
      <div className="card">
        <div className="flex items-start gap-6">
          {/* Аватар */}
          <div className="flex-shrink-0">
            <UserAvatar user={profile} size="2xl" />
          </div>

          {/* Информация о пользователе */}
          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Настройка приватности контактов */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="showContacts"
                      checked={formData.showContacts}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        Показывать мои контакты другим пользователям
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Если опция включена, другие пользователи смогут видеть ваш email и телефон в профиле и откликах. 
                        Если выключена - контакты будут скрыты от всех, кроме вас.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Услуги для исполнителей */}
                {profile.role === 'executor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Услуги, которые вы предоставляете *
                    </label>
                    <div className="space-y-2">
                      {Object.entries(services).map(([key, name]) => (
                        <label key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.services.includes(key)}
                            onChange={(e) => handleServiceChange(key, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900">{name}</span>
                        </label>
                      ))}
                    </div>
                    {formData.services.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">
                        Выберите хотя бы одну услугу
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    Сохранить
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn btn-secondary"
                  >
                    Отменить
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <div className="text-gray-600">
                  <div>📧 {profile.email}</div>
                  <div>📞 {profile.phone}</div>
                  <div>👤 {profile.role === 'executor' ? 'Исполнитель' : 'Заказчик'}</div>
                  {profile.role === 'executor' && (
                    <>
                      <div>⭐ Рейтинг: {profile.rating?.toFixed(1) || '—'}</div>
                      {profile.services && profile.services.length > 0 && (
                        <div>
                          🛠️ Услуги: {profile.services.map(serviceKey => services[serviceKey]).filter(Boolean).join(', ')}
                        </div>
                      )}
                    </>
                  )}
                  <div>📅 Регистрация: {formatDate(profile.createdAt)}</div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-200">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                      profile.showContacts 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {profile.showContacts ? (
                        <>👁️ Контакты видны всем</>
                      ) : (
                        <>🔒 Контакты скрыты</>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Загрузка аватара */}
      <div className="card">
        <ImageUpload
          type="single"
          onUpload={handleAvatarUpload}
          title="Аватар профиля"
          description="Загрузите фотографию для вашего профиля"
        />
      </div>

      {/* Фотографии автомобиля (только для исполнителей) */}
      {profile.role === 'executor' && (
        <div className="card">
          <div className="space-y-6">
            <ImageUpload
              type="multiple"
              onUpload={handleVehiclePhotosUpload}
              maxFiles={5}
              title="Фотографии автомобиля"
              description="Загрузите фотографии вашего автомобиля (максимум 10 фото)"
            />

            {/* Текущие фотографии */}
            {vehiclePhotos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Ваши фотографии ({vehiclePhotos.length}/10)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vehiclePhotos.map(photo => (
                    <div key={photo.id} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(photo.path)}
                          alt={photo.description || 'Фото автомобиля'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteVehiclePhoto(photo.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      {photo.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {photo.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Отзывы (только для исполнителей) */}
      {profile.role === 'executor' && profile.receivedReviews?.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Отзывы о моей работе</h3>
          <div className="space-y-4">
            {profile.receivedReviews.map(review => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-semibold">
                        {review.author?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{review.author?.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: review.rating }, (_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                    <span className="ml-1 text-sm text-gray-600">
                      {review.rating}/5
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <div className="text-gray-700 text-sm">
                    {review.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfilePage 