# 🚀 Luggo Production Deployment

## Полное переразвертывание с нуля

### ⚠️ ВНИМАНИЕ!
Этот скрипт **ПОЛНОСТЬЮ УДАЛЯЕТ** старую установку и создает новую. 
Все данные будут сохранены в резервных копиях.

## 📋 Предварительные требования

### На сервере должно быть установлено:
- ✅ Ubuntu 20.04+ 
- ✅ Node.js 18+
- ✅ PostgreSQL 12+
- ✅ Nginx
- ✅ PM2
- ✅ Git

## 🚀 Запуск деплоя

### 1. Подключение к серверу:
```bash
ssh root@147.45.213.104
```

### 2. Скачивание деплой скрипта:
```bash
cd /tmp
wget https://raw.githubusercontent.com/navodchik131/luggo/main/deploy/deploy.sh
chmod +x deploy.sh
```

### 3. Запуск деплоя:
```bash
./deploy.sh
```

### 4. После деплоя отредактируйте конфигурацию:
```bash
cd /home/luggo/luggo/backend
nano .env
```

**Обязательно замените:**
- `TELEGRAM_BOT_TOKEN` - получите от [@BotFather](https://t.me/BotFather)
- `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY` - из панели ЮKassa
- `EMAIL_USER` и `EMAIL_PASS` - настройки почты

### 5. Перезапуск после настройки:
```bash
pm2 restart luggo-backend
```

## 📊 Что происходит при деплое:

### 🛑 Остановка и очистка:
1. Остановка всех PM2 процессов
2. Резервное копирование старой БД и файлов
3. Удаление старой базы данных
4. Удаление старого кода

### 🔧 Создание новой инфраструктуры:
1. Создание новой БД `luggo_prod` с пользователем `luggo_user`
2. Клонирование свежего кода из GitHub
3. Установка зависимостей
4. Генерация безопасных паролей и JWT секретов
5. Настройка nginx конфигурации
6. Запуск через PM2

### ✅ Результат:
- 🌐 Сайт доступен по https://luggo.ru
- 🔐 Безопасная конфигурация БД
- 🤖 Готовый к настройке Telegram бот
- 💰 Готовая интеграция с ЮKassa
- 📊 Мониторинг через PM2
- 🚀 Автозапуск при перезагрузке

## 🔍 Проверка работы:

### Статус сервисов:
```bash
pm2 status
sudo systemctl status nginx
```

### Логи:
```bash
pm2 logs luggo-backend
tail -f /var/log/nginx/luggo_access.log
```

### Тестирование API:
```bash
curl https://luggo.ru/api/subscription/plans
```

## 🆘 Восстановление из резервной копии:

Если что-то пошло не так:

```bash
# Найти резервные копии
ls -la /home/luggo/backups/

# Восстановить БД
cd /home/luggo/backups/YYYYMMDD_HHMMSS/
sudo -u postgres psql luggo_prod < luggo_backup.sql

# Восстановить файлы
cp -r luggo_old /home/luggo/luggo
```

## 📞 Поддержка

При проблемах проверьте:
1. `pm2 logs luggo-backend` - логи приложения
2. `sudo nginx -t` - конфигурация nginx
3. `sudo systemctl status postgresql` - статус БД

## 🔧 Тонкая настройка

### SSL сертификат (Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d luggo.ru -d www.luggo.ru
```

### Автообновление сертификата:
```bash
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Настройка файрвола:
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
``` 