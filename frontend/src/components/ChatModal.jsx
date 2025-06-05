import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import { useUnread } from '../contexts/UnreadContext'
import api from '../services/api'
import UserAvatar from './UserAvatar'

const ChatModal = ({ isOpen, onClose, task, executor, otherUser }) => {
  const { user } = useAuth()
  const { joinTaskRoom, leaveTaskRoom, onNewMessage, offNewMessage } = useSocket()
  const { loadUnreadCount } = useUnread()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef(null)

  // Автопрокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Загрузка сообщений при открытии чата
  useEffect(() => {
    if (isOpen && task && (executor || otherUser)) {
      loadMessages()
    }
  }, [isOpen, task, executor, otherUser])

  // WebSocket подключение и отключение
  useEffect(() => {
    if (isOpen && task) {
      // Подключаемся к комнате задачи
      joinTaskRoom(task.id)
      
      // Слушаем новые сообщения
      const handleNewMessage = (messageData) => {
        console.log('🔥 Получено новое сообщение через WebSocket:', messageData)
        
        // Проверяем, что сообщение относится к текущему чату
        if (messageData.taskId === task.id) {
          setMessages(prev => {
            // Простая проверка дублирования по ID
            const exists = prev.some(msg => msg.id === messageData.id)
            if (!exists) {
              console.log('✅ Добавляем новое сообщение через WebSocket')
              return [...prev, messageData]
            } else {
              console.log('⚠️ Дублирование предотвращено')
              return prev
            }
          })
        }
      }
      
      onNewMessage(handleNewMessage)
      
      return () => {
        // Отключаемся от комнаты и убираем слушатель
        leaveTaskRoom(task.id)
        offNewMessage(handleNewMessage)
      }
    }
  }, [isOpen, task, joinTaskRoom, leaveTaskRoom, onNewMessage, offNewMessage])

  const loadMessages = async () => {
    if (!task || (!executor && !otherUser)) return
    
    try {
      setLoading(true)
      
      // Определяем с кем общается текущий пользователь
      let otherUserId
      if (otherUser) {
        // Если передан otherUser (из ChatsPage), используем его
        otherUserId = otherUser.id
      } else if (executor) {
        // executor может быть как исполнителем, так и заказчиком в зависимости от контекста
        // Если это не текущий пользователь, значит это собеседник
        if (executor.id !== user.id) {
          otherUserId = executor.id
        } else {
          // Если executor - это текущий пользователь, то собеседник - заказчик
          otherUserId = task.customer?.id
        }
      }
      
      console.log('🔍 ChatModal Debug:', {
        userId: user.id,
        userRole: user.role,
        taskId: task.id,
        taskCustomerId: task.customer?.id,
        executorId: executor?.id,
        otherUserId: otherUserId,
        hasOtherUser: !!otherUser,
        hasExecutor: !!executor,
        task: task
      })
      
      if (!otherUserId) {
        console.error('❌ otherUserId is undefined!', {
          user,
          task,
          executor,
          otherUser
        })
        return
      }
      
      console.log('📨 Loading messages for task:', task.id, 'otherUser:', otherUserId, 'currentUser:', user.id)
      
      const response = await api.get(`/messages/task/${task.id}/user/${otherUserId}`)
      
      console.log('📨 Messages response:', response.data)
      
      if (response.data.success) {
        setMessages(response.data.messages || [])
        
        // Уведомляем о том, что сообщения прочитаны (для обновления счетчика)
        if (loadUnreadCount) {
          loadUnreadCount()
        }
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки сообщений:', error)
      if (error.response) {
        console.error('❌ Error response:', error.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    try {
      setSendingMessage(true)
      
      // Определяем получателя сообщения
      let receiverId
      if (otherUser) {
        // Если передан otherUser (из ChatsPage), используем его
        receiverId = otherUser.id
      } else if (executor) {
        // executor может быть как исполнителем, так и заказчиком в зависимости от контекста
        // Если это не текущий пользователь, значит это получатель
        if (executor.id !== user.id) {
          receiverId = executor.id
        } else {
          // Если executor - это текущий пользователь, то получатель - заказчик
          receiverId = task.customer?.id
        }
      }
      
      console.log('Sending message to:', receiverId, 'from:', user.id)
      
      const messageData = {
        taskId: task.id,
        receiverId: receiverId,
        text: newMessage.trim()
      }

      const response = await api.post('/messages', messageData)
      
      if (response.data.success) {
        // Добавляем сообщение в локальный список
        const sentMessage = {
          id: response.data.message.id,
          text: newMessage.trim(),
          senderId: user.id,
          receiverId: receiverId,
          taskId: task.id,
          createdAt: new Date().toISOString(),
          sender: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          }
        }
        
        setMessages(prev => [...prev, sentMessage])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
      alert('Ошибка отправки сообщения')
    } finally {
      setSendingMessage(false)
    }
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

  if (!isOpen) return null

  // Определяем собеседника для отображения в заголовке
  const chatPartner = otherUser || (user.id === task?.customer?.id ? executor : task?.customer)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full h-[600px] flex flex-col">
        {/* Заголовок */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <UserAvatar user={chatPartner} size="md" />
            <div>
              <h3 className="font-semibold">{chatPartner?.name}</h3>
              <p className="text-sm text-gray-600">Чат по заявке: {task?.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Область сообщений */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 h-full flex flex-col justify-center">
              <div className="text-4xl mb-2">💬</div>
              <p>Начните общение с {chatPartner?.name}</p>
              <p className="text-sm mt-1">Обсудите детали переезда и уточните вопросы</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.senderId === user.id
              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMyMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      isMyMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Форма отправки сообщения */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Напишите сообщение..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sendingMessage}
              maxLength={500}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sendingMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendingMessage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                '📤'
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Максимум 500 символов. Будьте вежливы и корректны.
          </p>
        </form>
      </div>
    </div>
  )
}

export default ChatModal 