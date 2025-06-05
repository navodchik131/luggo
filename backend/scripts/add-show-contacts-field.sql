-- Добавляем поле showContacts в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "showContacts" BOOLEAN DEFAULT TRUE NOT NULL;

-- Добавляем комментарий к полю
COMMENT ON COLUMN users."showContacts" IS 'Показывать ли email и телефон другим пользователям';

-- Проверяем что поле добавлено
SELECT column_name, data_type, column_default, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'showContacts'; 