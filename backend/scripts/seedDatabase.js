const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User, Task, Bid, Message, News, Review } = require('../src/models');
const { demoUsers, demoTasks, demoNews } = require('./seedData');

// Функция для генерации UUID
const generateId = () => {
  return uuidv4();
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
          case 'flat': basePrice = 8000; break;
          case 'office': basePrice = 25000; break;
          case 'intercity': basePrice = 45000; break;
          case 'garbage': basePrice = 3500; break;
          default: basePrice = 10000;
        }
        
        const price = basePrice + Math.floor(Math.random() * 5000) - 2500;
        
        const comments = [
          'Выполним работу качественно и в срок. Есть весь необходимый инвентарь.',
          'Профессиональная команда, работаем аккуратно. Гарантируем сохранность вещей.',
          'Большой опыт подобных работ. Все материалы для упаковки включены в стоимость.',
          'Можем выполнить в удобное для вас время. Предоставляем фото-отчет.',
          'Команда из 4 человек, собственный транспорт. Работаем быстро и качественно.'
        ];
        
        bids.push({
          taskId: task.id,
          userId: executor.id,
          price: price,
          comment: comments[Math.floor(Math.random() * comments.length)],
          accepted: task.status === 'in_progress' && i === 0
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
    if (!task) return; // Пропускаем, если задача не найдена
    
    const executor = users.find(u => u.id === bid.userId);
    const customer = users.find(u => u.id === task.userId);
    
    if (!executor || !customer) return; // Пропускаем, если пользователи не найдены
    
    // Создаем несколько сообщений для каждого отклика
    if (Math.random() > 0.3) { // 70% вероятность наличия переписки
      
      // Первое сообщение от заказчика
      messages.push({
        taskId: task.id,
        senderId: customer.id,
        receiverId: executor.id,
        text: 'Здравствуйте! Интересует ваш отклик. Можете рассказать подробнее?',
        read: true
      });
      
      // Ответ исполнителя
      messages.push({
        taskId: task.id,
        senderId: executor.id,
        receiverId: customer.id,
        text: 'Конечно! Работаем профессионально, все вещи упакуем, доставим аккуратно. Можем приехать на осмотр.',
        read: Math.random() > 0.2
      });
      
      if (Math.random() > 0.5) {
        // Дополнительные сообщения
        messages.push({
          taskId: task.id,
          senderId: customer.id,
          receiverId: executor.id,
          text: 'А что входит в стоимость? Упаковочные материалы включены?',
          read: true
        });
        
        messages.push({
          taskId: task.id,
          senderId: executor.id,
          receiverId: customer.id,
          text: 'Да, все материалы включены: пленка, картон, скотч. Также входит разборка/сборка мебели.',
          read: Math.random() > 0.3
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
    // Подключаемся к базе данных и создаем таблицы
    console.log('🔗 Подключаемся к базе данных...');
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных установлено');
    
    // Синхронизируем модели (если нужно)
    await sequelize.sync({ alter: false });
    console.log('📋 Модели синхронизированы');

    // 1. Создаем пользователей
    console.log('👥 Создаем демо-пользователей...');
    const users = [];
    
    for (let i = 0; i < demoUsers.length; i++) {
      const userData = demoUsers[i];
      
      // Проверяем, есть ли уже такой пользователь
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        console.log(`⏭️  Пользователь ${userData.email} уже существует`);
        users.push(existingUser);
        continue;
      }
      
      // Создаем пользователя (пароль хешируется автоматически в хуке модели)
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // будет автоматически захеширован
        role: userData.role,
        avatar: userData.avatar,
        rating: userData.rating,
        services: userData.services || null
      });
      
      users.push(user);
      console.log(`✅ Создан пользователь: ${userData.name} (${userData.role})`);
    }
    
    // 2. Создаем заявки
    console.log('📋 Создаем демо-заявки...');
    const tasks = [];
    
    for (let i = 0; i < demoTasks.length; i++) {
      const taskData = demoTasks[i];
      
      // Проверяем, есть ли уже такая заявка
      const existingTask = await Task.findOne({ where: { title: taskData.title } });
      if (existingTask) {
        console.log(`⏭️  Заявка "${taskData.title}" уже существует`);
        tasks.push(existingTask);
        continue;
      }
      
      const customer = users.find(u => u.email === demoUsers[taskData.customerIndex].email);
      if (!customer) {
        console.log(`⚠️ Не найден заказчик для заявки "${taskData.title}"`);
        continue;
      }
      
      const task = await Task.create({
        title: taskData.title,
        description: taskData.description,
        fromAddress: taskData.fromAddress,
        toAddress: taskData.toAddress,
        date: taskData.date,
        category: taskData.category,
        status: taskData.status,
        userId: customer.id
      });
      
      tasks.push(task);
      console.log(`✅ Создана заявка: ${taskData.title} (${taskData.category})`);
    }
    
    // 3. Создаем отклики
    console.log('💼 Создаем демо-отклики...');
    const bidsData = generateBids(tasks, users);
    const bids = [];
    
    for (const bidData of bidsData) {
      // Проверяем, есть ли уже такой отклик
      const existingBid = await Bid.findOne({ 
        where: { 
          taskId: bidData.taskId, 
          userId: bidData.userId 
        } 
      });
      
      if (!existingBid) {
        const bid = await Bid.create(bidData);
        bids.push(bid);
      } else {
        bids.push(existingBid);
      }
    }
    console.log(`✅ Создано откликов: ${bids.length}`);
    
    // 4. Создаем сообщения
    console.log('💬 Создаем демо-сообщения...');
    const messagesData = generateMessages(tasks, bids, users);
    const messages = [];
    
    for (const messageData of messagesData) {
      const message = await Message.create(messageData);
      messages.push(message);
    }
    console.log(`✅ Создано сообщений: ${messages.length}`);
    
    // 5. Создаем новости
    console.log('📰 Создаем демо-новости...');
    const news = [];
    
    for (const newsItem of demoNews) {
      // Ищем существующую новость
      const existingNews = await News.findOne({ 
        where: { slug: newsItem.slug } 
      });

      if (!existingNews) {
        // Назначаем автора - первого пользователя (админа)
        const author = users.find(u => u.role === 'admin') || users[0];
        
        await News.create({
          ...newsItem,
          authorId: author.id,
          publishedAt: new Date(),
          status: 'published',
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
        console.log(`✅ Создана новость: ${newsItem.title}`);
      } else {
        console.log(`⏭️  Новость "${newsItem.title}" уже существует`);
      }
    }
    
    // 6. Создаем отзывы
    console.log('⭐ Создаем демо-отзывы...');
    const reviews = [];
    
    const completedTasks = tasks.filter(t => t.status === 'completed');
    for (const task of completedTasks) {
      const acceptedBid = bids.find(b => b.taskId === task.id && b.accepted);
      if (acceptedBid) {
        const customer = users.find(u => u.id === task.userId);
        const executor = users.find(u => u.id === acceptedBid.userId);
        
        // Проверяем, есть ли уже отзыв
        const existingReview = await Review.findOne({ 
          where: { 
            taskId: task.id, 
            authorId: customer.id 
          } 
        });
        
        if (!existingReview) {
          // Отзыв от заказчика к исполнителю
          const review = await Review.create({
            taskId: task.id,
            authorId: customer.id,
            targetId: executor.id,
            rating: Math.floor(Math.random() * 2) + 4, // 4 или 5 звезд
            comment: 'Отличная работа! Все сделали быстро и аккуратно. Рекомендую!'
          });
          reviews.push(review);
        }
      }
    }
    console.log(`✅ Создано отзывов: ${reviews.length}`);
    
    console.log('✅ Демо-данные успешно сохранены в базу данных!');
    console.log(`📊 Итоговая статистика:
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