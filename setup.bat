@echo off
chcp 65001 >nul

echo 🚀 Настройка проекта Luggo...

:: Проверка наличия Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен. Установите Node.js ^>= 18.0.0
    pause
    exit /b 1
)

:: Проверка наличия PostgreSQL
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL не установлен. Установите PostgreSQL
    pause
    exit /b 1
)

echo ✅ Node.js и PostgreSQL найдены

:: Установка зависимостей backend
echo 📦 Установка зависимостей backend...
cd backend
call npm install

:: Создание файла .env
if not exist .env (
    echo 📝 Создание файла .env...
    copy env.example .env
    echo ✅ Файл .env создан из env.example
) else (
    echo ✅ Файл .env уже существует
)

cd ..

:: Установка зависимостей frontend
echo 📦 Установка зависимостей frontend...
cd frontend
call npm install
cd ..

:: Создание базы данных
echo 🗄️ Создание базы данных luggo_db...
psql -U postgres -h localhost -c "CREATE DATABASE luggo_db OWNER postgres;" 2>nul || echo База данных уже существует или произошла ошибка

echo ✅ Настройка завершена!
echo.
echo 📋 Следующие шаги:
echo 1. Убедитесь, что PostgreSQL запущен
echo 2. Проверьте настройки в backend\.env
echo 3. Запустите backend: cd backend ^&^& npm run dev
echo 4. Запустите frontend: cd frontend ^&^& npm run dev
echo.
echo 📚 Подробные инструкции: backend\DATABASE_SETUP.md

pause 