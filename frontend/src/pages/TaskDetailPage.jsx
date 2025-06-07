import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import BidModal from '../components/BidModal'
import TaskCompletionConfirmation from '../components/TaskCompletionConfirmation'
import UserAvatar from '../components/UserAvatar'
import ChatModal from '../components/ChatModal'
import RouteMap from '../components/RouteMap'
import logger from '../utils/logger'

const TaskDetailPage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bidsVisible, setBidsVisible] = useState(false)
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [acceptingBid, setAcceptingBid] = useState(null)
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [selectedExecutor, setSelectedExecutor] = useState(null)

  const categoryLabels = {
    flat: 'Квартирный переезд',
    office: 'Офисный переезд', 
    intercity: 'Межгородский переезд',
    garbage: 'Вывоз мусора'
  }

  const statusLabels = {
    draft: 'Черновик',
    active: 'Активная',
    in_progress: 'В процессе',
    awaiting_confirmation: 'Ожидает подтверждения',
    completed: 'Завершена'
  }

  const statusColors = {
    draft: 'status-draft',
    active: 'status-active',
    in_progress: 'status-pending',
    awaiting_confirmation: 'bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium',
    completed: 'status-completed'
  }

  useEffect(() => {
    loadTask()
  }, [id])

  const loadTask = async () => {
    try {
      setLoading(true)
      logger.log('Загружаю заявку ID:', id)
      
      const response = await api.get(`/tasks/${id}`)
      logger.log('Ответ API:', response.data)
      
      if (response.data.success) {
        const taskData = response.data.task
        logger.log('📋 Данные задачи загружены:', {
          id: taskData.id,
          title: taskData.title,
          fromAddress: taskData.fromAddress || 'НЕТ',
          toAddress: taskData.toAddress || 'НЕТ',
          hasFromAddress: !!taskData.fromAddress,
          hasToAddress: !!taskData.toAddress
        })
        setTask(taskData)
      } else {
        setError('Заявка не найдена')
      }
    } catch (err) {
      logger.error('Ошибка загрузки заявки:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки заявки')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleBidCreated = (newBid) => {
    logger.log('Новый отклик создан:', newBid)
    // Обновляем список откликов в task
    setTask(prev => ({
      ...prev,
      bids: [newBid, ...(prev.bids || [])]
    }))
  }

  const handleAcceptBid = async (bidId) => {
    try {
      setAcceptingBid(bidId)
      logger.log('Принимаю отклик:', bidId)
      
      const response = await api.patch(`/bids/${bidId}/accept`)
      logger.log('Ответ принятия отклика:', response.data)
      
      if (response.data.success) {
        // Перезагружаем заявку для получения актуальных данных
        await loadTask()
      } else {
        alert(response.data.message || 'Ошибка принятия отклика')
      }
    } catch (err) {
      logger.error('Ошибка принятия отклика:', err)
      alert(err.response?.data?.message || 'Ошибка принятия отклика')
    } finally {
      setAcceptingBid(null)
    }
  }

  const handleTaskConfirmation = async (confirmationData) => {
    logger.log('Подтверждение завершения:', confirmationData)
    // Перезагружаем заявку для получения актуального статуса
    await loadTask()
  }

  const handleOpenChat = (executor) => {
    setSelectedExecutor(executor)
    setChatModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">{error}</div>
        <Link to="/tasks" className="btn btn-primary">
          Вернуться к списку заявок
        </Link>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-xl mb-4">Заявка не найдена</div>
        <Link to="/tasks" className="btn btn-primary">
          Вернуться к списку заявок
        </Link>
      </div>
    )
  }

  const isOwner = user && user.id === task.customer?.id
  const canEdit = isOwner && (task.status === 'draft' || task.status === 'active')
  
  // Проверяем, есть ли уже отклик от текущего пользователя
  const userBid = user && task.bids?.find(bid => bid.executor?.id === user.id)
  const canBid = !isOwner && user && task.status === 'active' && !userBid

  return (
    <div className="max-w-4xl mx-auto">
      {/* Хлебные крошки */}
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-blue-600 hover:underline">Главная</Link>
        <span className="mx-2">→</span>
        <Link to="/tasks" className="text-blue-600 hover:underline">Заявки</Link>
        <span className="mx-2">→</span>
        <span className="text-gray-600">#{task.id.slice(0, 8)}</span>
      </nav>

      {/* Основная информация */}
      <div className="card mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className={statusColors[task.status]}>
                {statusLabels[task.status]}
              </span>
              <span>{categoryLabels[task.category]}</span>
              <span>Создана: {formatDateTime(task.createdAt)}</span>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/edit-task/${task.id}`)}
                className="btn btn-secondary btn-sm"
              >
                Редактировать
              </button>
            </div>
          )}
        </div>

        {/* Адреса и дата */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">📍 Маршрут</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Откуда:</span>
                <div className="font-medium">{task.fromAddress}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Куда:</span>
                <div className="font-medium">{task.toAddress}</div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">📅 Дата переезда</h3>
            <div className="font-medium text-lg">
              {formatDate(task.date)}
            </div>
          </div>
        </div>

        {/* Карта с маршрутом */}
        <div className="mb-6">
          <RouteMap 
            fromAddress={task.fromAddress} 
            toAddress={task.toAddress} 
          />
        </div>

        {/* Описание */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">📝 Описание</h3>
          <div className="whitespace-pre-line text-gray-700">
            {task.description}
          </div>
        </div>

        {/* Информация о заказчике */}
        {task.customer && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">👤 Заказчик</h3>
            <div className="flex items-center gap-3">
              <UserAvatar user={task.customer} size="lg" />
              <div className="flex-1">
                <div className="font-medium">{task.customer.name}</div>
                {task.customer.role === 'executor' && (
                  <div className="text-sm text-gray-600">
                    ⭐ Рейтинг: {task.customer.rating || 'Новый пользователь'}
                  </div>
                )}
              </div>
              {/* Кнопка для исполнителей, чтобы написать заказчику */}
              {!isOwner && user && user.role === 'executor' && (
                <button 
                  onClick={() => handleOpenChat(task.customer)}
                  className="btn btn-secondary btn-sm"
                >
                  Написать
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Компонент подтверждения завершения - только для заказчиков */}
      {isOwner && task.status === 'awaiting_confirmation' && (
        <TaskCompletionConfirmation 
          task={task}
          onConfirmation={handleTaskConfirmation}
        />
      )}

      {/* Отклики */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Отклики ({task.bids?.length || 0})
          </h2>
          
          {/* Кнопка отклика или информация о статусе */}
          {!isOwner && user && user.role === 'executor' && task.status === 'active' && (
            <div>
              {userBid ? (
                <div className="text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="text-lg">✅</span>
                      <div className="flex-1">
                        <div className="font-semibold">Вы уже откликнулись</div>
                        <div className="text-sm">
                          Ваша цена: <span className="font-medium">{userBid.price} ₽</span>
                          {userBid.accepted && (
                            <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              ✓ Принят
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleOpenChat(task.customer)}
                        className="btn btn-secondary btn-sm ml-3"
                      >
                        Написать заказчику
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setBidModalOpen(true)}
                    className="btn btn-primary"
                  >
                    Откликнуться на заявку
                  </button>
                  <button 
                    onClick={() => handleOpenChat(task.customer)}
                    className="btn btn-secondary"
                  >
                    Написать заказчику
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {task.bids && task.bids.length > 0 ? (
          <div className="space-y-4">
            {task.bids.map(bid => (
              <div key={bid.id} className={`border rounded-lg p-4 ${
                bid.accepted ? 'bg-green-50 border-green-200' : ''
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={bid.executor} size="lg" />
                    <div>
                      <div className="font-medium">
                        <Link 
                          to={`/executor/${bid.executor?.id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {bid.executor?.name}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-600">
                        ⭐ {bid.executor?.rating || 'Новый'}
                      </div>
                      {/* Контактная информация */}
                      <div className="text-sm text-gray-600 mt-1">
                        {bid.executor?.email ? (
                          <div className="flex items-center gap-1">
                            <span>📧</span>
                            <a href={`mailto:${bid.executor.email}`} className="text-blue-600 hover:underline">
                              {bid.executor.email}
                            </a>
                          </div>
                        ) : null}
                        {bid.executor?.phone ? (
                          <div className="flex items-center gap-1">
                            <span>📞</span>
                            <a href={`tel:${bid.executor.phone}`} className="text-blue-600 hover:underline">
                              {bid.executor.phone}
                            </a>
                          </div>
                        ) : null}
                        {!bid.executor?.email && !bid.executor?.phone && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <span>🔒</span>
                            <span className="text-xs">Контакты скрыты</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {bid.accepted && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ✓ Принят
                      </span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {bid.price} ₽
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(bid.createdAt)}
                    </div>
                  </div>
                </div>
                
                {bid.comment && (
                  <div className="text-gray-700 mt-2 pl-13">
                    {bid.comment}
                  </div>
                )}
                
                {isOwner && task.status === 'active' && !bid.accepted && (
                  <div className="flex gap-2 mt-3 pl-13">
                    <button 
                      onClick={() => handleAcceptBid(bid.id)}
                      disabled={acceptingBid === bid.id}
                      className="btn btn-success btn-sm"
                    >
                      {acceptingBid === bid.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Принимаю...
                        </div>
                      ) : (
                        'Принять'
                      )}
                    </button>
                    <button 
                      onClick={() => handleOpenChat(bid.executor)}
                      className="btn btn-secondary btn-sm"
                    >
                      Написать
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <div>Пока нет откликов</div>
            {task.status === 'active' && (
              <div className="text-sm mt-1">
                Будьте первым, кто откликнется на эту заявку!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Модальное окно создания отклика */}
      <BidModal
        isOpen={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        task={task}
        onBidCreated={handleBidCreated}
      />

      {/* Модальное окно чата */}
      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        task={task}
        executor={selectedExecutor}
      />
    </div>
  )
}

export default TaskDetailPage 