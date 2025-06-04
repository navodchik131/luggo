# Решение проблем Luggo

## 🚨 Ошибка "Маршрут /api/ не найден"

### Симптомы:
```
Error: Request failed with status code 500
{
  "success": false,
  "message": "Маршрут /api/ не найден"
}
```

### Причина:
Backend сервер не имел маршрута для корневого `/api/` пути, что приводило к ошибке 404/500.

### ✅ Решение:
1. **Добавлен корневой API маршрут** в `backend/server.js`:
```javascript
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Luggo API v1.0',
    // ... информация об endpoints
  });
});
```

2. **Исправлен middleware** `notFoundMiddleware.js` для корректной обработки 404 ошибок

3. **Улучшен health check** endpoint

## 🔧 Быстрый запуск проекта

### Windows:
```batch
# Запуск скрипта
start-dev.bat

# Или вручную:
# Терминал 1 (Backend):
cd backend
npm run dev

# Терминал 2 (Frontend):
cd frontend  
npm run dev
```

### PowerShell команды:
```powershell
# Backend
cd backend; npm run dev

# Frontend (новый терминал)
cd frontend; npm run dev
```

## 🧪 Тестирование API

### 1. Проверка backend:
- Перейдите на http://localhost:5000/api
- Должен вернуть информацию об API

### 2. Проверка frontend:
- Перейдите на http://localhost:5173/test-api
- Нажмите кнопки тестирования

### 3. Проверка создания заявки:
1. Зарегистрируйтесь/войдите в систему
2. Перейдите на /create-task
3. Заполните форму
4. Откройте консоль браузера (F12) для отладки

## 📋 Endpoints API

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api` | GET | Информация об API |
| `/api/health` | GET | Проверка работоспособности |
| `/api/auth/register` | POST | Регистрация |
| `/api/auth/login` | POST | Вход |
| `/api/tasks` | GET/POST | Заявки |
| `/api/tasks/:id` | GET/PUT/DELETE | Конкретная заявка |

## ⚠️ Частые проблемы

### 1. "Cannot read package.json"
```bash
# Убедитесь, что находитесь в правильной папке
pwd  # должно показать /c/job/luggo/backend или /c/job/luggo/frontend
```

### 2. Порт занят
```powershell
# Найти процесс
netstat -ano | findstr :5000

# Остановить процесс
taskkill /f /pid <PID>
```

### 3. База данных не подключается
```bash
# Проверить PostgreSQL
psql -U postgres -d luggo_db -c "SELECT current_database();"
```

### 4. CORS ошибки
- Убедитесь, что backend запущен на 5000, frontend на 5173
- Проверьте настройки CORS в `backend/server.js`

## 🔍 Отладка

### Логи backend:
- Консоль terminal где запущен `npm run dev`
- Проверьте подключение к БД при запуске

### Логи frontend:
- Консоль браузера (F12)
- Network tab для проверки запросов
- `/test-api` страница для тестирования

### Полезные команды:
```powershell
# Статус портов
netstat -an | findstr ":5000\|:5173"

# Процессы Node.js
tasklist | findstr node

# Остановить все Node.js
taskkill /f /im node.exe
``` 