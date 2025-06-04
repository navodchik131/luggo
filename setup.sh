#!/bin/bash

echo "🚀 Настройка проекта Luggo..."

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js >= 18.0.0"
    exit 1
fi

# Проверка наличия PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL не установлен. Установите PostgreSQL"
    exit 1
fi

echo "✅ Node.js и PostgreSQL найдены"

# Установка зависимостей backend
echo "📦 Установка зависимостей backend..."
cd backend
npm install

# Создание файла .env
if [ ! -f .env ]; then
    echo "📝 Создание файла .env..."
    cp env.example .env
    echo "✅ Файл .env создан из env.example"
else
    echo "✅ Файл .env уже существует"
fi

cd ..

# Установка зависимостей frontend
echo "📦 Установка зависимостей frontend..."
cd frontend
npm install
cd ..

# Создание базы данных
echo "🗄️ Создание базы данных luggo_db..."
psql -U postgres -h localhost -c "CREATE DATABASE luggo_db OWNER postgres;" 2>/dev/null || echo "База данных уже существует или произошла ошибка"

echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Убедитесь, что PostgreSQL запущен"
echo "2. Проверьте настройки в backend/.env"
echo "3. Запустите backend: cd backend && npm run dev"
echo "4. Запустите frontend: cd frontend && npm run dev"
echo ""
echo "📚 Подробные инструкции: backend/DATABASE_SETUP.md" 