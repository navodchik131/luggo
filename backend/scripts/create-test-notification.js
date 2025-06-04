const { User, Notification } = require('../src/models');
const { connectDB } = require('../src/config/database');

async function createTestNotifications() {
  try {
    await connectDB();
    
    console.log('🔄 Создаю тестовые уведомления...');
    
    // Найти первого пользователя для тестирования
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ Пользователи не найдены. Сначала зарегистрируйтесь в системе.');
      process.exit(1);
    }
    
    console.log(`📧 Создаю уведомления для пользователя: ${user.name} (${user.email})`);
    
    // Создаем несколько тестовых уведомлений
    const testNotifications = [
      {
        userId: user.id,
        type: 'new_bid',
        title: 'Новый отклик на вашу заявку',
        message: 'Исполнитель Иван Петров откликнулся на заявку "Переезд 2-комнатной квартиры" с предложением 15000 ₽',
        actionUrl: '/tasks/1',
        relatedType: 'bid',
        relatedId: '123e4567-e89b-12d3-a456-426614174000',
        metadata: {
          executorName: 'Иван Петров',
          price: 15000,
          taskTitle: 'Переезд 2-комнатной квартиры'
        }
      },
      {
        userId: user.id,
        type: 'bid_accepted',
        title: 'Ваш отклик принят!',
        message: 'Заказчик Мария Сидорова приняла ваш отклик на заявку "Офисный переезд" на сумму 25000 ₽',
        actionUrl: '/tasks/2',
        relatedType: 'bid',
        relatedId: '123e4567-e89b-12d3-a456-426614174001',
        metadata: {
          customerName: 'Мария Сидорова',
          taskTitle: 'Офисный переезд',
          price: 25000
        }
      },
      {
        userId: user.id,
        type: 'new_message',
        title: 'Новое сообщение',
        message: 'Алексей Козлов написал вам сообщение по заявке "Вывоз мусора"',
        actionUrl: '/messages/1',
        relatedType: 'message',
        relatedId: '123e4567-e89b-12d3-a456-426614174002',
        metadata: {
          senderName: 'Алексей Козлов',
          taskTitle: 'Вывоз мусора'
        }
      },
      {
        userId: user.id,
        type: 'task_status_changed',
        title: 'Работа завершена',
        message: 'Статус заявки "Переезд дачи" изменен на "Работа завершена, ожидает подтверждения"',
        actionUrl: '/tasks/3',
        relatedType: 'task',
        relatedId: '123e4567-e89b-12d3-a456-426614174003',
        metadata: {
          taskTitle: 'Переезд дачи',
          oldStatus: 'in_progress',
          newStatus: 'awaiting_confirmation'
        }
      },
      {
        userId: user.id,
        type: 'system',
        title: 'Добро пожаловать в Luggo!',
        message: 'Спасибо за регистрацию! Теперь вы можете создавать заявки или откликаться на них как исполнитель.',
        actionUrl: '/profile',
        relatedType: 'user',
        relatedId: user.id,
        metadata: {
          welcomeMessage: true
        },
        isRead: true // Это уведомление уже прочитано
      }
    ];
    
    // Создаем уведомления
    for (const notificationData of testNotifications) {
      const notification = await Notification.create(notificationData);
      console.log(`✅ Создано уведомление: ${notification.title}`);
    }
    
    console.log(`🎉 Создано ${testNotifications.length} тестовых уведомлений для пользователя ${user.name}`);
    console.log('📱 Теперь можете проверить уведомления в интерфейсе!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых уведомлений:', error);
    process.exit(1);
  }
}

createTestNotifications(); 