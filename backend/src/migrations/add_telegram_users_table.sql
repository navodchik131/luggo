-- Создание таблицы telegram_users
CREATE TABLE IF NOT EXISTS telegram_users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6)))),
  telegramId VARCHAR(255) NOT NULL UNIQUE,
  telegramUsername VARCHAR(255) DEFAULT NULL,
  telegramFirstName VARCHAR(255) NOT NULL,
  userId VARCHAR(36) DEFAULT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  subscribedCategories TEXT DEFAULT '[]',
  lastActiveAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegramId ON telegram_users(telegramId);
CREATE INDEX IF NOT EXISTS idx_telegram_users_userId ON telegram_users(userId);
CREATE INDEX IF NOT EXISTS idx_telegram_users_isActive ON telegram_users(isActive); 