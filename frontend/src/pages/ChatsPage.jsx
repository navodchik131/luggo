import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import api from '../services/api'
import UserAvatar from '../components/UserAvatar'
import ChatModal from '../components/ChatModal'

const ChatsPage = () => {
  const { user } = useAuth()
  const { onNewMessage, offNewMessage } = useSocket()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatModalOpen, setChatModalOpen] = useState(false)

  useEffect(() => {
    loadChats()
  }, [])

  // WebSocket слушатель для обновления списка чатов
  useEffect(() => {
    if (user) {
      const handleNewMessage = (messageData) => {
        // Обновляем список чатов при получении нового сообщения
        loadChats()
      }
      
      onNewMessage(handleNewMessage)
      
      return () => {
        offNewMessage(handleNewMessage)
      }
    }
  }, [user, onNewMessage, offNewMessage])

  const loadChats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/messages/chats')
      
      if (response.data.success) {
        setChats(response.data.chats || [])
      } else {
        setError('Ошибка загрузки чатов')
      }
    } catch (err) {
      console.error('Ошибка загрузки чатов:', err)
      setError(err.response?.data?.message || 'Ошибка загрузки чатов')
    } finally {
      setLoading(false)
    }
  }

  const openChat = (chat) => {
    setSelectedChat(chat)
    setChatModalOpen(true)
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'только что'
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600',
      in_progress: 'text-blue-600',
      awaiting_confirmation: 'text-orange-600',
      completed: 'text-gray-600',
      cancelled: 'text-red-600',
      draft: 'text-gray-500'
    }
    return colors[status] || 'text-gray-600'
  }

  const getStatusText = (status) => {
    const statuses = {
      active: 'Активная',
      in_progress: 'В процессе',
      awaiting_confirmation: 'Ожидает подтверждения',
      completed: 'Завершена',
      cancelled: 'Отменена',
      draft: 'Черновик'
    }
    return statuses[status] || status
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
        <button 
          onClick={loadChats}
          className="btn btn-primary"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Мои чаты</h1>
        <div className="text-sm text-gray-600">
          {chats.length} {chats.length === 1 ? 'чат' : chats.length < 5 ? 'чата' : 'чатов'}
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💬</div>
          <div className="text-xl text-gray-600 mb-2">У вас пока нет чатов</div>
          <div className="text-gray-500 mb-6">
            {user?.role === 'executor' ? (
              'Откликайтесь на заявки, чтобы начать общение с заказчиками'
            ) : (
              'Создавайте заявки и принимайте отклики, чтобы начать общение с исполнителями'
            )}
          </div>
          <Link to="/tasks" className="btn btn-primary">
            {user?.role === 'executor' ? 'Найти заявки' : 'Мои заявки'}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <div
              key={`${chat.taskId}-${chat.otherUser.id}`}
              onClick={() => openChat(chat)}
              className="card hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Аватар собеседника */}
                  <UserAvatar user={chat.otherUser} size="lg" />
                  
                  {/* Информация о чате */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">
                        {chat.otherUser.name}
                      </h3>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Информация о заявке */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Link 
                        to={`/tasks/${chat.taskId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-600 hover:underline truncate max-w-xs"
                      >
                        {chat.task.title}
                      </Link>
                      <span className="text-gray-400">•</span>
                      <span className={getStatusColor(chat.task.status)}>
                        {getStatusText(chat.task.status)}
                      </span>
                    </div>
                    
                    {/* Последнее сообщение */}
                    {chat.lastMessage && (
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">
                          {chat.lastMessage.senderId === user.id ? 'Вы: ' : ''}
                        </span>
                        <span className="truncate max-w-md inline-block">
                          {chat.lastMessage.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Время последнего сообщения */}
                <div className="text-xs text-gray-500 text-right">
                  {chat.lastMessage && formatTime(chat.lastMessage.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно чата */}
      {selectedChat && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false)
            setSelectedChat(null)
            // Обновляем чаты после закрытия, чтобы сбросить счетчик непрочитанных
            loadChats()
          }}
          task={selectedChat.task}
          otherUser={selectedChat.otherUser}
        />
      )}
    </div>
  )
}

export default ChatsPage 