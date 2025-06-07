# Luggo Backend - Настройка для разработки

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка конфигурации

Скопируйте файл `.env.example` в `.env` и настройте под ваше окружение:

```bash
cp env.example .env
```

### 3. Настройка базы данных PostgreSQL

Убедитесь что у вас установлен PostgreSQL и создана база данных:

```sql
CREATE DATABASE luggo_db;
```

### 4. Запуск сервера

#### Для Windows (PowerShell):
```powershell
# Режим разработки
.\scripts\start-dev.bat

# Продакшен режим
.\scripts\start-prod.bat
```

#### Для Windows (CMD):
```cmd
# Режим разработки
scripts\start-dev.bat

# Продакшен режим
scripts\start-prod.bat
```

#### Для Linux/Mac:
```bash
# Режим разработки
NODE_ENV=development node server.js

# Продакшен режим  
NODE_ENV=production node server.js
```

### 5. Конфигурации окружений

#### Development (разработка)
- База данных: `luggo_db` на localhost
- Порт: 5000
- Автосинхронизация: отключена
- Логирование: включено

#### Production (продакшен)
- База данных: берется из переменных окружения
- Автосинхронизация: отключена
- Логирование: отключено

## Основные эндпоинты

- `GET /api/subscription/plans` - Планы подписок
- `POST /api/subscription/payment` - Создание платежа
- `GET /api/subscription/status` - Статус подписки

## Структура проекта

```
src/
├── config/           # Конфигурации
├── models/           # Модели Sequelize
├── controllers/      # Контроллеры API
├── middleware/       # Middleware
├── routes/           # Маршруты
└── services/         # Бизнес-логика
```

## Troubleshooting

### Ошибка подключения к базе
- Проверьте что PostgreSQL запущен
- Убедитесь что база `luggo_db` создана
- Проверьте настройки в `.env` файле

### Ошибки SQL синтаксиса
- Автосинхронизация отключена для избежания конфликтов
- Используйте миграции для изменения схемы БД

### Telegram бот ошибки
- В режиме разработки ошибки бота не критичны
- Для тестирования бота нужен валидный TELEGRAM_BOT_TOKEN 