#!/bin/bash

# =================================
# LUGGO PRODUCTION DEPLOYMENT SCRIPT
# =================================

set -e  # Остановить при любой ошибке

echo "🚀 Начинаем развертывание Luggo Production..."

# Переменные
PROJECT_DIR="/home/luggo/luggo"
BACKUP_DIR="/home/luggo/backups/$(date +%Y%m%d_%H%M%S)"
DB_NAME="luggo_prod"
DB_USER="luggo_user"
DB_PASS=$(openssl rand -base64 32)

echo "📁 Создание резервной копии..."
mkdir -p $BACKUP_DIR

# Остановка старых процессов
echo "⏹️ Остановка старых процессов..."
pm2 stop all || true
pm2 delete all || true

# Резервное копирование БД (если существует)
echo "💾 Резервное копирование базы данных..."
sudo -u postgres pg_dump luggo > $BACKUP_DIR/luggo_backup.sql 2>/dev/null || echo "Старая БД не найдена"

# Резервное копирование старого проекта
if [ -d "$PROJECT_DIR" ]; then
    echo "📦 Резервное копирование старого проекта..."
    cp -r $PROJECT_DIR $BACKUP_DIR/luggo_old
fi

# Удаление старой базы данных
echo "🗑️ Удаление старой базы данных..."
sudo -u postgres dropdb luggo 2>/dev/null || echo "База luggo не существует"
sudo -u postgres dropuser luggonew 2>/dev/null || echo "Пользователь luggonew не существует"
sudo -u postgres dropuser luggouser 2>/dev/null || echo "Пользователь luggouser не существует"

# Создание новой базы данных
echo "🔧 Создание новой базы данных..."
sudo -u postgres createdb $DB_NAME
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
sudo -u postgres psql -c "ALTER DATABASE $DB_NAME OWNER TO $DB_USER;"

echo "✅ База данных создана: $DB_NAME"
echo "✅ Пользователь создан: $DB_USER"
echo "🔑 Пароль: $DB_PASS"

# Очистка старого проекта
echo "🧹 Очистка старого проекта..."
rm -rf $PROJECT_DIR
mkdir -p $PROJECT_DIR

# Клонирование нового кода
echo "📥 Клонирование проекта..."
cd /home/luggo
git clone https://github.com/navodchik131/luggo.git
cd $PROJECT_DIR

# Установка зависимостей
echo "📦 Установка зависимостей backend..."
cd backend
npm install --production

# Создание .env файла
echo "⚙️ Создание конфигурации..."
cp ../deploy/production.env.template .env

# Замена значений в .env
sed -i "s/DB_NAME=luggo_prod/DB_NAME=$DB_NAME/" .env
sed -i "s/DB_USER=luggo_user/DB_USER=$DB_USER/" .env
sed -i "s/DB_PASSWORD=ЗАМЕНИТЕ_НА_СИЛЬНЫЙ_ПАРОЛЬ/DB_PASSWORD=$DB_PASS/" .env

# Генерация JWT секрета
JWT_SECRET=$(openssl rand -hex 32)
sed -i "s/JWT_SECRET=ЗАМЕНИТЕ_НА_СЛУЧАЙНУЮ_СТРОКУ_64_СИМВОЛА/JWT_SECRET=$JWT_SECRET/" .env

echo "⚙️ Конфигурация создана. Отредактируйте .env для добавления:"
echo "  - TELEGRAM_BOT_TOKEN"
echo "  - YOOKASSA ключей"
echo "  - EMAIL настроек"

# Создание директорий
mkdir -p uploads
mkdir -p logs

# Настройка nginx
echo "🌐 Настройка nginx..."
sudo cp ../deploy/nginx.conf /etc/nginx/sites-available/luggo.ru
sudo ln -sf /etc/nginx/sites-available/luggo.ru /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Запуск через PM2
echo "🚀 Запуск через PM2..."
pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo "🎉 Развертывание завершено успешно!"
echo ""
echo "📋 Информация:"
echo "  🌐 URL: https://luggo.ru"
echo "  🔧 Проект: $PROJECT_DIR"
echo "  💾 База: $DB_NAME"
echo "  👤 Пользователь БД: $DB_USER"
echo "  🔑 Пароль БД: $DB_PASS"
echo "  📁 Резервные копии: $BACKUP_DIR"
echo ""
echo "⚠️ Не забудьте:"
echo "  1. Отредактировать .env файл (TELEGRAM_BOT_TOKEN, YOOKASSA, EMAIL)"
echo "  2. Настроить SSL сертификат"
echo "  3. Перезапустить PM2: pm2 restart luggo-backend"
echo ""

# Проверка статуса
echo "📊 Статус сервисов:"
pm2 status
sudo systemctl status nginx --no-pager -l 