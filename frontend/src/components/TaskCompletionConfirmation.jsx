import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import UserAvatar from './UserAvatar'
import logger from '../utils/logger'

const TaskCompletionConfirmation = ({ task, onConfirmation }) => {
  const [loading, setLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  })

  const executorInfo = task.bids?.find(bid => bid.accepted)?.executor || {}

  const handleConfirm = async (confirmed) => {
    try {
      setLoading(true)
      
      const payload = {
        confirmed,
        ...(confirmed && showReviewForm ? reviewData : {})
      }
      
      const response = await api.post(`/reviews/confirm/${task.id}`, payload)
      
      if (response.data.success) {
        onConfirmation(response.data)
        if (confirmed) {
          alert(showReviewForm ? 'Работа подтверждена, отзыв оставлен!' : 'Работа подтверждена!')
        } else {
          alert('Работа возвращена на доработку')
        }
      }
    } catch (err) {
      logger.error('Ошибка подтверждения:', err)
      alert(err.response?.data?.message || 'Ошибка подтверждения завершения')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewChange = (field, value) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">⏳</div>
        <div>
          <h3 className="text-lg font-semibold text-yellow-800">
            Работа завершена исполнителем
          </h3>
          <p className="text-yellow-700">
            {executorInfo.name} отметил работу как выполненную. Пожалуйста, проверьте результат.
          </p>
        </div>
      </div>

      {/* Информация об исполнителе */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h4 className="font-medium mb-2">Исполнитель:</h4>
        <div className="flex items-center gap-3">
          <UserAvatar user={executorInfo} size="xl" />
          <div>
            <div className="font-medium">
              <Link 
                to={`/executor/${executorInfo.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {executorInfo.name}
              </Link>
            </div>
            <div className="text-sm text-gray-600">
              ⭐ {executorInfo.rating?.toFixed(1) || '—'} | {executorInfo.email}
            </div>
          </div>
        </div>
      </div>

      {/* Форма отзыва */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <input
            type="checkbox"
            checked={showReviewForm}
            onChange={(e) => setShowReviewForm(e.target.checked)}
            className="rounded border-gray-300"
          />
          Оставить отзыв и оценку исполнителю
        </label>

        {showReviewForm && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Рейтинг */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Оценка работы
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleReviewChange('rating', star)}
                    className={`text-2xl transition-colors hover:scale-110 ${
                      star <= reviewData.rating 
                        ? 'text-yellow-400 hover:text-yellow-500' 
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {reviewData.rating}/5
                </span>
              </div>
            </div>

            {/* Комментарий */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комментарий к работе
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => handleReviewChange('comment', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Опишите качество выполненной работы..."
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {reviewData.comment.length}/1000 символов
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-3">
        <button
          onClick={() => handleConfirm(true)}
          disabled={loading}
          className="btn btn-success flex-1 disabled:opacity-50"
        >
          {loading ? 'Подтверждение...' : '✓ Подтвердить завершение'}
        </button>
        
        <button
          onClick={() => handleConfirm(false)}
          disabled={loading}
          className="btn btn-secondary px-6 disabled:opacity-50"
        >
          ↩ Вернуть на доработку
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        После подтверждения работа будет помечена как завершенная. 
        При возврате на доработку исполнитель получит уведомление.
      </p>
    </div>
  )
}

export default TaskCompletionConfirmation 