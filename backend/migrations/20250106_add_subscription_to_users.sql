-- Добавление полей ПРО подписки в таблицу users
ALTER TABLE users ADD COLUMN hasPro BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN proExpiresAt TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN proType VARCHAR(20) NULL;

-- Добавление ENUM для proType
DO $$ BEGIN
    CREATE TYPE pro_type_enum AS ENUM ('pro', 'pro_plus');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE users ALTER COLUMN proType TYPE pro_type_enum USING proType::pro_type_enum;

-- Комментарии к полям
COMMENT ON COLUMN users.hasPro IS 'Есть ли активная ПРО подписка';
COMMENT ON COLUMN users.proExpiresAt IS 'Дата окончания ПРО подписки';
COMMENT ON COLUMN users.proType IS 'Тип активной ПРО подписки'; 