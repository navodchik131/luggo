# Настройка PostgreSQL для Luggo

## Установка PostgreSQL

### Windows
1. Скачайте PostgreSQL с официального сайта: https://www.postgresql.org/download/windows/
2. Запустите установщик и следуйте инструкциям
3. При установке запомните пароль для пользователя `postgres`
4. По умолчанию порт: `5432`

### macOS
```bash
# Через Homebrew
brew install postgresql
brew services start postgresql

# Создание пользователя postgres (если нужно)
createuser -s postgres
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Запуск сервиса
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Установка пароля для пользователя postgres
sudo -u postgres psql
\password postgres
\q
```

## Настройка базы данных

### Способ 1: Через командную строку PostgreSQL

1. Подключитесь к PostgreSQL:
```bash
psql -U postgres -h localhost
```

2. Создайте базу данных:
```sql
CREATE DATABASE luggo_db OWNER postgres;
```

3. Выйдите из psql:
```sql
\q
```

### Способ 2: Через SQL скрипт

1. Выполните SQL скрипт:
```bash
psql -U postgres -h localhost -f scripts/setup-db.sql
```

### Способ 3: Через pgAdmin (графический интерфейс)

1. Откройте pgAdmin
2. Подключитесь к серверу PostgreSQL
3. Щелкните правой кнопкой на "Databases" → "Create" → "Database"
4. Введите имя: `luggo_db`
5. Владелец: `postgres`
6. Нажмите "Save"

## Настройка переменных окружения

1. Скопируйте файл `env.example` в `.env`:
```bash
cd backend
cp env.example .env
```

2. Отредактируйте файл `.env` при необходимости:
```env
# Основные настройки БД
DB_HOST=localhost
DB_PORT=5432
DB_NAME=luggo_db
DB_USER=postgres
DB_PASSWORD=postgres  # Ваш пароль PostgreSQL

# JWT секрет (обязательно измените в продакшене!)
JWT_SECRET=luggo_super_secret_jwt_key_2025_change_in_production
```

## Проверка подключения

1. Запустите backend сервер:
```bash
cd backend
npm install
npm run dev
```

2. В логах должно появиться:
```
✅ Подключение к PostgreSQL установлено успешно
📊 Синхронизация моделей завершена
✅ База данных инициализирована успешно
🚀 Сервер запущен на порту 5000
```

## Структура базы данных

После запуска сервера автоматически создадутся следующие таблицы:

- `users` - пользователи системы
- `tasks` - заявки на переезд
- `bids` - отклики исполнителей
- `messages` - сообщения чата
- `reviews` - отзывы

## Troubleshooting

### Ошибка подключения
```
ECONNREFUSED 127.0.0.1:5432
```
**Решение:** Убедитесь, что PostgreSQL запущен и работает на порту 5432

### Ошибка аутентификации
```
password authentication failed for user "postgres"
```
**Решение:** Проверьте правильность пароля в файле `.env`

### База данных не существует
```
database "luggo_db" does not exist
```
**Решение:** Создайте базу данных согласно инструкциям выше

### Ошибки прав доступа
```
permission denied to create database
```
**Решение:** Убедитесь, что пользователь `postgres` имеет права на создание баз данных

## Дополнительные команды

### Сброс базы данных
```sql
DROP DATABASE IF EXISTS luggo_db;
CREATE DATABASE luggo_db OWNER postgres;
```

### Просмотр таблиц
```bash
psql -U postgres -d luggo_db -c "\dt"
```

### Экспорт данных
```bash
pg_dump -U postgres luggo_db > luggo_backup.sql
```

### Импорт данных
```bash
psql -U postgres luggo_db < luggo_backup.sql
``` 