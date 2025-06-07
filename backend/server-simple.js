const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
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

// Настройка trust proxy для работы за nginx
app.set('trust proxy', true);

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
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
    message: 'Luggo API v1.0 (Simple)',
    version: '1.0.0',
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
      
      // Настройка webhook для продакшена
      if (process.env.NODE_ENV === 'production') {
        // Обработка webhook запросов
        app.use('/webhook/telegram', express.json(), (req, res) => {
          bot.processUpdate(req.body);
          res.sendStatus(200);
        });
        console.log('🔗 Webhook обработчик зарегистрирован: /webhook/telegram');
      }
      
      console.log('✅ Telegram бот инициализирован');
    } catch (error) {
      console.error('❌ Ошибка запуска Telegram бота:', error);
    }
  } else {
    console.log('⚠️ TELEGRAM_BOT_TOKEN не установлен, бот не запущен');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT} (ПРОСТАЯ ВЕРСИЯ)`);
    console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
    console.log(`🤖 Telegram режим: ${process.env.NODE_ENV === 'production' ? 'webhook' : 'polling'}`);
  });
};

startServer();

module.exports = { app }; 