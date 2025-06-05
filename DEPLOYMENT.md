# 🚀 Инструкция по деплою платформы Luggo

## 📋 Обзор архитектуры

- **Фронтенд**: Vercel (React + Vite)
- **Бэкенд**: Railway (Node.js + Express)
- **База данных**: PostgreSQL на Railway
- **Домен**: Cloudflare или любой регистратор

## 🛠 Подготовка к деплою

### 1. Создание файлов переменных окружения

#### Backend (.env.example):
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/luggo

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# File Upload (если планируете)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env.example):
```env
VITE_API_URL=https://your-backend-domain.railway.app/api
VITE_APP_NAME=Luggo
VITE_APP_VERSION=1.0.0
```

### 2. Подготовка скриптов деплоя

#### Backend (package.json) - добавить:
```json
{
  "scripts": {
    "build": "npm install",
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "node scripts/migrate.js"
  }
}
```

#### Frontend - уже готово (есть build скрипт)

## 🌐 Деплой бэкенда на Railway

### Шаг 1: Регистрация на Railway
1. Идите на https://railway.app
2. Зарегистрируйтесь через GitHub
3. Подтвердите аккаунт

### Шаг 2: Создание проекта
1. Нажмите "New Project"
2. Выберите "Deploy from GitHub repo"
3. Подключите ваш GitHub аккаунт
4. Выберите репозиторий с проектом

### Шаг 3: Настройка бэкенда
1. Railway автоматически обнаружит Node.js проект
2. Перейдите в Settings проекта
3. В разделе "Environment" добавьте переменные:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=luggo-super-secret-key-2024-min-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app.vercel.app
```

### Шаг 4: Добавление PostgreSQL
1. В проекте нажмите "+" → "Database" → "PostgreSQL"
2. Railway автоматически создаст базу и переменную DATABASE_URL
3. Скопируйте DATABASE_URL из переменных окружения

### Шаг 5: Настройка деплоя
1. В Settings → "Build & Deploy":
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `/backend`

## 🎨 Деплой фронтенда на Vercel

### Шаг 1: Регистрация на Vercel
1. Идите на https://vercel.com
2. Зарегистрируйтесь через GitHub
3. Подтвердите аккаунт

### Шаг 2: Импорт проекта
1. На дашборде нажмите "New Project"
2. Выберите ваш репозиторий
3. В настройках укажите:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Шаг 3: Настройка переменных окружения
В настройках проекта добавьте:
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_APP_NAME=Luggo
VITE_APP_VERSION=1.0.0
```

## 🔗 Настройка домена

### Вариант 1: Поддомены Railway/Vercel (бесплатно)
- Бэкенд: `your-app-backend.railway.app`
- Фронтенд: `your-app.vercel.app`

### Вариант 2: Собственный домен

#### Покупка домена:
1. Выберите регистратора (Cloudflare, Namecheap, Reg.ru)
2. Купите домен (например: `luggo.com`)

#### Настройка DNS:
1. В панели управления доменом:
   - A запись: `@` → IP фронтенда (Vercel предоставит)
   - CNAME: `api` → адрес Railway бэкенда
   - CNAME: `www` → адрес Vercel фронтенда

2. В Vercel:
   - Project Settings → Domains
   - Добавить `luggo.com` и `www.luggo.com`

3. В Railway:
   - Project Settings → Domains
   - Добавить `api.luggo.com`

## 🔄 Настройка CI/CD (автоматическое обновление)

### GitHub Actions (рекомендуется)

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Railway
      uses: railway/action@v1
      with:
        token: ${{ secrets.RAILWAY_TOKEN }}
        service: backend

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Настройка секретов GitHub:
1. В репозитории: Settings → Secrets and variables → Actions
2. Добавьте:
   - `RAILWAY_TOKEN` (из Railway Dashboard → Account → Tokens)
   - `VERCEL_TOKEN` (из Vercel Dashboard → Settings → Tokens)
   - `VERCEL_PROJECT_ID` (из настроек проекта Vercel)

## 📊 Мониторинг и логи

### Railway:
- Логи: Project → Deployments → View Logs
- Метрики: Project → Metrics
- Алерты: можно настроить в Settings

### Vercel:
- Аналитика: Project → Analytics
- Логи функций: Functions → View Function Logs

## 🛡️ Безопасность в продакшене

### 1. Переменные окружения:
- Используйте сложные JWT_SECRET (мин 32 символа)
- Ограничьте CORS_ORIGIN только вашим доменом
- Никогда не коммитьте .env файлы

### 2. HTTPS:
- Railway и Vercel автоматически предоставляют SSL
- При собственном домене убедитесь в наличии сертификата

### 3. Ограничения API:
```javascript
// В backend добавьте rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов с IP
  message: 'Слишком много запросов, попробуйте позже'
});

app.use('/api/', limiter);
```

## 🔧 Обновление продакшена

### Автоматическое (через GitHub):
1. Делайте изменения в ветке `develop`
2. Создавайте Pull Request в `main`
3. После мерджа автоматически деплоится

### Ручное обновление:

#### Railway:
1. Перейдите в проект
2. Deployments → Redeploy

#### Vercel:
1. Перейдите в проект  
2. Deployments → Redeploy

## 📈 Масштабирование

### При росте нагрузки:

#### Railway:
- Upgrade план (больше CPU/RAM)
- Добавить Redis для кэширования
- Настроить load balancer

#### База данных:
- Увеличить план PostgreSQL
- Настроить connection pooling
- Добавить индексы для часто используемых запросов

## 💰 Примерная стоимость

### Стартовая (до 1000 пользователей):
- Railway: $5-10/месяц
- Vercel: бесплатно
- Домен: $10-15/год
- **Итого: ~$60-120/год**

### При росте (до 10000 пользователей):
- Railway: $20-50/месяц  
- Vercel Pro: $20/месяц
- **Итого: ~$480-840/год**

## 🚀 Процесс деплоя (пошагово)

### 1. Подготовка (1-2 часа):
- [ ] Создать аккаунты Railway + Vercel
- [ ] Настроить переменные окружения
- [ ] Купить домен (опционально)

### 2. Деплой бэкенда (30 минут):
- [ ] Подключить репозиторий к Railway
- [ ] Настроить PostgreSQL
- [ ] Добавить переменные окружения
- [ ] Проверить работу API

### 3. Деплой фронтенда (15 минут):
- [ ] Подключить репозиторий к Vercel
- [ ] Настроить переменные окружения
- [ ] Проверить работу сайта

### 4. Настройка домена (1 час):
- [ ] Настроить DNS записи
- [ ] Добавить домены в Vercel/Railway
- [ ] Проверить SSL сертификаты

### 5. Настройка CI/CD (30 минут):
- [ ] Создать GitHub Actions
- [ ] Добавить секреты
- [ ] Протестировать автодеплой

## 🆘 Частые проблемы и решения

### CORS ошибки:
```javascript
// backend/src/config/cors.js
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
```

### Проблемы с базой данных:
- Проверьте DATABASE_URL
- Убедитесь что миграции выполнены
- Проверьте подключение в логах Railway

### Медленная загрузка:
- Включите gzip сжатие
- Оптимизируйте изображения
- Используйте CDN для статики

Готов помочь с любым этапом деплоя! 🚀 

## 🏗️ Настройка GitHub репозитория

### 1. Создание репозитория
Ваш репозиторий уже создан: https://github.com/navodchik131/luggo.git 