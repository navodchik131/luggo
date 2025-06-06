import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff } from 'lucide-react'
import api from '../services/api'
import logger from '../utils/logger'

const RegisterPage = () => {
  const { register, registerLoading, isAuthenticated } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [services, setServices] = useState({})
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    services: []
  })

  // Загружаем список услуг при загрузке компонента
  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await api.get('/users/services')
      if (response.data.success) {
        setServices(response.data.services)
      }
    } catch (error) {
      logger.error('Ошибка загрузки услуг:', error)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Если исполнитель и не выбрал услуги
    if (formData.role === 'executor' && formData.services.length === 0) {
      alert('Исполнитель должен выбрать хотя бы одну услугу')
      return
    }
    
    register(formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleServiceChange = (serviceKey, checked) => {
    setFormData(prev => ({
      ...prev,
      services: checked 
        ? [...prev.services, serviceKey]
        : prev.services.filter(s => s !== serviceKey)
    }))
  }

  const handleRoleChange = (e) => {
    const newRole = e.target.value
    setFormData({
      ...formData,
      role: newRole,
      // Сбрасываем услуги при смене роли
      services: newRole === 'customer' ? [] : formData.services
    })
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">Регистрация</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Имя
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="79001234567"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Роль
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
              className="input"
            >
              <option value="customer">Заказчик</option>
              <option value="executor">Исполнитель</option>
            </select>
          </div>

          {/* Услуги для исполнителей */}
          {formData.role === 'executor' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Какие услуги вы предоставляете? *
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

          <button
            type="submit"
            disabled={registerLoading}
            className="btn btn-primary w-full"
          >
            {registerLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage 