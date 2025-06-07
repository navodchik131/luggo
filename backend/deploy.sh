#!/bin/bash

# Скрипт развертывания Luggo на продакшене (luggo.ru)

echo "🚀 Развертывание Luggo на luggo.ru..."
echo "⚡ Конфигурация: PORT=3001, DB=luggo, USER=luggonew"

# Переменные
PROJECT_DIR="/home/luggo/luggo/"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Проверка существования папки проекта
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Папка проекта не найдена: $PROJECT_DIR"
    echo "📁 Создайте папку и клонируйте репозиторий:"
    echo "sudo mkdir -p $PROJECT_DIR"
    echo "sudo chown \$USER:\$USER $PROJECT_DIR"
    echo "cd $PROJECT_DIR && git clone https://github.com/your-repo/luggo.git ."
    exit 1
fi

cd $PROJECT_DIR

# Обновление кода
echo "📥 Обновление кода..."
git pull origin main

# Backend развертывание
echo "🔧 Настройка backend..."
cd $BACKEND_DIR

# Установка зависимостей
echo "📦 Установка зависимостей backend..."
npm install --production

# Создание папок для логов и uploads
mkdir -p logs
mkdir -p uploads/avatars
mkdir -p uploads/vehicles

# Установка прав доступа
chmod 755 uploads
chmod 755 uploads/avatars
chmod 755 uploads/vehicles

# Проверка .env файла
if [ ! -f ".env" ]; then
    echo "⚠️ Файл .env не найден!"
    echo "📝 Создайте файл .env на основе env.example"
    echo "Пример команды: cp env.example .env && nano .env"
    exit 1
fi

# Проверка и добавление Telegram токена
if ! grep -q "TELEGRAM_BOT_TOKEN" .env; then
    echo "📱 Добавляю токен Telegram бота..."
    echo "TELEGRAM_BOT_TOKEN=7386777652:AAEihENq6fLJQ-uKorx_3fLF-2VYIQEZngc" >> .env
    echo "✅ Токен Telegram бота добавлен"
else
    echo "✅ Токен Telegram бота уже настроен"
fi

# Проверка настроек порта
if grep -q "PORT=5000" .env; then
    echo "⚠️ Обнаружен порт 5000 в .env, меняю на 3001..."
    sed -i 's/PORT=5000/PORT=3001/g' .env
    echo "✅ Порт изменен на 3001"
fi

# Отображение ключевых настроек
echo "🔧 Текущие настройки:"
echo "   PORT: $(grep PORT .env | cut -d'=' -f2)"
echo "   NODE_ENV: $(grep NODE_ENV .env | cut -d'=' -f2)"
echo "   FRONTEND_URL: $(grep FRONTEND_URL .env | cut -d'=' -f2)"
echo "   DB_NAME: $(grep DB_NAME .env | cut -d'=' -f2)"
echo "   Telegram бот: $(if grep -q TELEGRAM_BOT_TOKEN .env; then echo "✅ Настроен"; else echo "❌ Не настроен"; fi)"

# Запуск миграций (если используются)
if [ -f "package.json" ] && grep -q "sequelize" package.json; then
    echo "🗄️ Запуск миграций базы данных..."
    npx sequelize-cli db:migrate --env production 2>/dev/null || echo "⚠️ Миграции не найдены или уже применены"
fi

# Остановка старого процесса
echo "🛑 Остановка текущего backend..."
pm2 stop luggo-backend 2>/dev/null || echo "Process not running"

# Запуск нового процесса
echo "🚀 Запуск backend в продакшене (порт 3001)..."
pm2 start ecosystem.config.js --env production

# Сохранение конфигурации PM2
pm2 save

# Frontend развертывание (если есть)
if [ -d "$FRONTEND_DIR" ]; then
    echo "🎨 Сборка frontend..."
    cd $FRONTEND_DIR
    
    # Установка зависимостей frontend
    npm install
    
    # Сборка для продакшена
    npm run build
    
    echo "✅ Frontend собран в $FRONTEND_DIR/dist"
fi

cd $BACKEND_DIR

# Проверка статуса
echo "📊 Статус приложения:"
pm2 status luggo-backend

# Проверка порта
echo ""
echo "🌐 Проверка сетевых соединений:"
netstat -tulnp | grep :3001 || echo "⚠️ Порт 3001 не прослушивается"

# Отображение логов
echo ""
echo "📋 Последние логи:"
pm2 logs luggo-backend --lines 10

echo ""
echo "✅ Развертывание завершено!"
echo "🌐 Сайт доступен по адресу: https://luggo.ru"
echo "🔌 Backend работает на порту: 3001"
echo "📊 Мониторинг: pm2 monit"
echo "📋 Логи: pm2 logs luggo-backend"
echo "🔄 Перезапуск: pm2 restart luggo-backend"

# Проверка Telegram бота
echo ""
echo "🤖 Проверка Telegram бота..."
if grep -q "TELEGRAM_BOT_TOKEN" .env; then
    echo "✅ Токен Telegram бота найден в .env"
    echo "🔗 Webhook URL: https://luggo.ru/webhook/telegram"
    echo "📱 Протестируйте создание заявки для проверки уведомлений"
    
    # Проверка webhook статуса
    echo "🔍 Проверка webhook статуса..."
    curl -s -X POST "https://api.telegram.org/bot7386777652:AAEihENq6fLJQ-uKorx_3fLF-2VYIQEZngc/getWebhookInfo" | \
    python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"URL: {data['result'].get('url', 'не установлен')}\"); print(f\"Статус: {'✅ Активен' if data['result'].get('url') else '❌ Не активен'}\")" 2>/dev/null || \
    echo "⚠️ Не удалось проверить webhook (проверьте после полного запуска)"
else
    echo "⚠️ TELEGRAM_BOT_TOKEN не найден в .env файле"
fi

echo ""
echo "🎯 Следующие шаги:"
echo "1. Проверьте логи: pm2 logs luggo-backend"
echo "2. Зайдите в Telegram бот и авторизуйтесь"
echo "3. Создайте тестовую заявку на сайте"
echo "4. Проверьте что пришло уведомление" 