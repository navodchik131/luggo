# 🚀 Инструкция по деплою Luggo на production сервер

## 📋 Что было обновлено в этом релизе:

### ✅ Безопасность и оптимизация логирования:
- 🔒 **Устранены утечки данных** - заменено 200+ небезопасных console.log
- 🎨 **Умная система логирования** с уровнями (ERROR, WARN, INFO, DEBUG)
- 🧹 **Чистая консоль** для пользователей - убран технический шум
- 📱 **Только важные события** отображаются по умолчанию
- 🛡️ **Production-ready** безопасность

### 🔧 Технические исправления:
- ✅ **Backend стабилизирован** - исправлены ES6/CommonJS конфликты
- ✅ **WebSocket оптимизирован** - меньше шумных сообщений
- ✅ **Производительность улучшена** - меньше операций логирования
- ✅ **Тесты перенесены** в админ-панель (/admin/tests)

### 📚 Документация:
- 📝 **LOGGING_GUIDE.md** - руководство по логированию для команды
- 🔒 **SECURITY_REPORT.md** - отчет о мерах безопасности

## 🖥️ Команды для обновления на сервере:

### 1. Подключение к серверу:
```bash
ssh root@luggo.ru
```

### 2. Переход в директорию проекта:
```bash
cd /var/www/luggo
```

### 3. Получение обновлений:
```bash
git pull origin main
```

### 4. Обновление backend зависимостей:
```bash
cd backend
npm install
```

### 5. Обновление frontend и пересборка:
```bash
cd ../frontend
npm install
npm run build
```

### 6. Перезапуск backend через PM2:
```bash
pm2 restart luggo-backend
pm2 status
```

### 7. Обновление nginx (если нужно):
```bash
# Проверка конфигурации
nginx -t

# Перезагрузка nginx
systemctl reload nginx
```

### 8. Проверка работоспособности:
```bash
# Проверка backend
curl http://localhost:3001/api/health

# Проверка frontend
curl -I https://luggo.ru

# Проверка логов
pm2 logs luggo-backend --lines 20
```

## 👑 Создание администратора:

### Способ 1: Создание нового админа (рекомендуемый)
```bash
cd /var/www/luggo/backend
node scripts/createAdmin.js
```

**Дефолтные данные:**
- Email: `admin@luggo.ru`
- Пароль: `LuggoAdmin2025!`
- Имя: `Главный Администратор`

### Способ 2: Создание админа с кастомными данными
```bash
cd /var/www/luggo/backend
node scripts/createAdmin.js --email=boss@luggo.ru --password=SecurePass123 --name="Иван Петров"
```

### Способ 3: Повышение существующего пользователя
```bash
cd /var/www/luggo/backend
node scripts/promoteToAdmin.js user@example.com
```

### 📋 После создания администратора:
1. Зайти на https://luggo.ru/login
2. Войти с указанными email и паролем
3. Перейти в админ-панель: https://luggo.ru/admin
4. **ВАЖНО**: Сменить пароль в профиле на более безопасный!

## 🔍 Что проверить после деплоя:

### ✅ Frontend (https://luggo.ru):
- [ ] Сайт открывается без ошибок
- [ ] Консоль браузера чистая (только важные сообщения)
- [ ] Регистрация/вход работает
- [ ] Создание заявок функционирует
- [ ] WebSocket подключение установлено

### ✅ Backend API:
- [ ] `/api/health` отвечает статусом 200
- [ ] `/api/socket-health` показывает WebSocket готовность
- [ ] Авторизация работает корректно
- [ ] База данных подключена

### ✅ Admin панель (для админов):
- [ ] `/admin/tests` доступна только админам
- [ ] Все тесты API проходят успешно
- [ ] Система мониторинга работает
- [ ] Админ может управлять пользователями и заявками

## 🚨 В случае проблем:

### Backend не запускается:
```bash
pm2 logs luggo-backend
pm2 restart luggo-backend
```

### Frontend не обновился:
```bash
cd /var/www/luggo/frontend
npm run build
# Очистка кэша nginx
systemctl reload nginx
```

### База данных:
```bash
# Проверка подключения к PostgreSQL
sudo -u postgres psql -c "SELECT version();"
```

### Проблемы с созданием админа:
```bash
# Проверка подключения к базе данных
cd /var/www/luggo/backend
node -e "require('./src/config/init').initializeDatabase().then(() => console.log('DB OK')).catch(console.error)"

# Проверка существующих админов
node -e "
require('dotenv').config();
require('./src/config/init').initializeDatabase().then(async () => {
  const { User } = require('./src/models');
  const admins = await User.findAll({ where: { role: 'admin' } });
  console.log('Существующие админы:', admins.map(a => a.email));
  process.exit(0);
});"
```

## 📊 Мониторинг:

- **PM2 Dashboard**: `pm2 monit`
- **Nginx логи**: `/var/log/nginx/error.log`
- **System логи**: `journalctl -u nginx -f`

## 🎯 Ожидаемые улучшения:

✅ **Безопасность**: Нет утечек чувствительных данных в логах
✅ **UX**: Чистая консоль для пользователей  
✅ **DX**: Лучшая отладка для разработчиков
✅ **Производительность**: Оптимизированное логирование
✅ **Стабильность**: Исправлены критические ошибки backend
✅ **Администрирование**: Удобные скрипты создания админов

---
*Деплой от: ${new Date().toISOString()}*
*Версия: Production v1.2 - Security & Logging Optimization* 

Как обновлять на сервере

# 1. Обновляем код
ssh root@luggo.ru
cd /home/luggo/luggo
git pull origin main

# 2. Устанавливаем зависимости
cd frontend && npm install
cd ../backend && npm install

# 3. Добавляем SEO роуты в backend/server.js
# Нужно добавить: app.use('/', require('./src/routes/seoRoutes'))

# 4. Пересобираем frontend
cd frontend && npm run build

# 5. Перезапускаем backend
pm2 restart luggo-backend

# 6. Устанавливаем SSL
sudo certbot --nginx -d luggo.ru -d www.luggo.ru

на локальном сервере
git add -A
git commit -m "🌱 FEAT: Система наполнения платформы демо-данными"
git status
git push origin main