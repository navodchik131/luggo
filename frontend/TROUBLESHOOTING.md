# Frontend Troubleshooting

## Типичные ошибки и их решения

### TSConfckParseError: Failed to scan for dependencies

**Ошибка:**
```
TSConfckParseError: Failed to scan for dependencies from entries:
parsing C:/tsconfig.node.json failed: Error: ENOENT: no such file or directory
```

**Решение:**
Эта ошибка возникает, когда Vite ищет TypeScript конфигурацию в JavaScript проекте.

**Исправлено созданием файлов:**
- `jsconfig.json` - конфигурация для JavaScript проекта
- `.eslintrc.cjs` - конфигурация ESLint
- Обновлён `vite.config.js`

### Ошибки CORS

**Ошибка:**
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Решение:**
Убедитесь, что backend сервер запущен и настроен прокси в `vite.config.js`:
```js
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

### Проблемы с маршрутизацией React Router

**Ошибка:**
При перезагрузке страницы показывается 404.

**Решение:**
Убедитесь, что в `vite.config.js` настроен fallback:
```js
server: {
  historyApiFallback: true
}
```

### Ошибки hot reload

**Ошибка:**
Изменения в файлах не применяются автоматически.

**Решение:**
1. Проверьте, что файлы сохраняются
2. Перезапустите dev server
3. Очистите кеш браузера

### Медленная загрузка зависимостей

**Решение:**
Выполните:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Полезные команды

### Сброс проекта
```bash
cd frontend
rm -rf node_modules dist
npm install
npm run dev
```

### Проверка порта
```bash
netstat -an | findstr :5173
```

### Проверка процессов
```bash
tasklist | findstr node
```

### Принудительная остановка процесса
```bash
taskkill /f /im node.exe
``` 