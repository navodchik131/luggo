# 🇷🇺 Деплой Luggo для России

## 📋 Рекомендуемая архитектура

### Вариант 1: Российские сервисы (простой)
- **VPS**: Timeweb, Beget, Reg.ru
- **Домен**: .ru, .рф через Reg.ru
- **База данных**: PostgreSQL на том же VPS
- **SSL**: Let's Encrypt (бесплатно)

### Вариант 2: Гибридный (оптимальный)
- **Фронтенд**: GitHub Pages (бесплатно) или Netlify
- **Бэкенд**: VPS в России (Timeweb/Beget)
- **Домен**: .ru или .com через Reg.ru
- **База данных**: PostgreSQL на VPS

### Вариант 3: Полностью облачный
- **Все**: Yandex Cloud или VK Cloud
- **Домен**: через Reg.ru или Timeweb
- **Оплата**: российской картой

## 🏢 Российские хостинги

### 1. Timeweb (рекомендуется)
- **Сайт**: timeweb.com
- **VPS**: от 190₽/мес (1GB RAM, 10GB SSD)
- **Оплата**: российские карты, СБП
- **Особенности**: простая панель, автобэкапы

### 2. Beget
- **Сайт**: beget.com  
- **VPS**: от 250₽/мес (1GB RAM, 20GB SSD)
- **Оплата**: российские карты
- **Особенности**: хорошая поддержка

### 3. Reg.ru
- **Сайт**: reg.ru
- **VPS**: от 300₽/мес (1GB RAM, 15GB SSD)
- **Оплата**: все российские способы
- **Особенности**: домены + хостинг в одном месте

### 4. FirstVPS
- **Сайт**: firstvps.ru
- **VPS**: от 150₽/мес (512MB RAM, 10GB SSD)
- **Оплата**: российские карты, криптовалюты
- **Особенности**: дешево, подходит для начала

## 🛠 Настройка VPS (пошагово)

### Шаг 1: Заказ VPS
1. Выберите провайдера (рекомендую Timeweb)
2. Закажите VPS:
   - OS: Ubuntu 22.04 LTS
   - RAM: минимум 1GB (лучше 2GB)
   - Диск: минимум 20GB SSD
   - Локация: Москва или СПб

### Шаг 2: Первичная настройка
```bash
# Подключение по SSH
ssh root@your-server-ip

# Обновление системы
apt update && apt upgrade -y

# Установка необходимых пакетов
apt install -y nginx nodejs npm postgresql postgresql-contrib git certbot python3-certbot-nginx

# Создание пользователя для приложения
adduser luggo
usermod -aG sudo luggo
su - luggo
```

### Шаг 3: Настройка PostgreSQL
```bash
# Подключение к PostgreSQL
sudo -u postgres psql

# Создание базы данных
CREATE DATABASE luggo;
CREATE USER luggouser WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE luggo TO luggouser;
\q

# Настройка подключения
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Добавьте строку: local luggo luggouser md5

sudo systemctl restart postgresql
```

### Шаг 4: Деплой бэкенда
```bash
# Клонирование репозитория
git clone https://github.com/your-username/luggo.git
cd luggo/backend

# Установка зависимостей
npm install

# Создание .env файла
nano .env
```

Содержимое .env:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://luggouser:your-strong-password@localhost:5432/luggo
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.ru
FRONTEND_URL=https://yourdomain.ru
```

```bash
# Запуск миграций (если есть)
npm run migrate

# Установка PM2 для управления процессами
sudo npm install -g pm2

# Запуск приложения
pm2 start server.js --name "luggo-backend"
pm2 startup
pm2 save
```

### Шаг 5: Настройка Nginx
```bash
sudo nano /etc/nginx/sites-available/luggo
```

Конфигурация Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.ru www.yourdomain.ru;

    # Фронтенд
    location / {
        root /home/luggo/luggo/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статики
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы загрузок
    location /uploads {
        alias /home/luggo/luggo/backend/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/luggo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Шаг 6: Сборка и деплой фронтенда
```bash
cd /home/luggo/luggo/frontend

# Создание .env для продакшена
nano .env.production
```

Содержимое .env.production:
```env
VITE_API_URL=https://yourdomain.ru/api
VITE_APP_NAME=Luggo
VITE_APP_VERSION=1.0.0
```

```bash
# Сборка фронтенда
npm install
npm run build

# Проверка что файлы собрались
ls -la dist/
```

### Шаг 7: Настройка SSL
```bash
# Получение SSL сертификата
sudo certbot --nginx -d yourdomain.ru -d www.yourdomain.ru

# Автообновление сертификата
sudo crontab -e
# Добавьте строку: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🌐 Покупка домена в России

### Reg.ru (рекомендуется)
1. Перейдите на reg.ru
2. Найдите свободный домен (например: luggo.ru)
3. Оплатите российской картой
4. В панели управления настройте DNS:
   - A запись: @ → IP вашего VPS
   - A запись: www → IP вашего VPS

### Альтернативы
- **Timeweb**: если покупаете VPS у них
- **Beget**: домены + хостинг
- **Nic.ru**: крупнейший регистратор .ru

## 💰 Стоимость в рублях

### Минимальная конфигурация:
- VPS Timeweb (1GB): 190₽/мес = 2280₽/год
- Домен .ru: 199₽/год
- SSL: бесплатно
- **Итого: ~2500₽/год**

### Продвинутая конфигурация:
- VPS Timeweb (2GB): 350₽/мес = 4200₽/год  
- Домен .com: 600₽/год
- Резервные копии: 50₽/мес = 600₽/год
- **Итого: ~5400₽/год**

## 🚀 Автоматизация обновлений

### Простой скрипт деплоя
```bash
nano /home/luggo/deploy.sh
```

Содержимое скрипта:
```bash
#!/bin/bash
echo "🚀 Начинаем обновление Luggo..."

cd /home/luggo/luggo

# Получаем изменения из Git
git pull origin main

# Обновляем бэкенд
cd backend
npm install
pm2 restart luggo-backend

# Обновляем фронтенд  
cd ../frontend
npm install
npm run build

echo "✅ Обновление завершено!"
```

```bash
chmod +x /home/luggo/deploy.sh

# Запуск обновления
./deploy.sh
```

### Webhook для автообновлений (продвинутый)
```bash
# Установка webhook сервера
sudo npm install -g webhook

# Создание конфигурации
nano /home/luggo/webhook.json
```

```json
[
  {
    "id": "luggo-deploy",
    "execute-command": "/home/luggo/deploy.sh",
    "command-working-directory": "/home/luggo",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "your-webhook-secret",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
```

## 🔧 Альтернативные решения

### GitHub Pages + VPS API
1. **Фронтенд**: бесплатно на GitHub Pages
2. **Бэкенд**: VPS в России
3. **Плюсы**: экономия, простота
4. **Минусы**: могут быть проблемы с доступом к GitHub

### Yandex Cloud
1. **Compute Cloud**: от 400₽/мес
2. **Managed PostgreSQL**: от 800₽/мес  
3. **Object Storage**: от 50₽/мес
4. **Плюсы**: российский, надежный
5. **Минусы**: дороже VPS

### VK Cloud (бывший MCS)
1. **Виртуальные машины**: от 300₽/мес
2. **DBaaS PostgreSQL**: от 600₽/мес
3. **Плюсы**: российский, хорошая поддержка
4. **Минусы**: нужна регистрация ИП/ООО

## 🛡️ Безопасность в России

### Firewall настройка
```bash
# Настройка ufw
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw deny 3001  # Закрываем прямой доступ к API
```

### Мониторинг
```bash
# Установка мониторинга
sudo apt install htop iotop

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Логи приложения
pm2 logs luggo-backend
```

### Резервные копии
```bash
# Скрипт бэкапа БД
nano /home/luggo/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump luggo > /home/luggo/backups/luggo_$DATE.sql
find /home/luggo/backups -name "*.sql" -mtime +7 -delete
```

```bash
# Автоматический бэкап каждый день в 3:00
crontab -e
# Добавьте: 0 3 * * * /home/luggo/backup.sh
```

## 📞 Поддержка

При проблемах с российскими хостингами:
- **Timeweb**: отличная поддержка в Telegram
- **Beget**: быстрый ответ через тикеты  
- **Reg.ru**: телефон и чат

Готов помочь с настройкой любого из вариантов! 🇷🇺 