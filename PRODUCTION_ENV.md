# 🔧 Переменные окружения для продакшена

## 📋 Backend (Railway)

Добавьте эти переменные в Railway Dashboard → Project → Variables:

```env
# Основные настройки
NODE_ENV=production
PORT=3001

# База данных (Railway автоматически создаст)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT (ОБЯЗАТЕЛЬНО смените на свой!)
JWT_SECRET=luggo-production-secret-key-2024-change-this-to-something-unique-and-long
JWT_EXPIRES_IN=7d

# CORS (замените на ваш домен фронтенда)
CORS_ORIGIN=https://your-app-name.vercel.app
FRONTEND_URL=https://your-app-name.vercel.app

# Если планируете загрузку файлов на Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Если планируете email уведомления
EMAIL_FROM=noreply@yourdomain.com
SENDGRID_API_KEY=your-sendgrid-key
```

## 🎨 Frontend (Vercel)

Добавьте эти переменные в Vercel Dashboard → Project → Settings → Environment Variables:

```env
# API URL (замените на ваш домен Railway)
VITE_API_URL=https://your-backend-name.railway.app/api

# Основные настройки приложения
VITE_APP_NAME=Luggo
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Если используете аналитику
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_YANDEX_METRICA_ID=12345678
```

## 🔗 Последовательность настройки:

### 1. Сначала деплой бэкенда на Railway:
- Получите URL типа: `https://luggo-backend-production-a1b2.railway.app`
- Добавьте `/api` в конце для VITE_API_URL

### 2. Затем деплой фронтенда на Vercel:
- Получите URL типа: `https://luggo-frontend.vercel.app`
- Обновите CORS_ORIGIN в Railway на этот URL

### 3. После успешного деплоя обоих:
- Протестируйте регистрацию/авторизацию
- Проверьте создание заявок
- Убедитесь что API доступно

## 🛡️ Безопасность:

### JWT_SECRET генерация:
```bash
# В терминале сгенерируйте случайный ключ:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Проверка CORS:
- Убедитесь что CORS_ORIGIN точно совпадает с доменом фронтенда
- Никаких лишних слешей в конце
- Протокол https:// обязателен в продакшене

### Проверка переменных:
```bash
# В Railway консоли можете проверить:
echo $DATABASE_URL
echo $JWT_SECRET
echo $CORS_ORIGIN
```

## 🔍 Отладка проблем:

### Если фронтенд не может подключиться к API:
1. Проверьте VITE_API_URL - должен заканчиваться на `/api`
2. Проверьте CORS_ORIGIN в бэкенде
3. Убедитесь что бэкенд запустился без ошибок (Railway Logs)

### Если ошибки базы данных:
1. Убедитесь что PostgreSQL создана в Railway
2. Проверьте DATABASE_URL в переменных
3. Посмотрите логи миграций

### Если ошибки авторизации:
1. Проверьте JWT_SECRET - должен быть одинаковый везде
2. Убедитесь что cookies передаются (credentials: true)

## 📱 Тестирование продакшена:

### Checklist после деплоя:
- [ ] Главная страница загружается
- [ ] Регистрация работает
- [ ] Авторизация работает
- [ ] Создание заявки работает
- [ ] Отклики работают
- [ ] Чат работает (если реализован)
- [ ] Загрузка аватаров работает
- [ ] Все API endpoints отвечают

### API Health Check:
```bash
curl https://your-backend.railway.app/api/health
# Должен вернуть: {"success":true,"status":"OK",...}
```

### Frontend Check:
```bash
curl https://your-frontend.vercel.app
# Должен вернуть HTML страницу
``` 