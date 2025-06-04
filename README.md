# Luggo - Платформа для переездов

Маркетплейс по типу fl.ru, специализирующийся на услугах по переезду (квартирный, офисный, межгород).

## Описание

Luggo - это платформа, которая соединяет заказчиков, нуждающихся в услугах переезда, с исполнителями (грузчики, водители, бригады по переезду). Платформа предоставляет функции создания заявок, системы откликов, чата в реальном времени, рейтинга и отзывов.

## Технологии

### Backend
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT аутентификация
- Socket.IO для чата
- bcryptjs для хеширования паролей
- Joi для валидации

### Frontend
- React 18
- Vite
- React Router DOM
- React Query
- Tailwind CSS
- Socket.IO Client
- Axios

## Быстрая установка

### Автоматическая установка

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
setup.bat
```

### Ручная установка

#### Требования
- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm или yarn

#### 1. Установка PostgreSQL

**Windows:**
- Скачайте с https://www.postgresql.org/download/windows/
- Установите с паролем `postgres` для пользователя `postgres`

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 2. Создание базы данных

```bash
# Подключение к PostgreSQL
psql -U postgres -h localhost

# Создание БД
CREATE DATABASE luggo_db OWNER postgres;
\q
```

#### 3. Настройка Backend

```bash
cd backend
npm install

# Создание файла .env
cp env.example .env
```

Отредактируйте `backend/.env`:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=luggo_db
DB_USER=postgres
DB_PASSWORD=postgres  # Ваш пароль PostgreSQL

# JWT секрет (измените в продакшене!)
JWT_SECRET=your_super_secret_jwt_key_here
```

#### 4. Настройка Frontend

```bash
cd frontend
npm install
```

#### 5. Запуск проекта

**Backend (терминал 1):**
```bash
cd backend
npm run dev
```

**Frontend (терминал 2):**
```bash
cd frontend
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## Структура проекта

```
luggo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── init.js
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── notFoundMiddleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Task.js
│   │   │   ├── Bid.js
│   │   │   ├── Message.js
│   │   │   ├── Review.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── bidRoutes.js
│   │   │   ├── messageRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   └── userRoutes.js
│   │   └── utils/
│   │       └── validation.js
│   ├── scripts/
│   │   └── setup-db.sql
│   ├── package.json
│   ├── server.js
│   ├── env.example
│   └── DATABASE_SETUP.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── TaskDetailPage.jsx
│   │   │   ├── CreateTaskPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
├── setup.sh (Linux/macOS)
├── setup.bat (Windows)
├── .gitignore
└── README.md
```

## Функциональность

### Для гостей
- Просмотр открытых заявок
- Регистрация и вход

### Для заказчиков
- Создание и редактирование заявок
- Просмотр откликов исполнителей
- Выбор исполнителя
- Общение с исполнителями через чат
- Оценка выполненной работы
- История заявок

### Для исполнителей
- Создание профиля с опытом и фото
- Поиск подходящих заявок
- Отклик на заявки с указанием цены
- Общение с заказчиками
- Получение уведомлений
- Накопление рейтинга и отзывов

### Для администраторов
- Просмотр всех заявок и пользователей
- Модерация контента
- Блокировка пользователей
- Просмотр статистики

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получение текущего пользователя

### Заявки
- `GET /api/tasks` - Список заявок
- `POST /api/tasks` - Создание заявки
- `GET /api/tasks/:id` - Детали заявки
- `PUT /api/tasks/:id` - Обновление заявки
- `DELETE /api/tasks/:id` - Удаление заявки

### Отклики
- `GET /api/bids/task/:taskId` - Отклики для заявки
- `POST /api/bids` - Создание отклика
- `PUT /api/bids/:id/accept` - Принятие отклика
- `PUT /api/bids/:id/reject` - Отклонение отклика

### Сообщения
- `GET /api/messages/task/:taskId` - Сообщения по заявке
- `POST /api/messages` - Отправка сообщения
- `PUT /api/messages/read/:taskId` - Отметка как прочитанное

### Отзывы
- `GET /api/reviews/user/:userId` - Отзывы пользователя
- `POST /api/reviews` - Создание отзыва
- `GET /api/reviews/task/:taskId` - Отзывы по заявке

## Модели данных

### User
- id, email, password, name, phone, avatar, role, rating, isBlocked

### Task
- id, title, description, fromAddress, toAddress, date, category, status, budget, userId, acceptedBidId

### Bid
- id, price, comment, taskId, userId, accepted, status

### Message
- id, text, taskId, senderId, receiverId, read, messageType, fileUrl

### Review
- id, rating, comment, taskId, authorId, targetId

## Troubleshooting

### Ошибки подключения к БД
```
ECONNREFUSED 127.0.0.1:5432
```
1. Убедитесь, что PostgreSQL запущен
2. Проверьте порт (по умолчанию 5432)
3. Проверьте настройки в `.env` файле

### Ошибки аутентификации
```
password authentication failed for user "postgres"
```
1. Проверьте пароль в `.env` файле
2. Сбросьте пароль PostgreSQL

### База данных не найдена
```
database "luggo_db" does not exist
```
1. Создайте базу данных: `CREATE DATABASE luggo_db;`
2. Или выполните скрипт: `psql -U postgres -f backend/scripts/setup-db.sql`

Подробные инструкции: `backend/DATABASE_SETUP.md`

## Безопасность

- Хеширование паролей с bcrypt
- JWT токены для аутентификации
- Валидация данных с Joi
- Rate limiting
- CORS настройки
- Helmet для безопасности заголовков

## Планы развития

- Калькулятор стоимости переезда
- Push-уведомления
- Подписки для исполнителей
- Мобильное приложение
- Интеграция с картами
- Система страхования
- SMS/Email уведомления

## Лицензия

MIT 