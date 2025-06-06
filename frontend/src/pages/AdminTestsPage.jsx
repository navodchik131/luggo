import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Database,
  Users,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AdminTestsPage = () => {
  const [testResults, setTestResults] = useState({})
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTests, setSelectedTests] = useState([])

  const testSuites = [
    {
      id: 'auth',
      name: 'Авторизация',
      icon: Users,
      tests: [
        { id: 'login', name: 'Тест входа в систему' },
        { id: 'register', name: 'Тест регистрации' },
        { id: 'profile', name: 'Получение профиля' },
      ]
    },
    {
      id: 'tasks',
      name: 'Заявки',
      icon: FileText,
      tests: [
        { id: 'create-task', name: 'Создание заявки' },
        { id: 'get-tasks', name: 'Получение списка заявок' },
        { id: 'update-task', name: 'Обновление заявки' },
      ]
    },
    {
      id: 'chat',
      name: 'Чат и сообщения',
      icon: MessageSquare,
      tests: [
        { id: 'websocket', name: 'WebSocket подключение' },
        { id: 'send-message', name: 'Отправка сообщения' },
        { id: 'get-messages', name: 'Получение сообщений' },
      ]
    },
    {
      id: 'database',
      name: 'База данных',
      icon: Database,
      tests: [
        { id: 'connection', name: 'Подключение к БД' },
        { id: 'migration', name: 'Статус миграций' },
        { id: 'backup', name: 'Резервное копирование' },
      ]
    }
  ]

  const runTest = async (testId) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: { status: 'running', message: 'Выполняется...' }
    }))

    try {
      let result = { status: 'success', message: 'Тест пройден' }

      switch (testId) {
        case 'login':
          await api.post('/api/auth/login', {
            email: 'test@luggo.ru',
            password: 'test123'
          })
          break

        case 'get-tasks':
          const tasksResponse = await api.get('/api/tasks')
          result.message = `Получено ${tasksResponse.data.tasks?.length || 0} заявок`
          break

        case 'websocket':
          result = await testWebSocket()
          break

        case 'connection':
          await api.get('/api/health')
          result.message = 'Соединение с API установлено'
          break

        default:
          result = { status: 'warning', message: 'Тест не реализован' }
      }

      setTestResults(prev => ({
        ...prev,
        [testId]: result
      }))

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          status: 'error',
          message: error.response?.data?.message || error.message
        }
      }))
    }
  }

  const testWebSocket = () => {
    return new Promise((resolve) => {
      try {
        // Простая проверка доступности Socket.IO endpoint
        fetch('/socket.io/?EIO=4&transport=polling')
          .then(response => {
            if (response.ok) {
              resolve({ status: 'success', message: 'Socket.IO endpoint доступен' })
            } else {
              resolve({ status: 'error', message: 'Socket.IO недоступен' })
            }
          })
          .catch(() => {
            resolve({ status: 'error', message: 'Ошибка подключения к Socket.IO' })
          })
      } catch (error) {
        resolve({ status: 'error', message: error.message })
      }
    })
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    for (const suite of testSuites) {
      for (const test of suite.tests) {
        await runTest(test.id)
        // Небольшая задержка между тестами
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    setIsRunning(false)
    toast.success('Все тесты завершены')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'running':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <Link 
            to="/admin" 
            className="text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Назад к админ панели
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Тестирование системы</h1>
          <p className="text-gray-600">Проверка всех компонентов платформы</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="btn btn-primary flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Выполняется...' : 'Запустить все тесты'}
          </button>
        </div>
      </div>

      {/* Тестовые наборы */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testSuites.map((suite) => {
          const Icon = suite.icon
          return (
            <div key={suite.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">{suite.name}</h3>
              </div>
              
              <div className="space-y-3">
                {suite.tests.map((test) => {
                  const result = testResults[test.id]
                  return (
                    <div 
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result?.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {result?.message && (
                          <span className="text-sm text-gray-600 max-w-xs truncate">
                            {result.message}
                          </span>
                        )}
                        <button
                          onClick={() => runTest(test.id)}
                          disabled={result?.status === 'running'}
                          className="btn btn-sm btn-secondary"
                        >
                          <Play className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Системная информация */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Системная информация</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {process.env.NODE_ENV || 'development'}
            </div>
            <div className="text-sm text-gray-600">Режим работы</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {import.meta.env.VITE_API_URL || 'localhost'}
            </div>
            <div className="text-sm text-gray-600">API сервер</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              v1.0.0
            </div>
            <div className="text-sm text-gray-600">Версия</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTestsPage 