# 🌐 Настройка домена для Luggo

## 🛒 Покупка домена

### Рекомендуемые регистраторы:
1. **Cloudflare** - $8-12/год, лучшие DNS, бесплатный SSL
2. **Namecheap** - $10-15/год, простота, хорошая поддержка  
3. **Reg.ru** - от 150₽/год, русский интерфейс

### Варианты доменов:
- `luggo.com` - основной (если свободен)
- `luggo.ru` - для России
- `move-luggo.com` - если основной занят
- `myluggo.com` - альтернатива

## ⚙️ Настройка DNS записей

### Вариант 1: Поддомены (рекомендуется)
```dns
# Основной сайт на Vercel
luggo.com.          A     76.76.19.19 (IP от Vercel)
www.luggo.com.      CNAME luggo.com.

# API на Railway  
api.luggo.com.      CNAME your-backend.railway.app.

# Дополнительно
mail.luggo.com.     CNAME mail-service.com.
cdn.luggo.com.      CNAME cdn-service.com.
```

### Вариант 2: Все на одном домене
```dns
luggo.com.          A     76.76.19.19 (Vercel)
www.luggo.com.      CNAME luggo.com.
```

## 🔧 Настройка в сервисах

### Vercel:
1. Dashboard → Project → Settings → Domains
2. Add Domain: `luggo.com`
3. Add Domain: `www.luggo.com`
4. Vercel покажет нужные DNS записи
5. Добавьте их в панели домена

### Railway:
1. Dashboard → Project → Settings → Domains  
2. Add Domain: `api.luggo.com`
3. Railway покажет CNAME запись
4. Добавьте в панели домена

### Обновите переменные окружения:

#### Vercel:
```env
VITE_API_URL=https://api.luggo.com/api
```

#### Railway:
```env
CORS_ORIGIN=https://luggo.com
FRONTEND_URL=https://luggo.com
```

## 🛡️ SSL сертификаты

### Автоматически:
- **Vercel**: автоматически выпускает Let's Encrypt
- **Railway**: автоматически выпускает SSL
- **Cloudflare**: бесплатный SSL + CDN

### Проверка SSL:
```bash
# Проверьте что работает HTTPS
curl -I https://luggo.com
curl -I https://api.luggo.com/api/health
```

## 📧 Настройка email (опционально)

### Простой вариант (Cloudflare Email Routing):
1. В Cloudflare включите Email Routing
2. Добавьте правила переадресации:
   - `info@luggo.com` → ваш email
   - `support@luggo.com` → ваш email
   - `noreply@luggo.com` → ваш email

### MX записи:
```dns
luggo.com.    MX    10    isaac.mx.cloudflare.net.
luggo.com.    MX    20    linda.mx.cloudflare.net.
luggo.com.    MX    30    amir.mx.cloudflare.net.
```

## 🚀 Последовательность настройки

### 1. Купите домен (5 минут)
- Выберите регистратора
- Купите домен
- Получите доступ к панели DNS

### 2. Настройте DNS (15 минут)
- Добавьте A запись для основного домена
- Добавьте CNAME для www и api
- Дождитесь распространения (5-60 минут)

### 3. Добавьте домены в сервисы (10 минут)
- Vercel: добавьте основной домен и www
- Railway: добавьте api поддомен
- Проверьте SSL сертификаты

### 4. Обновите переменные окружения (5 минут)
- Vercel: обновите VITE_API_URL
- Railway: обновите CORS_ORIGIN
- Redeploy оба сервиса

### 5. Протестируйте (10 минут)
- Откройте https://luggo.com
- Проверьте API: https://api.luggo.com/api/health
- Протестируйте авторизацию
- Проверьте создание заявок

## 🔍 Отладка проблем

### Домен не открывается:
```bash
# Проверьте DNS
nslookup luggo.com
dig luggo.com

# Проверьте статус в Vercel/Railway
```

### API не работает:
```bash
# Проверьте поддомен
nslookup api.luggo.com
curl https://api.luggo.com/api/health
```

### CORS ошибки:
1. Убедитесь что CORS_ORIGIN точно совпадает
2. Проверьте нет ли www в адресе
3. Убедитесь что протокол https://

## 💰 Примерная стоимость домена

### В год:
- `.com` - $8-15
- `.ru` - 150-500₽  
- `.io` - $30-50
- `.org` - $10-20

### Дополнительные услуги:
- DNS управление - бесплатно (Cloudflare)
- SSL сертификат - бесплатно (Let's Encrypt)
- Email переадресация - бесплатно (Cloudflare)
- **Итого: $8-15/год для полной настройки**

## 🎯 Результат

После настройки у вас будет:
- ✅ `https://luggo.com` - основной сайт
- ✅ `https://www.luggo.com` - перенаправление на основной  
- ✅ `https://api.luggo.com/api` - API бэкенд
- ✅ `info@luggo.com` - рабочий email
- ✅ SSL сертификаты везде
- ✅ CDN для быстрой загрузки

Готово! Теперь у вас профессиональный домен для платформы Luggo 🚀 