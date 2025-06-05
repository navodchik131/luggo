# ⚡ Быстрый старт для России

## 🎯 Цель: запустить Luggo за 2-3 часа

### 📋 Что понадобится:
- [ ] Российская банковская карта (~2500₽/год)
- [ ] Базовые знания SSH/Linux (или готовность учиться)
- [ ] 2-3 часа времени

## 🚀 План действий

### ⏰ 15 минут: Заказываем сервер
1. Идите на **timeweb.com**
2. Регистрируйтесь
3. Заказывайте VPS:
   - **Конфигурация**: SSD-1 (1GB RAM, 15GB SSD) - 190₽/мес
   - **ОС**: Ubuntu 22.04 LTS
   - **Локация**: Москва
4. Оплачиваете российской картой
5. Получаете SSH доступ на email

### ⏰ 10 минут: Покупаем домен  
1. Идите на **reg.ru**
2. Ищите свободный домен (.ru дешевле)
3. Покупаете (от 199₽/год)
4. В панели DNS добавляете A-запись: @ → IP VPS
5. Ждете 10-60 минут пока DNS обновится

### ⏰ 60 минут: Настраиваем сервер
```bash
# 1. Подключаемся к серверу
ssh root@ваш-ip-адрес

# 2. Устанавливаем все необходимое (5 минут)
apt update && apt upgrade -y
apt install -y nginx nodejs npm postgresql postgresql-contrib git certbot python3-certbot-nginx

# 3. Настраиваем базу данных (5 минут)
sudo -u postgres createdb luggo
sudo -u postgres createuser -P luggouser
# Вводим пароль для БД

# 4. Создаем пользователя для приложения (2 минуты)
adduser luggo
usermod -aG sudo luggo
su - luggo
```

### ⏰ 30 минут: Деплоим приложение
```bash
# 1. Клонируем код (2 минуты)
git clone https://github.com/navodchik131/luggo.git
cd luggo

# 2. Настраиваем бэкенд (10 минут)
cd backend
npm install

# Создаем .env файл
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://luggouser:ваш-пароль@localhost:5432/luggo
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://ваш-домен.ru
FRONTEND_URL=https://ваш-домен.ru
EOF

# Запускаем бэкенд
sudo npm install -g pm2
pm2 start server.js --name luggo-backend
pm2 startup
pm2 save

# 3. Собираем фронтенд (10 минут)
cd ../frontend
npm install

# Создаем конфиг для продакшена
cat > .env.production << EOF
VITE_API_URL=https://ваш-домен.ru/api
VITE_APP_NAME=Luggo
EOF

npm run build
```

### ⏰ 20 минут: Настраиваем Nginx
```bash
# Создаем конфиг Nginx
sudo cat > /etc/nginx/sites-available/luggo << 'EOF'
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    location / {
        root /home/luggo/luggo/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /home/luggo/luggo/backend/uploads;
    }
}
EOF

# Активируем конфиг
sudo ln -s /etc/nginx/sites-available/luggo /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### ⏰ 10 минут: Получаем SSL
```bash
# Автоматически получаем SSL сертификат
sudo certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Настраиваем автообновление
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### ⏰ 5 минут: Проверяем работу
1. Откройте https://ваш-домен.ru
2. Попробуйте зарегистрироваться
3. Создайте тестовую заявку
4. Проверьте что все работает

## 🔧 Готовые команды (копируй-вставляй)

### Полная установка одной командой:
```bash
#!/bin/bash
# Сохраните как install.sh и запустите: bash install.sh

echo "🚀 Устанавливаем Luggo на сервер..."

# Переменные (ИЗМЕНИТЕ НА СВОИ!)
DOMAIN="ваш-домен.ru"
DB_PASSWORD="сложный-пароль-123"
GITHUB_REPO="https://github.com/navodchik131/luggo.git"

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем пакеты
apt install -y nginx nodejs npm postgresql postgresql-contrib git certbot python3-certbot-nginx

# Настраиваем PostgreSQL
sudo -u postgres psql -c "CREATE DATABASE luggo;"
sudo -u postgres psql -c "CREATE USER luggouser WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE luggo TO luggouser;"

# Создаем пользователя
adduser --disabled-password --gecos "" luggo
usermod -aG sudo luggo

# Переходим к пользователю luggo
sudo -u luggo bash << EOF
cd /home/luggo

# Клонируем проект
git clone $GITHUB_REPO
cd luggo

# Настраиваем бэкенд
cd backend
npm install

# Создаем .env
cat > .env << ENVEOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://luggouser:$DB_PASSWORD@localhost:5432/luggo
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN=https://$DOMAIN
FRONTEND_URL=https://$DOMAIN
ENVEOF

# Запускаем PM2
sudo npm install -g pm2
pm2 start server.js --name luggo-backend
pm2 startup
pm2 save

# Собираем фронтенд
cd ../frontend
npm install
echo "VITE_API_URL=https://$DOMAIN/api" > .env.production
npm run build
EOF

# Настраиваем Nginx
cat > /etc/nginx/sites-available/luggo << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        root /home/luggo/luggo/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads {
        alias /home/luggo/luggo/backend/uploads;
    }
}
EOF

ln -s /etc/nginx/sites-available/luggo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Получаем SSL
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

echo "✅ Установка завершена! Откройте https://$DOMAIN"
```

## 💡 Экономный вариант (GitHub Pages + VPS API)

Если хотите сэкономить ~1000₽/год:

### Фронтенд на GitHub Pages (бесплатно):
1. В настройках GitHub репозитория включите Pages
2. Выберите ветку `main`, папку `/frontend/dist`
3. Получите URL типа `username.github.io/luggo`

### Бэкенд на минимальном VPS:
- FirstVPS: 150₽/мес (512MB RAM)
- Только API без фронтенда
- Домен не нужен для API

### CORS настройка:
```env
# В .env бэкенда
CORS_ORIGIN=https://username.github.io
```

## 🆘 Быстрая помощь

### Не работает сайт:
```bash
# Проверьте статус сервисов
sudo systemctl status nginx
pm2 status
sudo systemctl status postgresql

# Посмотрите логи
sudo tail -f /var/log/nginx/error.log
pm2 logs luggo-backend
```

### Не подключается к базе:
```bash
# Проверьте подключение
sudo -u luggouser psql -d luggo -h localhost

# Если не работает, пересоздайте пользователя
sudo -u postgres psql -c "DROP USER IF EXISTS luggouser;"
sudo -u postgres psql -c "CREATE USER luggouser WITH PASSWORD 'новый-пароль';"
```

### SSL не работает:
```bash
# Повторите получение сертификата
sudo certbot --nginx -d ваш-домен.ru --force-renewal
```

## 📞 Помощь 24/7

- **Timeweb**: Telegram @timeweb_hosting
- **Reg.ru**: 8-800-505-1688
- **Общие вопросы**: форумы web-мастеров

Готов лично помочь с любым этапом! 🚀 