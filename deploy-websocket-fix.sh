#!/bin/bash

# Скрипт для деплоя исправлений WebSocket на продакшен

echo "🚀 Деплой исправлений WebSocket для Luggo..."

# 1. Коммитим изменения
echo "📝 Коммитим изменения..."
git add .
git commit -m "🔧 Fix WebSocket connection issues for production

- Improved Socket.IO configuration with multiple transports
- Added fallback from websocket to polling
- Enhanced error handling and reconnection logic
- Added nginx configuration for WebSocket proxy
- Added Socket.IO health check endpoint"

# 2. Пушим на GitHub
echo "📤 Пушим изменения на GitHub..."
git push origin main

echo "✅ Изменения отправлены на GitHub!"
echo ""
echo "🔧 СЛЕДУЮЩИЕ ШАГИ НА СЕРВЕРЕ:"
echo "1. ssh root@your-server"
echo "2. cd /path/to/luggo"
echo "3. git pull origin main"
echo "4. cd backend && npm install"
echo "5. pm2 restart luggo-backend"
echo "6. Скопировать nginx-websocket.conf в nginx конфиг"
echo "7. sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "🧪 ТЕСТИРОВАНИЕ:"
echo "- Откройте https://luggo.ru/api/socket-health"
echo "- Авторизуйтесь и проверьте консоль браузера"
echo "- Протестируйте чат между пользователями"
echo ""
echo "📞 После исправления WebSocket чат будет работать в реальном времени!" 