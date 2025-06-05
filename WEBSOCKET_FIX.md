# Устранение проблем с WebSocket на продакшене

## 🔍 Проблема
WebSocket connection to 'wss://luggo.ru/socket.io/?EIO=4&transport=websocket' failed

## 🛠️ Решение

### 1. Обновление конфигурации бэкенда (ВЫПОЛНЕНО)
- ✅ Добавлена поддержка multiple transports (websocket + polling)
- ✅ Улучшены настройки для работы за прокси
- ✅ Увеличены таймауты для стабильности

### 2. Обновление конфигурации фронтенда (ВЫПОЛНЕНО)
- ✅ Добавлена поддержка fallback на polling
- ✅ Улучшена обработка ошибок и переподключений
- ✅ Добавлено логирование для отладки

### 3. 🚨 ТРЕБУЕТСЯ: Настройка nginx на сервере

**Скопируйте конфигурацию из файла `nginx-websocket.conf` в ваш nginx конфиг**

Ключевые моменты для nginx:

```nginx
# ОБЯЗАТЕЛЬНО: WebSocket проксирование
location /socket.io/ {
    proxy_pass http://localhost:5000/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... остальные настройки
}
```

### 4. 📋 Чек-лист для проверки

1. **Проверьте переменную окружения на сервере:**
   ```bash
   echo $FRONTEND_URL
   # Должно быть: https://luggo.ru
   ```

2. **Перезапустите бэкенд с новой конфигурацией:**
   ```bash
   pm2 restart luggo-backend
   # или
   systemctl restart luggo-backend
   ```

3. **Примените новую конфигурацию nginx:**
   ```bash
   sudo nginx -t  # Проверить конфигурацию
   sudo systemctl reload nginx
   ```

4. **Проверьте, что Socket.IO отвечает:**
   ```bash
   curl -i https://luggo.ru/socket.io/
   # Должен вернуть ответ Socket.IO
   ```

### 5. 🔧 Тестирование

После применения изменений:

1. Откройте консоль браузера на https://luggo.ru
2. Авторизуйтесь
3. Проверьте логи:
   - `🟢 WebSocket подключен к: https://luggo.ru`
   - `🔗 Transport: polling` (сначала polling)
   - `⬆️ Upgraded to websocket` (потом upgrade)

### 6. 🐛 Если проблемы остаются

**Проверьте логи nginx:**
```bash
tail -f /var/log/nginx/error.log
```

**Проверьте логи бэкенда:**
```bash
pm2 logs luggo-backend
```

**Временное решение (если WebSocket всё ещё не работает):**
Можно использовать только polling transport на фронтенде:

```javascript
// В useSocket.js временно изменить:
transports: ['polling'], // Убрать 'websocket'
```

### 7. 🔒 Безопасность

Убедитесь, что SSL сертификат настроен правильно для wss:// соединений.

## 📞 Поддержка чата

После исправления WebSocket проблем:
- ✅ Чат будет работать в реальном времени
- ✅ Уведомления будут приходить мгновенно
- ✅ Пользователи смогут общаться без перезагрузки страницы

## 🎯 Приоритет исправления: ВЫСОКИЙ

WebSocket необходим для:
- Чатов между заказчиками и исполнителями
- Push-уведомлений в реальном времени
- Обновления статусов заказов 