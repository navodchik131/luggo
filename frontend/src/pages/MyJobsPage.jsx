import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import CompleteJobModal from '../components/CompleteJobModal'

const MyJobsPage = () => {
  const { user } = useAuth()
  
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [completeModalOpen, setCompleteModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const statusLabels = {
    active: 'Принята',
    in_progress: 'В процессе',
    awaiting_confirmation: 'Ожидает подтверждения',
    completed: 'Завершена'
  }

  const statusColors = {
    active: 'status-active',
    in_progress: 'status-pending',
    awaiting_confirmation: 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium',
    completed: 'status-completed'
  }

  const categoryLabels = {
    flat: 'Квартирный переезд',
    office: 'Офисный переезд',
    intercity: 'Межгородский переезд',
    garbage: 'Вывоз мусора'
  }

  useEffect(() => {
    if (user?.role === 'executor') {
      loadMyJobs()
    }
  }, [statusFilter, pagination.page, user])

  const loadMyJobs = async () => {
    try {
      setLoading(true)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit
      }
      
      if (statusFilter) {
        params.status = statusFilter
      }
      
      console.log('Загружаю мои работы с параметрами:', params)
      
      const response = await api.get('/executor/jobs', { params })
      console.log('Ответ API моих работ:', response.data)
      
      if (response.data.success) {
        setJobs(response.data.jobs)
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }))
      } else {
        setError('Ошибка загрузки ваших работ')
      }
    } catch (err) {
      console.error('Ошибка загрузки моих работ:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки ваших работ')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleCompleteJob = async (taskId) => {
    const job = jobs.find(j => j.id === taskId)
    if (job) {
      setSelectedJob(job)
      setCompleteModalOpen(true)
    }
  }

  const handleCompleteJobSubmit = async (completionComment) => {
    try {
      const response = await api.post(`/executor/jobs/${selectedJob.id}/complete`, {
        completionComment
      })
      
      if (response.data.success) {
        loadMyJobs() // Перезагружаем список - пользователь увидит обновленный статус
      }
    } catch (err) {
      console.error('Ошибка завершения работы:', err)
      alert(err.response?.data?.message || 'Ошибка завершения работы')
      throw err // Пробрасываем ошибку для обработки в модальном окне
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Проверка роли пользователя
  if (user?.role !== 'executor') {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <div className="text-xl text-gray-600 mb-2">
          Доступ запрещен
        </div>
        <div className="text-gray-500 mb-4">
          Эта страница доступна только исполнителям
        </div>
        <Link to="/" className="btn btn-primary">
          На главную
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Мои работы</h1>
          <p className="text-gray-600 mt-2">
            Управляйте принятыми заявками и отслеживайте прогресс
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="card mb-6">
        <h3 className="font-semibold mb-4">🔍 Фильтр по статусу</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusFilter('')}
            className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-secondary'}`}
          >
            Все
          </button>
          <button
            onClick={() => handleStatusFilter('active')}
            className={`btn btn-sm ${statusFilter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Принятые
          </button>
          <button
            onClick={() => handleStatusFilter('in_progress')}
            className={`btn btn-sm ${statusFilter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
          >
            В процессе
          </button>
          <button
            onClick={() => handleStatusFilter('awaiting_confirmation')}
            className={`btn btn-sm ${statusFilter === 'awaiting_confirmation' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Ожидает подтверждения
          </button>
          <button
            onClick={() => handleStatusFilter('completed')}
            className={`btn btn-sm ${statusFilter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Завершенные
          </button>
        </div>
      </div>

      {/* Список работ */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button onClick={loadMyJobs} className="btn btn-primary">
            Попробовать еще раз
          </button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">💼</div>
          <div className="text-xl text-gray-600 mb-2">
            {statusFilter ? 'Работ с таким статусом не найдено' : 'У вас пока нет принятых работ'}
          </div>
          <div className="text-gray-500 mb-4">
            Откликайтесь на заявки, чтобы получить работу
          </div>
          <Link to="/tasks" className="btn btn-primary">
            Найти заявки
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map(job => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              {/* Заголовок работы */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      <Link 
                        to={`/tasks/${job.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {job.title}
                      </Link>
                    </h3>
                    <span className={statusColors[job.status]}>
                      {statusLabels[job.status]}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">{categoryLabels[job.category]}</span>
                    <span className="mx-2">•</span>
                    <span>📅 {formatDate(job.date)}</span>
                    <span className="mx-2">•</span>
                    <span>🕒 Отклик принят {formatDateTime(job.bid.createdAt)}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 mb-2">
                    {job.bid.price} ₽
                  </div>
                  
                  {job.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteJob(job.id)}
                      className="btn btn-success btn-sm"
                    >
                      Завершить работу
                    </button>
                  )}
                  
                  {job.status === 'awaiting_confirmation' && (
                    <span className="text-sm text-orange-600 font-medium">
                      ⏳ Ожидает подтверждения
                    </span>
                  )}
                  
                  {job.status === 'completed' && (
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Завершено
                    </span>
                  )}
                </div>
              </div>

              {/* Адреса */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-xs text-gray-500">Откуда:</span>
                  <div className="font-medium">{job.fromAddress}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Куда:</span>
                  <div className="font-medium">{job.toAddress}</div>
                </div>
              </div>

              {/* Информация о заказчике */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold">👤 Заказчик</h4>
                  {job.customer.role === 'executor' && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        ⭐ {job.customer.rating?.toFixed(1) || '—'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{job.customer.name}</div>
                      <div className="text-sm text-gray-600">{job.customer.email}</div>
                      {job.customer.phone && (
                        <div className="text-sm text-gray-600">📞 {job.customer.phone}</div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">
                        На платформе с {formatDate(job.customer.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Мой отклик */}
                {job.bid.comment && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Мой отклик:</div>
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      {job.bid.comment}
                    </div>
                  </div>
                )}

                {/* Действия */}
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <Link 
                    to={`/tasks/${job.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Подробнее →
                  </Link>
                  
                  {job.status === 'active' && (
                    <span className="text-sm text-green-600 font-medium">
                      🎉 Ваш отклик принят!
                    </span>
                  )}
                  
                  {job.status === 'in_progress' && (
                    <span className="text-sm text-blue-600 font-medium">
                      🚀 В процессе выполнения
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Пагинация */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="btn btn-secondary btn-sm disabled:opacity-50"
          >
            ← Назад
          </button>
          
          {[...Array(pagination.totalPages)].map((_, i) => {
            const page = i + 1
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`btn btn-sm ${
                  page === pagination.page 
                    ? 'btn-primary' 
                    : 'btn-secondary'
                }`}
              >
                {page}
              </button>
            )
          })}
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="btn btn-secondary btn-sm disabled:opacity-50"
          >
            Вперед →
          </button>
        </div>
      )}
      
      {/* Информация о результатах */}
      {jobs.length > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Показано {jobs.length} из {pagination.total} работ
        </div>
      )}

      {/* Модальное окно завершения работы */}
      <CompleteJobModal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        job={selectedJob}
        onComplete={handleCompleteJobSubmit}
      />
    </div>
  )
}

export default MyJobsPage 