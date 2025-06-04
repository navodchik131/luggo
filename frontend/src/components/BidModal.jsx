import { useState } from 'react'
import api from '../services/api'

const BidModal = ({ isOpen, onClose, task, onBidCreated }) => {
  const [formData, setFormData] = useState({
    price: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Валидация
    if (!formData.price || formData.price <= 0) {
      setError('Укажите корректную цену')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('Отправляю отклик:', formData)
      console.log('Task ID:', task.id)
      
      const response = await api.post(`/tasks/${task.id}/bids`, {
        price: parseFloat(formData.price),
        comment: formData.comment
      })
      
      console.log('Ответ создания отклика:', response.data)
      
      if (response.data.success) {
        // Сброс формы
        setFormData({ price: '', comment: '' })
        
        // Вызов колбека для обновления списка откликов
        if (onBidCreated) {
          onBidCreated(response.data.bid)
        }
        
        // Закрытие модалки
        onClose()
      } else {
        setError(response.data.message || 'Ошибка создания отклика')
      }
    } catch (err) {
      console.error('Ошибка создания отклика:', err)
      setError(err.response?.data?.message || 'Ошибка создания отклика')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Сброс ошибки при изменении
    if (error) setError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Откликнуться на заявку</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        {/* Информация о заявке */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div>📍 {task.fromAddress} → {task.toAddress}</div>
            <div>📅 {new Date(task.date).toLocaleDateString('ru-RU')}</div>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Цена */}
          <div className="mb-4">
            <label htmlFor="price" className="form-label">
              Ваша цена * <span className="text-gray-500">(₽)</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="1"
              step="0.01"
              placeholder="Например: 5000"
              className="form-input"
              required
              disabled={loading}
            />
            <div className="form-help">
              Укажите стоимость ваших услуг в рублях
            </div>
          </div>

          {/* Комментарий */}
          <div className="mb-6">
            <label htmlFor="comment" className="form-label">
              Комментарий <span className="text-gray-500">(опционально)</span>
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder="Расскажите о своем опыте, доступности, особенностях работы..."
              rows="4"
              maxLength="1000"
              className="form-input resize-none"
              disabled={loading}
            />
            <div className="form-help">
              {formData.comment.length}/1000 символов
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Отправка...
                </div>
              ) : (
                'Отправить отклик'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BidModal 