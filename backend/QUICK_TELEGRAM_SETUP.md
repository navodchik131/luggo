# ⚡ Быстрая настройка Telegram бота на luggo.ru

## 🚀 За 2 минуты!

### 1. Подключение к серверу
```bash
ssh username@luggo.ru
cd /home/luggo/luggo/backend
```

### 2. Добавление токена Telegram (одна команда!)
```bash
echo "TELEGRAM_BOT_TOKEN=7386777652:AAEihENq6fLJQ-uKorx_3fLF-2VYIQEZngc" >> .env
```

### 3. Обновление кода и перезапуск
```bash
# Обновить код
git pull origin main

# Установить новые зависимости
npm install --production

# Перезапустить приложение
pm2 restart luggo-backend
```

### 4. Проверка работы
```bash
# Проверить логи
pm2 logs luggo-backend --lines 20

# Должно быть:
# ✅ Telegram webhook установлен: https://luggo.ru/webhook/telegram
# ✅ Telegram бот запущен
# 🚀 Сервер запущен на порту 3001
```

## 🎯 Проверка уведомлений

1. **Перейдите в Telegram** → найдите бота по токену
2. **Отправьте** `/start` боту
3. **Авторизуйтесь** через email/пароль от сайта (только исполнители)
4. **Выберите категории** уведомлений
5. **Создайте заявку** на https://luggo.ru
6. **Получите уведомление** с кнопкой на заявку!

## 🔧 Отладка (если что-то не работает)

```bash
# Проверить что токен добавился
grep TELEGRAM_BOT_TOKEN .env

# Проверить порт (должен быть 3001)
grep PORT .env

# Проверить что сервер слушает порт
netstat -tulnp | grep :3001

# Полные логи
pm2 logs luggo-backend

# Статус процесса
pm2 status
```

## 🆘 Проблемы и решения

**Проблема:** Webhook не устанавливается
```bash
# Проверить webhook вручную
curl -X POST "https://api.telegram.org/bot7386777652:AAEihENq6fLJQ-uKorx_3fLF-2VYIQEZngc/getWebhookInfo"
```

**Проблема:** Порт 3001 не слушается
```bash
# Убедиться что в .env PORT=3001
grep PORT .env

# Перезапустить с правильным портом
pm2 restart luggo-backend
```

**Проблема:** Уведомления не приходят
```bash
# Проверить логи при создании заявки
pm2 logs luggo-backend --lines 0

# Должно быть:
# 📲 Отправка Telegram уведомлений о новой заявке: [ID]
# 👥 Найдено X активных пользователей Telegram
```

---

**Время выполнения:** 2-3 минуты  
**Результат:** Работающие Telegram уведомления на https://luggo.ru! 🎉 