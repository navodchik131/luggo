const bcrypt = require('bcryptjs');
const { demoUsers, demoTasks, demoNews } = require('./seedData');

// Функция для генерации случайного ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Функция для создания демо-откликов
const generateBids = (tasks, users) => {
  const executors = users.filter(u => u.role === 'executor');
  const bids = [];
  
  tasks.forEach((task, taskIndex) => {
    if (task.status === 'active' || task.status === 'in_progress' || task.status === 'completed') {
      // Количество откликов от 2 до 5
      const bidCount = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < bidCount && i < executors.length; i++) {
        const executor = executors[i];
        
        // Генерируем цену на основе категории
        let basePrice;
        switch (task.category) {
          case 'flat': basePrice = 12000; break;
          case 'office': basePrice = 35000; break;
          case 'intercity': basePrice = 75000; break;
          case 'garbage': basePrice = 5000; break;
          default: basePrice = 15000;
        }
        
        const price = basePrice + Math.floor(Math.random() * 10000) - 5000;
        
        const comments = [
          'Выполним работу качественно и в срок. Есть весь необходимый инвентарь.',
          'Профессиональная команда, работаем аккуратно. Гарантируем сохранность вещей.',
          'Большой опыт подобных работ. Все материалы для упаковки включены в стоимость.',
          'Можем выполнить в удобное для вас время. Предоставляем фото-отчет.',
          'Команда из 4 человек, собственный транспорт. Работаем быстро и качественно.'
        ];
        
        bids.push({
          id: generateId(),
          taskId: task.id,
          userId: executor.id,
          price: price,
          comment: comments[Math.floor(Math.random() * comments.length)],
          accepted: task.status === 'in_progress' && i === 0,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)
        });
      }
    }
  });
  
  return bids;
};

// Функция для создания демо-сообщений
const generateMessages = (tasks, bids, users) => {
  const messages = [];
  
  bids.forEach(bid => {
    const task = tasks.find(t => t.id === bid.taskId);
    const executor = users.find(u => u.id === bid.userId);
    const customer = users.find(u => u.id === task.userId);
    
    // Создаем несколько сообщений для каждого отклика
    if (Math.random() > 0.3) { // 70% вероятность наличия переписки
      
      // Первое сообщение от заказчика
      messages.push({
        id: generateId(),
        taskId: task.id,
        senderId: customer.id,
        receiverId: executor.id,
        text: 'Здравствуйте! Интересует ваш отклик. Можете рассказать подробнее?',
        read: true,
        createdAt: new Date(bid.createdAt.getTime() + 60 * 60 * 1000) // час после отклика
      });
      
      // Ответ исполнителя
      messages.push({
        id: generateId(),
        taskId: task.id,
        senderId: executor.id,
        receiverId: customer.id,
        text: 'Конечно! Работаем профессионально, все вещи упакуем, доставим аккуратно. Можем приехать на осмотр.',
        read: Math.random() > 0.2,
        createdAt: new Date(bid.createdAt.getTime() + 2 * 60 * 60 * 1000)
      });
      
      if (Math.random() > 0.5) {
        // Дополнительные сообщения
        messages.push({
          id: generateId(),
          taskId: task.id,
          senderId: customer.id,
          receiverId: executor.id,
          text: 'А что входит в стоимость? Упаковочные материалы включены?',
          read: true,
          createdAt: new Date(bid.createdAt.getTime() + 3 * 60 * 60 * 1000)
        });
        
        messages.push({
          id: generateId(),
          taskId: task.id,
          senderId: executor.id,
          receiverId: customer.id,
          text: 'Да, все материалы включены: пленка, картон, скотч. Также входит разборка/сборка мебели.',
          read: Math.random() > 0.3,
          createdAt: new Date(bid.createdAt.getTime() + 4 * 60 * 60 * 1000)
        });
      }
    }
  });
  
  return messages;
};

// Основная функция для наполнения базы данных
const seedDatabase = async () => {
  console.log('🌱 Начинаем наполнение базы данных демо-данными...');
  
  try {
    // 1. Создаем пользователей
    console.log('👥 Создаем демо-пользователей...');
    const users = [];
    
    for (let i = 0; i < demoUsers.length; i++) {
      const userData = demoUsers[i];
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = {
        id: generateId(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: hashedPassword,
        role: userData.role,
        avatar: userData.avatar,
        rating: userData.rating,
        experience: userData.experience || null,
        services: userData.services || null,
        createdAt: userData.createdAt
      };
      
      users.push(user);
    }
    
    // 2. Создаем заявки
    console.log('📋 Создаем демо-заявки...');
    const tasks = [];
    
    for (let i = 0; i < demoTasks.length; i++) {
      const taskData = demoTasks[i];
      const customer = users[taskData.customerIndex];
      
      const task = {
        id: generateId(),
        title: taskData.title,
        description: taskData.description,
        fromAddress: taskData.fromAddress,
        toAddress: taskData.toAddress,
        date: taskData.date,
        category: taskData.category,
        status: taskData.status,
        userId: customer.id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000)
      };
      
      tasks.push(task);
    }
    
    // 3. Создаем отклики
    console.log('💼 Создаем демо-отклики...');
    const bids = generateBids(tasks, users);
    
    // 4. Создаем сообщения
    console.log('💬 Создаем демо-сообщения...');
    const messages = generateMessages(tasks, bids, users);
    
    // 5. Создаем новости
    console.log('📰 Создаем демо-новости...');
    const news = [];
    
    for (let i = 0; i < demoNews.length; i++) {
      const newsData = demoNews[i];
      
      const article = {
        id: generateId(),
        title: newsData.title,
        slug: newsData.slug,
        excerpt: newsData.excerpt,
        content: newsData.content,
        imageUrl: newsData.imageUrl,
        tags: JSON.stringify(newsData.tags),
        status: newsData.status,
        views: newsData.views,
        publishedAt: newsData.publishedAt,
        createdAt: newsData.publishedAt
      };
      
      news.push(article);
    }
    
    // 6. Создаем отзывы
    console.log('⭐ Создаем демо-отзывы...');
    const reviews = [];
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    completedTasks.forEach(task => {
      const acceptedBid = bids.find(b => b.taskId === task.id && b.accepted);
      if (acceptedBid) {
        const customer = users.find(u => u.id === task.userId);
        const executor = users.find(u => u.id === acceptedBid.userId);
        
        // Отзыв от заказчика к исполнителю
        reviews.push({
          id: generateId(),
          taskId: task.id,
          authorId: customer.id,
          targetId: executor.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 или 5 звезд
          comment: 'Отличная работа! Все сделали быстро и аккуратно. Рекомендую!',
          createdAt: new Date(task.createdAt.getTime() + 24 * 60 * 60 * 1000)
        });
        
        // Отзыв от исполнителя к заказчику (иногда)
        if (Math.random() > 0.3) {
          reviews.push({
            id: generateId(),
            taskId: task.id,
            authorId: executor.id,
            targetId: customer.id,
            rating: Math.floor(Math.random() * 2) + 4,
            comment: 'Приятно работать с организованным заказчиком. Спасибо!',
            createdAt: new Date(task.createdAt.getTime() + 25 * 60 * 60 * 1000)
          });
        }
      }
    });
    
    console.log('✅ Демо-данные успешно сгенерированы!');
    console.log(`📊 Статистика:
    👥 Пользователи: ${users.length}
    📋 Заявки: ${tasks.length}  
    💼 Отклики: ${bids.length}
    💬 Сообщения: ${messages.length}
    📰 Новости: ${news.length}
    ⭐ Отзывы: ${reviews.length}`);
    
    return {
      users,
      tasks,
      bids,
      messages,
      news,
      reviews
    };
    
  } catch (error) {
    console.error('❌ Ошибка при создании демо-данных:', error);
    throw error;
  }
};

// Экспортируем функцию и данные
module.exports = {
  seedDatabase,
  generateId
};

// Если файл запускается напрямую
if (require.main === module) {
  seedDatabase()
    .then((data) => {
      console.log('🎉 База данных успешно наполнена демо-данными!');
      console.log('Теперь ваша платформа выглядит как рабочая система.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Ошибка наполнения базы данных:', error);
      process.exit(1);
    });
} 