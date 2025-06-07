# Настройка Luggo на продакшене (luggo.ru)

## 🔧 Переменные окружения для продакшена

Обновите файл `.env` на сервере со следующими настройками:

```bash
# Server Configuration
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://luggo.ru
CORS_ORIGIN=https://luggo.ru

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=luggo
DB_USER=luggonew
DB_PASSWORD=luggo123

# JWT Configuration
JWT_SECRET=luggo-super-secret-jwt-key-2024-very-long-and-secure
JWT_EXPIRE=7d

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=10

# Telegram Bot Configuration (ДОБАВИТЬ!)
TELEGRAM_BOT_TOKEN=7386777652:AAEihENq6fLJQ-uKorx_3fLF-2VYIQEZngc

# Email Configuration (опционально)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@luggo.ru
# EMAIL_PASS=your_app_password
```

## 🤖 Добавление Telegram бота к существующему серверу

### 1. Добавить токен в .env файл
```bash
# Подключиться к серверу
ssh username@luggo.ru

# Перейти в папку backend
cd /home/luggo/luggo/backend

# Создать резервную копию .env
cp .env .env.backup

# Добавить токен Telegram бота
echo "TELEGRAM_BOT_TOKEN=7386777652:AAEihENq6fLJQ-uKorx_3fLF-2VYIQEZngc" >> .env

# Проверить что токен добавился
grep TELEGRAM .env
```

### 2. Обновить код до последней версии
```bash
# Остановить приложение
pm2 stop luggo-backend

# Обновить код
git pull origin main

# Установить зависимости (если есть новые)
npm install --production

# Запустить приложение
pm2 start luggo-backend

# Проверить статус
pm2 status
```

### 3. Обновить PM2 конфигурацию под реальный порт
```bash
# Обновить ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'luggo-backend',
    script: 'server.js',
    cwd: '/home/luggo/luggo/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3001,
      FRONTEND_URL: 'http://localhost:5173'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      FRONTEND_URL: 'https://luggo.ru'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF
```

### 4. Проверить Nginx конфигурацию
Убедитесь что Nginx проксирует на правильный порт:

```nginx
# В /etc/nginx/sites-available/luggo.ru
location /api/ {
    proxy_pass http://localhost:3001;  # Порт 3001!
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Telegram webhook
location /webhook/telegram {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 5. Создать миграцию для таблицы telegram_users
```bash
# Если таблица telegram_users не существует, создать миграцию
cat > migrations/create_telegram_users.sql << 'EOF'
CREATE TABLE IF NOT EXISTS telegram_users (
    id SERIAL PRIMARY KEY,
    "telegramId" VARCHAR(255) UNIQUE NOT NULL,
    "telegramUsername" VARCHAR(255),
    "telegramFirstName" VARCHAR(255),
    "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
    "isActive" BOOLEAN DEFAULT true,
    "subscribedCategories" TEXT[] DEFAULT '{}',
    "lastActiveAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS telegram_users_telegram_id_idx ON telegram_users("telegramId");
CREATE INDEX IF NOT EXISTS telegram_users_user_id_idx ON telegram_users("userId");
EOF

# Выполнить миграцию (если нужно)
# psql -h localhost -U luggonew -d luggo -f migrations/create_telegram_users.sql
```

## 🚀 Быстрое развертывание с реальными настройками

```bash
# Скачать обновленный deploy.sh
curl -o deploy.sh https://raw.githubusercontent.com/your-repo/luggo/main/backend/deploy.sh
chmod +x deploy.sh

# Запустить развертывание
./deploy.sh
```

## 📊 Проверка работы Telegram бота

```bash
# Проверить что токен добавлен
grep TELEGRAM_BOT_TOKEN .env

# Проверить логи при запуске
pm2 logs luggo-backend --lines 20

# Должны увидеть:
# ✅ Telegram webhook установлен: https://luggo.ru/webhook/telegram
# ✅ Telegram бот запущен
# 🚀 Сервер запущен на порту 3001
```

## 🎯 Тестирование уведомлений

1. ✅ Зайдите на https://luggo.ru
2. ✅ Авторизуйтесь в Telegram боте @luggo_notifications_bot
3. ✅ Выберите категории уведомлений
4. ✅ Создайте тестовую заявку на сайте
5. ✅ Проверьте что уведомление пришло с кнопкой на заявку

## 🔧 Команды для отладки

```bash
# Статус приложения
pm2 status luggo-backend

# Логи в реальном времени
pm2 logs luggo-backend --lines 0

# Перезапуск после изменений
pm2 restart luggo-backend

# Проверка webhook Telegram
curl -X POST "https://api.telegram.org/bot7386777652:AAEihENq6fLJQ-uKorx_3fLF-2VYIQEZngc/getWebhookInfo"
```

---

**⚠️ Важно:** Порт изменен с 5000 на **3001** в соответствии с реальной конфигурацией сервера! 