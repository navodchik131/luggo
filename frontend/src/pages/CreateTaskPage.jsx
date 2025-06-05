import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import AddressAutocomplete from '../components/AddressAutocomplete'

const CreateTaskPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
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

  // Предзаполнение категории из URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl && categories.some(cat => cat.value === categoryFromUrl)) {
      setFormData(prev => ({
        ...prev,
        category: categoryFromUrl
      }))
    }
  }, [searchParams])

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
    
    console.log('🚀 Начинаем создание заявки...')
    console.log('📝 Данные формы:', formData)
    console.log('👤 Пользователь:', user)
    
    if (!validateForm()) {
      console.log('❌ Валидация не прошла')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      console.log('📡 Отправляем запрос на:', '/api/tasks')
      const response = await api.post('/tasks', formData)
      console.log('✅ Ответ сервера:', response.data)
      
      if (response.data.success) {
        console.log('🎉 Задача создана успешно, перенаправляем...')
        navigate(`/tasks/${response.data.task.id}`)
      } else {
        console.log('⚠️ Сервер вернул success: false')
        setError(response.data.message || 'Неизвестная ошибка')
      }
    } catch (err) {
      console.error('💥 Ошибка создания заявки:', err)
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

  // Быстрое заполнение примерами
  const fillExample = (category) => {
    const examples = {
      flat: {
        title: 'Переезд 2-комнатной квартиры в Перми',
        description: 'Переезд из 2-комнатной квартиры на 5 этаже (лифт есть) в новую квартиру на 3 этаже. Примерно 15-20 коробок, холодильник, стиральная машина, диван, кровать, шкаф. Требуется упаковка хрупких предметов.',
        fromAddress: 'ул. Ленина, 10, Пермь',
        toAddress: 'ул. Пушкина, 25, Пермь'
      },
      office: {
        title: 'Переезд офиса на 20 сотрудников в Перми',  
        description: 'Переезд небольшого офиса: 20 рабочих мест, компьютеры, принтеры, офисная мебель, документы. Необходима аккуратная упаковка техники и конфиденциальных документов. Переезд в выходные дни.',
        fromAddress: 'ул. Монастырская, 5, офис 210, Пермь',
        toAddress: 'ул. Комсомольский проспект, 15, офис 305, Пермь'
      },
      intercity: {
        title: 'Межгородский переезд Пермь-Екатеринбург',
        description: 'Переезд семьи из 3 человек из Перми в Екатеринбург. 1-комнатная квартира, основная мебель, личные вещи. Нужна помощь с упаковкой и погрузкой/разгрузкой. Переезд на постоянное место жительства.',
        fromAddress: 'ул. Петропавловская, 13, Пермь',
        toAddress: 'ул. Ленина, 85, Екатеринбург'
      },
      garbage: {
        title: 'Вывоз строительного мусора после ремонта в Перми',
        description: 'Необходимо вывезти строительный мусор после ремонта квартиры: куски гипсокартона, старая плитка, обрезки ламината, упаковочные материалы. Примерный объем 3-4 куба. Мусор находится на 2 этаже, лифта нет.',
        fromAddress: 'ул. Строителей, 15, кв. 45, Пермь',
        toAddress: 'Полигон или свалка (по согласованию)'
      }
    }
    
    const example = examples[category]
    if (example) {
      setFormData(prev => ({
        ...prev,
        ...example
      }))
    }
  }

  // Проверяем авторизацию
  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Необходима авторизация</h2>
        <p className="text-gray-600 mb-4">Для создания заявки нужно войти в систему</p>
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
          Исполнители не могут создавать заявки. 
          <br />
          Вы можете только откликаться на существующие заявки.
        </p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => navigate('/tasks')}
            className="btn btn-primary"
          >
            Найти заявки
          </button>
          <button 
            onClick={() => navigate('/my-jobs')}
            className="btn btn-secondary"
          >
            Мои работы
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Создать заявку</h1>
      
      {/* Быстрые примеры */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-3">💡 Хотите заполнить быстро?</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => fillExample(cat.value)}
              className="text-sm bg-white border border-blue-200 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
            >
              Пример: {cat.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-blue-600 mt-2">
          Нажмите на кнопку чтобы заполнить форму примером, затем отредактируйте под свои нужды
        </p>
      </div>
      
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
              {isLoading ? 'Создание...' : 'Создать заявку'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/tasks')}
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

export default CreateTaskPage 