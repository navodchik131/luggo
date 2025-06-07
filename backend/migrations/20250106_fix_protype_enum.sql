-- Исправление enum типа для proType
-- Удаляем старый тип и создаем новый с правильным именем

-- Сначала изменяем колонку на VARCHAR
ALTER TABLE users ALTER COLUMN proType TYPE VARCHAR(20);

-- Удаляем старые типы если они существуют
DROP TYPE IF EXISTS pro_type_enum CASCADE;
DROP TYPE IF EXISTS "enum_users_proType" CASCADE;

-- Создаем правильный enum тип
CREATE TYPE "enum_users_proType" AS ENUM ('pro', 'pro_plus');

-- Применяем новый тип к колонке
ALTER TABLE users ALTER COLUMN proType TYPE "enum_users_proType" USING proType::"enum_users_proType";

-- Добавляем комментарий
COMMENT ON COLUMN users.proType IS 'Тип активной ПРО подписки'; 