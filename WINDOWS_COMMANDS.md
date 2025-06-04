# Команды для Windows (PowerShell)

## 🔧 Важные отличия PowerShell от Bash

В PowerShell используется другой синтаксис команд по сравнению с Linux/macOS:

### ❌ НЕ работает в PowerShell:
```bash
cd frontend && npm run dev    # Ошибка: && не поддерживается
```

### ✅ Правильно в PowerShell:
```powershell
cd frontend; npm run dev      # Используйте ; как разделитель
# или выполняйте команды отдельно:
cd frontend
npm run dev
```

## 🚀 Основные команды для запуска проекта

### Первоначальная настройка:
```powershell
# Установка зависимостей backend
cd backend
npm install

# Создание .env файла
copy env.example .env

# Возврат в корень и установка frontend
cd ..
cd frontend  
npm install

# Возврат в корень
cd ..
```

### Запуск проектов:

**Backend (терминал 1):**
```powershell
cd backend
npm run dev
```

**Frontend (терминал 2):**
```powershell
cd frontend
npm run dev
```

### Альтернативный способ (один терминал):
```powershell
# Запуск backend в фоне (только для тестирования)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Запуск frontend
cd frontend
npm run dev
```

## 🔍 Полезные команды для диагностики

### Проверка запущенных портов:
```powershell
netstat -an | findstr :5000    # Backend
netstat -an | findstr :5173    # Frontend
```

### Проверка процессов Node.js:
```powershell
tasklist | findstr node
```

### Принудительная остановка процессов:
```powershell
taskkill /f /im node.exe        # Остановить все Node.js процессы
taskkill /f /pid 1234           # Остановить процесс по ID
```

### Открытие приложения в браузере:
```powershell
start http://localhost:5173     # Frontend
start http://localhost:5000     # Backend API
```

## 📁 Работа с файлами

### Копирование файлов:
```powershell
copy env.example .env           # Копировать файл
```

### Создание папки:
```powershell
mkdir uploads                   # Создать папку
```

### Удаление файлов и папок:
```powershell
Remove-Item -Recurse node_modules    # Удалить папку с содержимым
Remove-Item package-lock.json        # Удалить файл
```

## 🔄 Команды для сброса проекта

### Полный сброс frontend:
```powershell
cd frontend
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

### Полный сброс backend:
```powershell
cd backend  
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

## 🐛 Устранение проблем

### Если порт занят:
```powershell
# Найти процесс на порту 5173
netstat -ano | findstr :5173

# Остановить процесс (замените PID на реальный)
taskkill /f /pid <PID>
```

### Очистка npm кеша:
```powershell
npm cache clean --force
```

### Проверка версий:
```powershell
node --version
npm --version
psql --version
```

## 📝 Примеры команд для Luggo

### Создание базы данных:
```powershell
psql -U postgres -h localhost -c "CREATE DATABASE luggo_db OWNER postgres;"
```

### Запуск SQL скрипта:
```powershell
psql -U postgres -h localhost -f backend\scripts\setup-db.sql
```

### Проверка подключения к БД:
```powershell
psql -U postgres -d luggo_db -c "SELECT current_database();"
```

## 💡 Советы по использованию PowerShell

1. **Используйте табуляцию** для автодополнения путей и команд
2. **Копирование/вставка**: Ctrl+C / Ctrl+V или щелчок правой кнопкой
3. **История команд**: Используйте ↑ и ↓ для навигации по истории
4. **Очистка экрана**: `cls` или `Clear-Host`
5. **Справка по команде**: `Get-Help <команда>` или `<команда> -?`

## ⚡ Быстрые сочетания клавиш

- `Ctrl + C` - Остановить выполнение команды
- `Tab` - Автодополнение
- `↑/↓` - История команд  
- `Ctrl + R` - Поиск в истории команд
- `F7` - Графическая история команд 