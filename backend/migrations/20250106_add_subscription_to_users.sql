-- Добавление полей ПРО подписки в таблицу users
ALTER TABLE users ADD COLUMN hasPro BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN proExpiresAt TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN proType VARCHAR(20) NULL;

-- Добавление ENUM для proType (используем имя как в Sequelize)
DO $$ BEGIN
    CREATE TYPE "enum_users_proType" AS ENUM ('pro', 'pro_plus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE users ALTER COLUMN proType TYPE "enum_users_proType" USING proType::"enum_users_proType";

-- Комментарии к полям
COMMENT ON COLUMN users.hasPro IS 'Есть ли активная ПРО подписка';
COMMENT ON COLUMN users.proExpiresAt IS 'Дата окончания ПРО подписки';
COMMENT ON COLUMN users.proType IS 'Тип активной ПРО подписки'; 