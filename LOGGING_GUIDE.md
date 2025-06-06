# 📝 Руководство по логированию в Luggo

## 🎯 Цель системы логирования

Обеспечить безопасное и эффективное логирование для разработки, не засоряя консоль пользователя и не утекая чувствительные данные.

## 📊 Уровни логирования

### Frontend (`frontend/src/utils/logger.js`)

| Уровень | Описание | Когда использовать | Отображается в dev |
|---------|----------|-------------------|-------------------|
| `ERROR` | Критические ошибки | Ошибки, которые ломают функциональность | ✅ Всегда |
| `WARN` | Предупреждения | Потенциальные проблемы | ✅ По умолчанию |
| `INFO` | Важная информация | Ключевые события в приложении | ✅ По умолчанию |
| `DEBUG` | Детальная отладка | API запросы, детали операций | ❌ Отключено |

## ✅ Правильное использование

### 🔴 Ошибки
```javascript
// ✅ Хорошо
try {
  await api.post('/tasks', data)
} catch (error) {
  logger.error('Ошибка создания заявки:', error.message)
}

// ❌ Плохо - утечка чувствительных данных
logger.error('Ошибка:', error, userData, apiTokens)
```

### ⚠️ Предупреждения
```javascript
// ✅ Хорошо
if (!user.email) {
  logger.warn('Пользователь без email пытается создать заявку')
}

// ❌ Плохо - не критично для warn
logger.warn('Загружаем список задач')
```

### ℹ️ Информация
```javascript
// ✅ Хорошо
logger.info('Пользователь авторизован')
logger.success('Заявка успешно создана')
logger.websocket('connect', 'Server connected')

// ❌ Плохо - слишком детально
logger.info('Загружаю заявки с параметрами:', detailedParams)
```

### 🔍 Отладка
```javascript
// ✅ Хорошо (не показывается пользователям)
logger.debug('API запрос:', method, url)
logger.debug('Ответ сервера:', sanitizedResponse)

// ❌ Плохо - чувствительные данные
logger.debug('Токен пользователя:', userToken)
```

## 🚫 Что НЕ нужно логировать

### ❌ Чувствительные данные
- Пароли и токены
- Персональные данные пользователей
- API ключи
- Детали платежей

### ❌ Избыточная информация
- Каждый API запрос в production
- Полные объекты ответов сервера
- Детали внутренней работы компонентов
- Дублирующиеся сообщения

### ❌ Обычные операции
```javascript
// ❌ Не нужно
logger.info('Рендерим компонент TaskCard')
logger.info('Обновляем state')
logger.info('Пользователь кликнул на кнопку')
```

## 🔧 Настройка уровня логирования

### В разработке
```javascript
// В консоли браузера можно изменить уровень:
logger.setLevel(3) // DEBUG - показать все
logger.setLevel(2) // INFO - по умолчанию
logger.setLevel(1) // WARN - только предупреждения и ошибки
logger.setLevel(0) // ERROR - только ошибки
```

### В production
- Автоматически отключается детальное логирование
- Показываются только критические ошибки
- Все логи отправляются в систему мониторинга

## 🎨 Специальные методы

### Пользовательские действия
```javascript
logger.userAction('task_created', user.id)
logger.userAction('bid_accepted', user.id)
```

### API вызовы
```javascript
logger.apiCall('POST', '/tasks', 201)
logger.apiCall('GET', '/users/profile', 200)
```

### WebSocket события
```javascript
logger.websocket('connect', serverUrl)
logger.websocket('disconnect', reason)
logger.websocket('error', errorMessage)
```

### Успешные операции
```javascript
logger.success('Заявка создана')
logger.success('Отклик отправлен')
```

## 📈 Мониторинг в production

В production все ошибки автоматически отправляются в систему мониторинга:

```javascript
// Автоматически отправляется в Sentry/LogRocket
reportError(new Error('Critical issue'), {
  userId: user.id,
  action: 'task_creation'
})
```

## 🔄 Миграция существующего кода

### Заменить:
- `console.log()` → `logger.debug()` или `logger.info()`
- `console.error()` → `logger.error()`
- `console.warn()` → `logger.warn()`

### Удалить:
- Дублирующиеся логи
- Логи обычных операций
- Логи с чувствительными данными

## 🎯 Итоговый результат

✅ **Чистая консоль** для пользователей
✅ **Безопасность** - нет утечек данных  
✅ **Эффективная отладка** для разработчиков
✅ **Мониторинг production** ошибок

---
*Обновлено: ${new Date().toISOString()}* 