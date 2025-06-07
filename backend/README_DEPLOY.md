# 🚀 Быстрое развертывание Luggo на luggo.ru

## Автоматическое развертывание

```bash
# Сделать скрипт исполняемым
chmod +x deploy.sh

# Запустить развертывание
./deploy.sh
```

## Ручная настройка (первый раз)

### 1. Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Установка PM2
sudo npm install -g pm2

# Установка PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Создание пользователя базы данных
sudo -u postgres createuser --interactive luggo_user
sudo -u postgres createdb luggo_production -O luggo_user
```

### 2. Клонирование проекта
```bash
# Создание папки проекта
sudo mkdir -p /var/www/luggo
sudo chown $USER:$USER /var/www/luggo

# Клонирование
cd /var/www/luggo
git clone https://github.com/your-repo/luggo.git .
```

### 3. Настройка .env файла
```bash
cd /var/www/luggo/backend
cp env.example .env
nano .env
```

Важные настройки для .env:
```env
NODE_ENV=production
FRONTEND_URL=https://luggo.ru
DB_NAME=luggo_production
DB_USER=luggo_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_chars
TELEGRAM_BOT_TOKEN=7386777652:AAEihENq6fLJQ-uKorx_3fLF-2VYIQEZngc
```

### 4. Настройка SSL и Nginx
```bash
# Установка Nginx
sudo apt install -y nginx

# Установка Certbot для SSL
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d luggo.ru

# Настройка Nginx (см. PRODUCTION_SETUP.md)
```

### 5. Первый запуск
```bash
cd /var/www/luggo/backend
chmod +x deploy.sh
./deploy.sh
```

## Команды для управления

```bash
# Статус приложения
pm2 status

# Просмотр логов
pm2 logs luggo-backend

# Перезапуск
pm2 restart luggo-backend

# Остановка
pm2 stop luggo-backend

# Мониторинг ресурсов
pm2 monit
```

## Проверка работы Telegram уведомлений

1. ✅ Зайдите на https://luggo.ru
2. ✅ Создайте тестовую заявку
3. ✅ Проверьте логи: `pm2 logs luggo-backend`
4. ✅ Убедитесь что уведомление пришло в Telegram с кнопкой на https://luggo.ru/tasks/{id}

## Обновление кода

```bash
cd /var/www/luggo/backend
./deploy.sh
```

---

**🎯 Результат:** Полностью рабочий Luggo с Telegram уведомлениями на https://luggo.ru! 