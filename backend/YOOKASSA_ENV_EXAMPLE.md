# Переменные окружения для YooKassa

Добавьте следующие переменные в ваш `.env` файл:

```bash
# YooKassa настройки
YOOKASSA_SHOP_ID=your_shop_id_here
YOOKASSA_SECRET_KEY=your_secret_key_here

# Дополнительные настройки окружения
NODE_ENV=production
FRONTEND_URL=https://luggo.ru
```

## Где получить данные YooKassa:

1. Зарегистрируйтесь на https://yookassa.ru/
2. Создайте магазин
3. В настройках магазина найдите:
   - **shopId** - идентификатор магазина
   - **secretKey** - секретный ключ для API

## Настройка webhook:

В личном кабинете YooKassa настройте HTTP-уведомления:
- URL: `https://luggo.ru/api/subscription/webhook/yookassa`
- События: `payment.succeeded`, `payment.canceled`

## Тестовые данные:

Для тестирования используйте тестовые ключи из песочницы YooKassa. 