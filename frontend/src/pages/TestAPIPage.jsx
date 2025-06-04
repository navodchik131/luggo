import { useState } from 'react'
import api from '../services/api'

const TestAPIPage = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testGetTasks = async () => {
    setLoading(true)
    try {
      const response = await api.get('/tasks')
      setResult(JSON.stringify(response.data, null, 2))
    } catch (error) {
      setResult(`Ошибка: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`)
    }
    setLoading(false)
  }

  const testBackendHealth = async () => {
    setLoading(true)
    try {
      const response = await api.get('/')
      setResult(JSON.stringify(response.data, null, 2))
    } catch (error) {
      setResult(`Ошибка: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`)
    }
    setLoading(false)
  }

  const testCreateTask = async () => {
    setLoading(true)
    try {
      const testData = {
        title: 'Тестовая заявка переезда',
        description: 'Это тестовое описание для проверки API создания заявок. Содержит более 20 символов.',
        fromAddress: 'Москва, ул. Тестовая, 1',
        toAddress: 'Москва, ул. Тестовая, 2',
        date: '2024-12-31',
        category: 'flat'
      }
      
      console.log('Отправляем тестовые данные:', testData)
      const response = await api.post('/tasks', testData)
      setResult(JSON.stringify(response.data, null, 2))
    } catch (error) {
      console.error('Ошибка тестового создания:', error)
      setResult(`Ошибка: ${error.message}\nСтатус: ${error.response?.status}\nДанные: ${JSON.stringify(error.response?.data, null, 2)}`)
    }
    setLoading(false)
  }

  // Test endpoint
  const testEndpoint = async () => {
    try {
      setLoading(true)
      const response = await api.get('/health')
      setResult(response.data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Test static files
  const testStaticFiles = async () => {
    try {
      setLoading(true)
      const response = await api.get('/test-static')
      setResult(response.data)
    } catch (error) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Test image loading
  const testImageLoading = () => {
    const testImageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/image/avatars/avatar-1749014322450-802973297.jpg`
    setResult({ 
      testImageUrl,
      message: 'Проверьте консоль браузера на наличие ошибок при загрузке изображения ниже. Теперь используется API эндпоинт.'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Тестирование API</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button 
          onClick={testBackendHealth}
          disabled={loading}
          className="btn btn-primary"
        >
          Проверить Backend
        </button>
        
        <button 
          onClick={testGetTasks}
          disabled={loading}
          className="btn btn-secondary"
        >
          GET /tasks
        </button>
        
        <button 
          onClick={testCreateTask}
          disabled={loading}
          className="btn btn-success"
        >
          POST /tasks (нужна авторизация)
        </button>
        
        <button 
          onClick={testStaticFiles}
          disabled={loading}
          className="btn btn-primary"
        >
          Проверить файлы
        </button>
        
        <button 
          onClick={testImageLoading}
          disabled={loading}
          className="btn btn-secondary"
        >
          Тест загрузки изображения
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Результат:</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
          {loading ? 'Загрузка...' : JSON.stringify(result, null, 2) || 'Нажмите на кнопку для тестирования'}
        </pre>
      </div>

      {/* Тест изображения */}
      {result?.testImageUrl && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">🖼️ Тест изображения:</h3>
          <p className="text-sm text-gray-600 mb-3">{result.message}</p>
          <p className="text-xs text-gray-500 mb-3">URL: {result.testImageUrl}</p>
          <img 
            src={result.testImageUrl} 
            alt="Тестовое изображение" 
            className="w-32 h-32 object-cover border rounded"
            onLoad={() => console.log('✅ Изображение загружено успешно')}
            onError={(e) => console.error('❌ Ошибка загрузки изображения:', e)}
          />
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔍 Инструкции по отладке:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Сначала проверьте "Проверить Backend" - должен вернуть информацию о сервере</li>
          <li>Затем "GET /tasks" - должен вернуть список задач (может быть пустым)</li>
          <li>Для "POST /tasks" нужно быть авторизованным - иначе получите ошибку 401</li>
          <li>Откройте консоль браузера (F12) для дополнительной информации</li>
        </ol>
      </div>
    </div>
  )
}

export default TestAPIPage 