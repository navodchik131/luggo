-- Создание базы данных Luggo
-- Выполните этот скрипт от имени суперпользователя PostgreSQL

-- Создание базы данных (если не существует)
CREATE DATABASE luggo_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Russian_Russia.1251'
    LC_CTYPE = 'Russian_Russia.1251'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Переключение на базу данных luggo_db
\c luggo_db;

-- Создание расширений (если нужны)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Предоставление прав пользователю postgres
GRANT ALL PRIVILEGES ON DATABASE luggo_db TO postgres;

-- Информация о созданной базе данных
SELECT 'База данных luggo_db успешно создана!' as status; 