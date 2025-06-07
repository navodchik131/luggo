const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./src/config/init');
const authRoutes = require('./src/routes/authRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const bidRoutes = require('./src/routes/bidRoutes');
const messageRoutes = require('./src/routes/messageRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const userRoutes = require('./src/routes/userRoutes');
const executorRoutes = require('./src/routes/executorRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const newsRoutes = require('./src/routes/newsRoutes');
const seoRoutes = require('./src/routes/seoRoutes');

const { errorHandler } = require('./src/middleware/errorMiddleware');
const { notFound } = require('./src/middleware/notFoundMiddleware');

const app = express();
const server = http.createServer(app);

// Настройка trust proxy для работы за nginx
app.set('trust proxy', true);

// Улучшенная конфигурация Socket.IO для продакшена
const io = socketIo(server, {
  cors: {
    origin: [
      "https://luggo.ru",
      "https://www.luggo.ru", 
      "http://localhost:5173",
      "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200
  },
  // Поддержка различных транспортов для лучшей совместимости
  transports: ['websocket', 'polling'],
  // Настройки для продакшена
  pingTimeout: 60000,
  pingInterval: 25000,
  // Позволяем обновления
  allowUpgrades: true,
  // Начинаем с polling, потом апгрейдим до websocket
  upgradeTimeout: 30000,
  // Настройки для работы за прокси (nginx)
  rememberUpgrade: false,
  // Дополнительные настройки безопасности
  serveClient: false,
  // Настройка namespace
  path: '/socket.io/',
  // Дополнительные настройки для исправления namespace
  connectTimeout: 45000,
  // Отключаем автоматическое подключение к корневому namespace
  forceNew: false
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  trustProxy: false, // Отключаем trust proxy для rate limiting
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Полностью отключаем CSP для отладки
}));
app.use(cors({
  origin: [
    "https://luggo.ru",
    "https://www.luggo.ru", 
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200
}));
app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Делаем io доступным в контроллерах
app.set('io', io);

// CORS middleware для статических файлов - более агрессивный подход
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Разрешаем все источники
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Статическая раздача файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', bidRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/executor', executorRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/news', newsRoutes);
app.use('/', seoRoutes);

// API info route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Luggo API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      bids: '/api/bids',
      messages: '/api/messages',
      reviews: '/api/reviews',
      users: '/api/users',
      news: '/api/news',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Socket.IO health check
app.get('/api/socket-health', (req, res) => {
  const connectedClients = io.engine.clientsCount;
  res.status(200).json({
    success: true,
    socketIO: {
      status: 'running',
      connectedClients,
      transports: ['websocket', 'polling'],
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173"
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Test static files
app.get('/api/test-static', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  const avatarsDir = path.join(uploadsDir, 'avatars');
  const vehiclesDir = path.join(uploadsDir, 'vehicles');
  
  const result = {
    uploadsExists: fs.existsSync(uploadsDir),
    avatarsExists: fs.existsSync(avatarsDir),
    vehiclesExists: fs.existsSync(vehiclesDir),
    avatarFiles: [],
    vehicleFiles: []
  };
  
  if (result.avatarsExists) {
    result.avatarFiles = fs.readdirSync(avatarsDir);
  }
  
  if (result.vehiclesExists) {
    result.vehicleFiles = fs.readdirSync(vehiclesDir);
  }
  
  res.json(result);
});

// API endpoint для получения изображений
app.get('/api/image/:type/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const { type, filename } = req.params;
  
  // Проверяем тип папки
  if (!['avatars', 'vehicles'].includes(type)) {
    return res.status(400).json({ error: 'Invalid image type' });
  }
  
  const imagePath = path.join(__dirname, 'uploads', type, filename);
  
  // Проверяем существование файла
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  // Устанавливаем CORS заголовки
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Определяем MIME тип
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  const mimeType = mimeTypes[ext] || 'image/jpeg';
  res.setHeader('Content-Type', mimeType);
  
  // Отправляем файл
  res.sendFile(imagePath);
});

// Socket.IO для чата
const userSockets = new Map(); // Хранилище socket'ов пользователей

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);
  
  // Регистрируем пользователя при подключении
  socket.on('registerUser', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log(`👤 Пользователь ${userId} зарегистрирован с socket ${socket.id}`);
  });
  
  socket.on('joinTask', (taskId) => {
    socket.join(`task_${taskId}`);
    console.log(`Пользователь ${socket.id} присоединился к чату задачи ${taskId}`);
  });

  socket.on('leaveTask', (taskId) => {
    socket.leave(`task_${taskId}`);
    console.log(`Пользователь ${socket.id} покинул чат задачи ${taskId}`);
  });

  socket.on('sendMessage', (data) => {
    socket.to(`task_${data.taskId}`).emit('newMessage', data);
  });

  socket.on('disconnect', () => {
    // Удаляем пользователя из хранилища при отключении
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`👤 Пользователь ${socket.userId} отключился`);
    }
    console.log('Пользователь отключился:', socket.id);
  });
});

// Делаем userSockets доступным в контроллерах
app.set('userSockets', userSockets);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Инициализация и запуск сервера
const startServer = async () => {
  const dbInitialized = await initializeDatabase();
  
  if (!dbInitialized) {
    console.error('❌ Не удалось инициализировать базу данных');
    process.exit(1);
  }

  // Запускаем Telegram бота если есть токен
  if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const { bot } = require('./src/bot/telegramBot');
      
      // ВРЕМЕННО: отключаем webhook для отладки
      console.log('🔧 ОТЛАДКА: Webhook код в server.js отключен');
      
      /* ЗАКОММЕНТИРОВАНО ДЛЯ ОТЛАДКИ:
      // Настройка webhook для продакшена
      if (process.env.NODE_ENV === 'production') {
        const WEBHOOK_URL = `${process.env.FRONTEND_URL}/webhook/telegram`;
        
        // Обработка webhook запросов (webhook устанавливается в telegramBot.js)
        app.use('/webhook/telegram', express.json(), (req, res) => {
          bot.processUpdate(req.body);
          res.sendStatus(200);
        });
        console.log('🔗 Webhook обработчик зарегистрирован: /webhook/telegram');
      }
      */
      
      console.log('✅ Telegram бот инициализирован');
    } catch (error) {
      console.error('❌ Ошибка запуска Telegram бота:', error);
    }
  } else {
    console.log('⚠️ TELEGRAM_BOT_TOKEN не установлен, бот не запущен');
  }

  server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    console.log(`🤖 Telegram режим: polling (отладка)`);
  });
};

startServer();

module.exports = { app, io }; 