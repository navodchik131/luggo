import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import AddressAutocomplete from '../components/AddressAutocomplete'

const EditTaskPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams() // ID заявки для редактирования
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTask, setLoadingTask] = useState(true)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fromAddress: '',
    toAddress: '',
    date: '',
    category: 'flat'
  })

  const [errors, setErrors] = useState({})

  const categories = [
    { value: 'flat', label: 'Квартирный переезд' },
    { value: 'office', label: 'Офисный переезд' },
    { value: 'intercity', label: 'Межгородский переезд' },
    { value: 'garbage', label: 'Вывоз мусора' }
  ]

  // Загрузка данных заявки при монтировании компонента
  useEffect(() => {
    if (id) {
      loadTask()
    }
  }, [id])

  const loadTask = async () => {
    try {
      setLoadingTask(true)
      console.log('Загружаю заявку для редактирования:', id)
      
      const response = await api.get(`/tasks/${id}`)
      console.log('Данные заявки:', response.data)
      
      if (response.data.success) {
        const task = response.data.task
        
        // Проверяем права доступа
        if (task.customer?.id !== user?.id) {
          setError('У вас нет прав для редактирования этой заявки')
          return
        }
        
        // Проверяем статус - можно редактировать только черновики и активные заявки
        if (!['draft', 'active'].includes(task.status)) {
          setError('Нельзя редактировать заявку с таким статусом')
          return
        }
        
        // Заполняем форму данными заявки
        setFormData({
          title: task.title || '',
          description: task.description || '',
          fromAddress: task.fromAddress || '',
          toAddress: task.toAddress || '',
          date: task.date || '',
          category: task.category || 'flat'
        })
      } else {
        setError('Заявка не найдена')
      }
    } catch (err) {
      console.error('Ошибка загрузки заявки:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки заявки')
    } finally {
      setLoadingTask(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Заголовок должен содержать минимум 10 символов'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Описание должно содержать минимум 20 символов'
    }
    
    if (!formData.fromAddress.trim()) {
      newErrors.fromAddress = 'Адрес откуда обязателен'
    }
    
    if (!formData.toAddress.trim()) {
      newErrors.toAddress = 'Адрес куда обязателен'
    }
    
    if (!formData.date) {
      newErrors.date = 'Дата переезда обязательна'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = 'Дата не может быть в прошлом'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('🚀 Начинаем обновление заявки...')
    console.log('📝 Данные формы:', formData)
    console.log('🆔 ID заявки:', id)
    
    if (!validateForm()) {
      console.log('❌ Валидация не прошла')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      console.log('📡 Отправляем запрос на обновление:', `/api/tasks/${id}`)
      const response = await api.put(`/tasks/${id}`, formData)
      console.log('✅ Ответ сервера:', response.data)
      
      if (response.data.success) {
        console.log('🎉 Заявка обновлена успешно, перенаправляем...')
        navigate(`/tasks/${id}`)
      } else {
        console.log('⚠️ Сервер вернул success: false')
        setError(response.data.message || 'Неизвестная ошибка')
      }
    } catch (err) {
      console.error('💥 Ошибка обновления заявки:', err)
      console.error('📄 Детали ошибки:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      })
      
      setError(
        err.response?.data?.message || 
        `Ошибка ${err.response?.status || 'сети'}: ${err.message}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Проверяем авторизацию
  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Необходима авторизация</h2>
        <p className="text-gray-600 mb-4">Для редактирования заявки нужно войти в систему</p>
        <button 
          onClick={() => navigate('/login')}
          className="btn btn-primary"
        >
          Войти в систему
        </button>
      </div>
    )
  }

  // Проверяем роль пользователя
  if (user.role === 'executor') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">Доступ запрещен</h2>
        <p className="text-gray-600 mb-4">
          Исполнители не могут редактировать заявки
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => navigate('/tasks')}
            className="btn btn-primary"
          >
            Найти заявки
          </button>
          <button 
            onClick={() => navigate(`/tasks/${id}`)}
            className="btn btn-secondary"
          >
            К заявке
          </button>
        </div>
      </div>
    )
  }

  // Загрузка данных заявки
  if (loadingTask) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Ошибка загрузки или доступа
  if (error && !formData.title) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">❌</div>
        <h2 className="text-2xl font-bold mb-4">Ошибка</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => navigate('/tasks')}
            className="btn btn-primary"
          >
            К списку заявок
          </button>
          <button 
            onClick={() => navigate(`/tasks/${id}`)}
            className="btn btn-secondary"
          >
            К заявке
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Редактировать заявку</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Заголовок */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Заголовок заявки *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Например: Переезд 2-комнатной квартиры"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Категория */}
          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Тип переезда *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Адреса */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <AddressAutocomplete
              label="Откуда"
              value={formData.fromAddress}
              onChange={(e) => handleChange({ target: { name: 'fromAddress', value: e.target.value } })}
              placeholder="Начните вводить адрес в Перми..."
              required={true}
              error={errors.fromAddress}
            />

            <AddressAutocomplete
              label="Куда"
              value={formData.toAddress}
              onChange={(e) => handleChange({ target: { name: 'toAddress', value: e.target.value } })}
              placeholder="Начните вводить адрес в Перми..."
              required={true}
              error={errors.toAddress}
            />
          </div>

          {/* Дата */}
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Желаемая дата переезда *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Описание */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Подробное описание *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Опишите детали переезда: количество комнат, этаж, наличие лифта, особые требования..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Минимум 20 символов. Чем подробнее описание, тем точнее будут отклики.
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
              className="btn btn-secondary px-6"
            >
              Отмена
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditTaskPage 