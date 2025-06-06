import api from '../services/api'
import logger from '../utils/logger'

const AdminPage = () => {
  const [demoDataLoading, setDemoDataLoading] = useState(false)
  const [demoDataStatus, setDemoDataStatus] = useState(null)

  const handleSeedDemoData = async () => {
    if (!window.confirm('Загрузить демо-данные? Это создаст тестовых пользователей, заявки и новости.')) {
      return
    }

    try {
      setDemoDataLoading(true)
      setDemoDataStatus('Загружаем демо-данные...')
      
      const response = await api.post('/admin/seed-demo-data')
      
      if (response.data.success) {
        setDemoDataStatus(`✅ Успешно загружено:
          👥 Пользователи: ${response.data.data.users}
          📋 Заявки: ${response.data.data.tasks}
          💼 Отклики: ${response.data.data.bids}
          💬 Сообщения: ${response.data.data.messages}
          📰 Новости: ${response.data.data.news}
          ⭐ Отзывы: ${response.data.data.reviews}`)
        
        logger.success('Демо-данные успешно загружены!')
        
        // Обновляем статистику
        loadStats()
      }
    } catch (error) {
      logger.error('Ошибка загрузки демо-данных:', error)
      setDemoDataStatus('❌ Ошибка загрузки демо-данных')
    } finally {
      setDemoDataLoading(false)
    }
  }

  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ ВНИМАНИЕ! Это удалит ВСЕ данные. Продолжить?')) {
      return
    }

    try {
      setDemoDataLoading(true)
      setDemoDataStatus('Очищаем данные...')
      
      const response = await api.post('/admin/clear-all-data')
      
      if (response.data.success) {
        setDemoDataStatus('✅ Все данные успешно очищены')
        logger.success('Данные очищены')
        loadStats()
      }
    } catch (error) {
      logger.error('Ошибка очистки данных:', error)
      setDemoDataStatus('❌ Ошибка очистки данных')
    } finally {
      setDemoDataLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Управление демо-данными */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6">🌱 Управление демо-данными</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              Загрузка демо-данных
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Создает реалистичные данные для демонстрации работы платформы: 
              пользователей, заявки, отклики, сообщения, новости и отзывы.
            </p>
            <button
              onClick={handleSeedDemoData}
              disabled={demoDataLoading}
              className="btn btn-primary disabled:opacity-50"
            >
              {demoDataLoading ? 'Загружаем...' : '🌱 Загрузить демо-данные'}
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">
                ⚠️ Очистка всех данных
              </h3>
              <p className="text-red-700 text-sm mb-4">
                Удаляет ВСЕ данные из системы. Доступно только в режиме разработки.
              </p>
              <button
                onClick={handleClearAllData}
                disabled={demoDataLoading}
                className="btn btn-danger disabled:opacity-50"
              >
                {demoDataLoading ? 'Очищаем...' : '🗑️ Очистить все данные'}
              </button>
            </div>
          )}

          {demoDataStatus && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Статус операции:</h4>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {demoDataStatus}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPage 