@echo off
echo ===== Запуск Luggo Development Servers =====

echo.
echo Запускаю Backend сервер...
start "Backend" cmd /k "cd backend && npm run dev"

echo.
echo Ожидание запуска backend...
timeout /t 3 /nobreak > nul

echo.
echo Запускаю Frontend сервер...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Ожидание запуска frontend...
timeout /t 3 /nobreak > nul

echo.
echo Открываю браузер...
start http://localhost:5173

echo.
echo ===== Серверы запущены! =====
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Test API: http://localhost:5173/test-api
echo.
echo Для остановки серверов закройте окна терминалов
pause 