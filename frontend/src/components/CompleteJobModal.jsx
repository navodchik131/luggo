import { useState } from 'react'

const CompleteJobModal = ({ isOpen, onClose, job, onComplete }) => {
  const [completionComment, setCompletionComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onComplete(completionComment.trim())
      // Закрываем модальное окно и очищаем форму
      setCompletionComment('')
      onClose()
    } catch (error) {
      console.error('Ошибка завершения работы:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCompletionComment('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
        {/* Заголовок */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            ✅ Завершение работы
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Подтвердите завершение работы по заявке
          </p>
        </div>

        {/* Информация о работе */}
        {job && (
          <div className="p-6 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-2">{job.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>📍 {job.fromAddress} → {job.toAddress}</div>
              <div>💰 {job.bid?.price} ₽</div>
              <div>👤 Заказчик: {job.customer?.name}</div>
            </div>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Комментарий о выполненной работе
              <span className="text-gray-500 font-normal">(необязательно)</span>
            </label>
            <textarea
              value={completionComment}
              onChange={(e) => setCompletionComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Опишите, что было выполнено, особенности работы, рекомендации для заказчика..."
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {completionComment.length}/500 символов
            </div>
          </div>

          {/* Информационное сообщение */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 text-lg">ℹ️</div>
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">Что происходит дальше:</div>
                <ul className="space-y-1 text-xs">
                  <li>• Заказчик получит уведомление о завершении</li>
                  <li>• Заказчик должен подтвердить выполнение работы</li>
                  <li>• После подтверждения работа будет завершена</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-success disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Завершаю...
                </div>
              ) : (
                '✓ Завершить работу'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 btn btn-secondary disabled:opacity-50"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompleteJobModal 