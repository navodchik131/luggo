// Логирование вынесено в отдельные console.log для упрощения
const { Message, User, Task, Bid } = require('../models')
const { validationResult } = require('express-validator')
const { Op } = require('sequelize')

// Получение сообщений между пользователями по конкретной заявке
const getMessagesByTaskAndUser = async (req, res) => {
  try {
    const { taskId, userId: otherUserId } = req.params
    const currentUserId = req.user.id

    console.log('🔍 getMessagesByTaskAndUser Debug:', {
      taskId,
      otherUserId,
      currentUserId,
      userRole: req.user.role
    })

    // Проверяем существование заявки
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    })

    if (!task) {
      console.log('❌ Task not found:', taskId)
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      })
    }

    console.log('📋 Task found:', {
      taskId: task.id,
      customerId: task.customer?.id,
      customerName: task.customer?.name
    })

    // Проверяем существование другого пользователя
    const otherUser = await User.findByPk(otherUserId)
    if (!otherUser) {
      console.log('❌ Other user not found:', otherUserId)
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      })
    }

    console.log('👤 Other user found:', {
      id: otherUser.id,
      name: otherUser.name,
      role: otherUser.role
    })

    // Проверяем права доступа
    const isCustomer = task.customer.id === currentUserId
    const isOtherUserCustomer = task.customer.id === otherUserId
    
    // Проверяем, есть ли отклик от текущего пользователя или другого пользователя
    const currentUserBid = await Bid.findOne({
      where: {
        taskId: taskId,
        userId: currentUserId
      }
    })
    
    const otherUserBid = await Bid.findOne({
      where: {
        taskId: taskId,
        userId: otherUserId
      }
    })

    console.log('🔐 Access check:', {
      isCustomer,
      isOtherUserCustomer,
      hasCurrentUserBid: !!currentUserBid,
      hasOtherUserBid: !!otherUserBid
    })

    // Пользователь может общаться если:
    // 1. Он заказчик и общается с исполнителем (который откликнулся)
    // 2. Он исполнитель и общается с заказчиком
    const hasAccess = (isCustomer && otherUserBid) || 
                     (isOtherUserCustomer && currentUserBid) ||
                     (isCustomer && isOtherUserCustomer) // оба могут быть заказчиками в разных заявках

    if (!hasAccess) {
      console.log('❌ Access denied')
      return res.status(403).json({
        success: false,
        message: 'Нет прав для просмотра переписки'
      })
    }

    // Получаем сообщения между пользователями по данной заявке
    const messages = await Message.findAll({
      where: {
        taskId: taskId,
        [Op.or]: [
          {
            senderId: currentUserId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']]
    })

    console.log('📨 Messages found:', {
      count: messages.length,
      messages: messages.map(m => ({
        id: m.id,
        text: m.text.substring(0, 50) + '...',
        senderId: m.senderId,
        receiverId: m.receiverId,
        createdAt: m.createdAt
      }))
    })

    // Отмечаем сообщения как прочитанные (те, что адресованы текущему пользователю)
    await Message.update(
      { read: true },
      {
        where: {
          taskId: taskId,
          receiverId: currentUserId,
          senderId: otherUserId,
          read: false
        }
      }
    )

    res.json({
      success: true,
      messages: messages
    })
  } catch (error) {
    console.error('❌ Ошибка получения сообщений:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения сообщений'
    })
  }
}

// Отправка сообщения
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: errors.array()
      })
    }

    const { taskId, receiverId, text } = req.body
    const senderId = req.user.id

    // Проверяем существование заявки
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id']
        }
      ]
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Заявка не найдена'
      })
    }

    // Проверяем существование получателя
    const receiver = await User.findByPk(receiverId)
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Получатель не найден'
      })
    }

    // Проверяем права доступа - отправитель должен быть участником заявки
    const isCustomer = task.customer.id === senderId
    const hasAccess = isCustomer || senderId !== task.customer.id // исполнитель
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для отправки сообщения'
      })
    }

    // Создаем сообщение
    const message = await Message.create({
      taskId,
      senderId,
      receiverId,
      text: text.trim(),
      read: false
    })

    // Получаем созданное сообщение с данными отправителя
    const createdMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatar']
        }
      ]
    })

    // Отправляем сообщение через WebSocket всем участникам комнаты, кроме отправителя
    const io = req.app.get('io')
    const userSockets = req.app.get('userSockets')
    
    if (io) {
      // Получаем всех участников комнаты
      const room = io.sockets.adapter.rooms.get(`task_${taskId}`)
      
      if (room) {
        // Отправляем сообщение всем участникам комнаты, кроме отправителя
        const senderSocketId = userSockets.get(senderId)
        
        room.forEach(socketId => {
          // Пропускаем socket отправителя
          if (socketId !== senderSocketId) {
            io.to(socketId).emit('newMessage', createdMessage)
          }
        })
        
        console.log(`📡 Сообщение отправлено через WebSocket в комнату task_${taskId}, исключая отправителя ${senderId}`)
      }
    }

    res.status(201).json({
      success: true,
      message: createdMessage
    })
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка отправки сообщения'
    })
  }
}

// Получение всех чатов пользователя
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id

    // Получаем все заявки где пользователь участвует в переписке
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'status'],
          include: [
            {
              model: User,
              as: 'customer',
              attributes: ['id', 'name', 'avatar']
            }
          ]
        },
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    // Группируем сообщения по заявкам и собеседникам
    const chatsMap = new Map()
    
    messages.forEach(message => {
      const taskId = message.taskId
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId
      const chatKey = `${taskId}-${otherUserId}`
      
      if (!chatsMap.has(chatKey)) {
        const otherUser = message.senderId === userId ? message.receiver : message.sender
        chatsMap.set(chatKey, {
          taskId: taskId,
          task: message.task,
          otherUser: otherUser,
          lastMessage: message,
          unreadCount: 0
        })
      }
      
      // Считаем непрочитанные сообщения
      if (!message.read && message.receiverId === userId) {
        chatsMap.get(chatKey).unreadCount++
      }
    })

    const chats = Array.from(chatsMap.values())

    res.json({
      success: true,
      chats: chats
    })
  } catch (error) {
    console.error('Ошибка получения чатов:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения чатов'
    })
  }
}

// Отметить сообщения как прочитанные
const markMessagesAsRead = async (req, res) => {
  try {
    const { taskId, senderId } = req.body
    const receiverId = req.user.id

    await Message.update(
      { read: true },
      {
        where: {
          taskId,
          senderId,
          receiverId,
          read: false
        }
      }
    )

    res.json({
      success: true,
      message: 'Сообщения отмечены как прочитанные'
    })
  } catch (error) {
    console.error('Ошибка отметки сообщений:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка отметки сообщений'
    })
  }
}

// Получение количества непрочитанных сообщений
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id

    const unreadCount = await Message.count({
      where: {
        receiverId: userId,
        read: false
      }
    })

    res.json({
      success: true,
      unreadCount: unreadCount
    })
  } catch (error) {
    console.error('Ошибка получения количества непрочитанных сообщений:', error)
    res.status(500).json({
      success: false,
      message: 'Ошибка получения количества непрочитанных сообщений'
    })
  }
}

module.exports = {
  getMessagesByTaskAndUser,
  sendMessage,
  getUserChats,
  markMessagesAsRead,
  getUnreadCount
} 